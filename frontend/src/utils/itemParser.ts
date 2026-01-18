import {
  determineIfCharm,
  determineIfMaterial,
  determineIfMap,
} from "./strings";

import { STAT_DATA, type StatDefinition } from "./statData";

export interface ParsedItemResult {
  name?: string;
  quality?: string;
  description: string;
  isMap: boolean;
}

/**
 * Helper to ensure a value has a + sign if positive and requested.
 */
const formatValue = (val: number, forceSign: boolean = false): string => {
  if (forceSign && val > 0) return `+${val}`;
  return String(val);
};

/**
 * Helper to resolve the secondary description string.
 * Handles specific translation keys found in the CSV.
 */
const resolveString2 = (ds2: string | undefined): string => {
  if (!ds2) return "";

  // Mapping known internal keys to human readable format based on previous logic
  if (ds2 === "increaseswithplaylevelX") {
    return "(Based on Character Level)";
  }
  if (ds2 === "increaseswithenergy") {
    return "(Based on Energy)";
  }

  // For other keys (e.g. "ExtraShadow"), return as-is or spaced
  return ds2;
};

/**
 * Returns a formatted string based on stat ID rules (descfunc) and placement (descval) from statData.ts.
 */
const getStatDescription = (stat: any): string => {
  // Handle explicit Skills (e.g., "+3 to War Cry")
  // These often don't match a specific Stat ID in the general table effectively
  if (stat.skill && typeof stat.value === "number") {
    return `+${stat.value} to ${stat.skill}`;
  }

  // Edge Case: Stats with no value (e.g., Auras in JSON sometimes lack 'value')
  // If there is no value, just return the name provided by the JSON.
  if (stat.value === undefined || stat.value === null) {
    return stat.name || "";
  }

  // Lookup Stat Data
  const def =
    typeof stat.stat_id === "number" ? STAT_DATA[stat.stat_id] : undefined;

  // If no ID or ID not in our database, use a smart fallback
  if (!def) {
    if (stat.value !== undefined && stat.value !== null) {
      const name = stat.name || "";
      // Check for specific strings or patterns
      if (name.startsWith("%")) {
        // Case: "% Enhanced Damage" -> "+240% Enhanced Damage"
        // We concatenate directly to avoid a space between number and %
        return `${formatValue(stat.value, true)}${name}`;
      }
      // Generic Fallback: "+10 Strength"
      return `${formatValue(stat.value, true)} ${name}`;
    }
    return stat.name || "";
  }

  const { f: func, v: valType, ds2, op, op_param } = def;
  const val = stat.value;
  const name = stat.name || "";
  const string2 = resolveString2(ds2);

  // --- SPECIAL HANDLING FUNCTIONS ---
  // These functions have complex strings that don't fit the generic Val/Name/Suffix pattern.

  // Func 11: Repairs Durability
  if (func === 11) {
    return `Repairs 1 Durability in ${Math.floor(100 / val)} Seconds`;
  }

  // Func 13/14: Skill Levels (Positioning is hardcoded in D2 usually)
  if (func === 13 || func === 14) {
    return `${formatValue(val, true)} ${name}`;
  }

  // Func 15: Chance to Cast (Name usually contains the full text)
  if (func === 15) {
    return name;
  }

  // Func 16: Aura
  if (func === 16) {
    if (name.includes("Aura")) return name;
    return `Level ${val} ${name} Aura When Equipped`;
  }

  // Func 19: Sockets
  if (func === 19) {
    return `${val} ${name}`;
  }

  // Func 24: Charges
  if (func === 24) {
    if (stat.max && stat.value) {
      return `Level ${stat.level || "?"} ${name} (${stat.value}/${
        stat.max
      } Charges)`;
    }
    return name;
  }

  // Func 27/28: Skills
  if (func === 27 || func === 28) {
    return `+${val} to ${name}`;
  }

  // --- GENERIC FORMATTING LOGIC ---

  // Calculate Effective Display Value
  // Ops 2, 4, and 5 are calculated as: (statvalue * basevalue) / (2 ^ op_param)
  // For static display, basevalue is treated as 1 (e.g. "Per Level").
  let displayVal = val;
  if ((op === 2 || op === 4 || op === 5) && typeof op_param === "number") {
    displayVal = val / Math.pow(2, op_param);
  }

  // Determine the Formatted Value String based on Func (f)
  let valStr = "";

  switch (func) {
    case 1: // +[value]
    case 6: // +[value] (Per Level)
    case 12: // +[value]
      valStr = formatValue(displayVal, true);
      break;

    case 2: // [value]%
    case 7: // [value]% (Per Level)
      // Note: Standard D2 implies NO sign for f=2/7, though f=4/8 have signs.
      // This fixes "Slows Target by 20%" vs "+20%".
      valStr = `${displayVal}%`;
      break;

    case 3: // [value]
    case 9: // [value]
      valStr = String(displayVal);
      break;

    case 4: // +[value]%
    case 8: // +[value]% (Per Level)
      valStr = `${formatValue(displayVal, true)}%`;
      break;

    case 5: // [val*100/128]%
    case 10:
      valStr = `${Math.floor((displayVal * 100) / 128)}%`;
      break;

    case 20: // [val * -1]% (Enemy Res)
      valStr = `${displayVal * -1}%`;
      break;

    case 21: // [val * -1]
      valStr = `${displayVal * -1}`;
      break;

    case 22: // [val]%
    case 23:
      valStr = `${displayVal}%`;
      break;

    default:
      // Default fallback
      valStr = formatValue(displayVal, true);
      break;
  }

  // Determine the Description text (Name + Optional Suffix)
  const descText = string2 ? `${name} ${string2}`.trim() : name;

  // EXCEPTION: Stat ID 74 (Replenish Life)
  // If negative, it becomes "Drain Life" and the value is shown after the text.
  if (stat.stat_id === 74 && val < 0) {
    return `Drain Life ${Math.abs(val)}`;
  }

  // Assemble based on Value Type (v)
  switch (valType) {
    case 0: // Hide Value
      return descText;
    case 1: // Value Before: "+10 Strength"
      return `${valStr} ${descText}`;
    case 2: // Value After: "Slows Target by 20%"
      return `${descText} ${valStr}`;
    default:
      return `${valStr} ${descText}`;
  }
};

/**
 * Helper to check if a specific group of stats exists, are equal,
 * and should be consolidated into a single line.
 */
const consolidateStats = (
  stats: any[],
  targetIds: number[],
  formatter: (val: number) => string
): any[] => {
  // Find all stats that match the target IDs
  const found = stats.filter((s: any) => targetIds.includes(s.stat_id));

  // We only consolidate if ALL target IDs are present
  if (found.length === targetIds.length) {
    const firstVal = found[0].value;
    // Check if all values are identical
    const allEqual = found.every((s: any) => s.value === firstVal);

    if (allEqual) {
      // Remove the individual lines
      const newStats = stats.filter((s: any) => !targetIds.includes(s.stat_id));

      // Check for corruption on source stats
      const isCorrupted = found.some((s: any) => s.corrupted);

      // Add the consolidated line
      // We use a string ID (or a reserved negative ID) to prevent
      // getStatDescription from trying to re-format this later.
      newStats.push({
        name: formatter(firstVal),
        value: null,
        stat_id: "consolidated",
        ...(isCorrupted ? { corrupted: 1 } : {}),
      });

      return newStats;
    }
  }

  return stats;
};

/**
 * Helper to consolidate Min/Max pairs (e.g. Elemental Damage).
 */
const consolidateRangeStats = (
  stats: any[],
  minId: number,
  maxId: number,
  formatter: (min: number, max: number) => string
): any[] => {
  const minStat = stats.find((s: any) => s.stat_id === minId);
  const maxStat = stats.find((s: any) => s.stat_id === maxId);

  // Proceed only if both Min and Max stats exist
  if (minStat && maxStat) {
    // Remove the individual min/max lines
    const newStats = stats.filter(
      (s: any) => s.stat_id !== minId && s.stat_id !== maxId
    );

    // Check for corruption
    const isCorrupted = minStat.corrupted || maxStat.corrupted;

    // Add the consolidated line
    newStats.push({
      name: formatter(minStat.value, maxStat.value),
      value: null,
      stat_id: -999, // dummy ID to prevent re-formatting
      ...(isCorrupted ? { corrupted: 1 } : {}),
    });

    return newStats;
  }

  return stats;
};

/**
 * Helper to consolidate Magic Damage (Ids 52 & 53).
 * Uses the 'range' property for values instead of 'value'.
 */
const consolidateMagicStats = (stats: any[]): any[] => {
  const minStat = stats.find((s: any) => s.stat_id === 52);
  const maxStat = stats.find((s: any) => s.stat_id === 53);

  if (minStat && maxStat && minStat.range) {
    // Use range.min and range.max from the first stat (they appear to be identical)
    const minVal = minStat.range.min;
    const maxVal = minStat.range.max;

    const formattedString = `Adds ${minVal}-${maxVal} Magic Damage`;

    // Check for corruption
    const isCorrupted = minStat.corrupted || maxStat.corrupted;

    const newStats = stats.filter(
      (s: any) => s.stat_id !== 52 && s.stat_id !== 53
    );

    newStats.push({
      name: formattedString,
      value: null,
      stat_id: -999,
      ...(isCorrupted ? { corrupted: 1 } : {}),
    });

    return newStats;
  }
  return stats;
};

/**
 * Helper to calculate and consolidate Poison Damage.
 * Requires IDs: 57 (Min), 58 (Max), 59 (Length).
 */
const consolidatePoisonStats = (stats: any[]): any[] => {
  const minStat = stats.find((s: any) => s.stat_id === 57);
  const maxStat = stats.find((s: any) => s.stat_id === 58);
  const lenStat = stats.find((s: any) => s.stat_id === 59);

  if (minStat && maxStat && lenStat) {
    const lengthVal = lenStat.value;
    const minRaw = minStat.value;
    const maxRaw = maxStat.value;

    // Formula: Int((dmgvalue / 256) * length)
    const finalMin = Math.round((minRaw / 256) * lengthVal);
    const finalMax = Math.round((maxRaw / 256) * lengthVal);

    // Length Formula: Int(value / 25)
    const seconds = Math.round(lengthVal / 25);

    let formattedString = "";
    if (finalMin === finalMax) {
      formattedString = `+${finalMin} Poison Damage over ${seconds} seconds`;
    } else {
      formattedString = `Adds ${finalMin}-${finalMax} Poison Damage over ${seconds} seconds`;
    }

    // Check for corruption
    const isCorrupted =
      minStat.corrupted || maxStat.corrupted || lenStat.corrupted;

    // Remove the 3 source lines
    const newStats = stats.filter(
      (s: any) => ![57, 58, 59].includes(s.stat_id)
    );

    newStats.push({
      name: formattedString,
      value: null,
      stat_id: -999,
      ...(isCorrupted ? { corrupted: 1 } : {}),
    });

    return newStats;
  }
  return stats;
};

/**
 * Parses pasted text (usually JSON) and extracts item details.
 * @param text The raw text string pasted by the user.
 * @param currentQuality The current form quality (fallback if JSON doesn't have one).
 * @param currentName The current form name (fallback if JSON doesn't have one).
 */
export const parseItemText = (
  text: string,
  currentQuality: string = "",
  currentName: string = ""
): ParsedItemResult => {
  try {
    const parsedItem = JSON.parse(text);

    const isMaterial = determineIfMaterial(parsedItem);
    const isCharm = determineIfCharm(parsedItem);
    const isMap = determineIfMap(parsedItem);

    let nameVal = "";
    let qualityVal = parsedItem.quality ?? currentQuality ?? "";
    let isCorrupted = false;
    let corruptionStatFound = false;

    // determine the item name and quality
    if (isMaterial) {
      // material: use type as name and tag as Materials
      nameVal = String(parsedItem.type ?? "");
      qualityVal = "Materials";
    } else if (isCharm) {
      qualityVal = "Charms";
      nameVal =
        parsedItem.name + (parsedItem.type ? " - " + parsedItem.type : "");
    } else {
      if (parsedItem.name) {
        nameVal =
          parsedItem.name + (parsedItem.type ? " - " + parsedItem.type : "");
      } else if (parsedItem.type) {
        nameVal = parsedItem.type;
      } else {
        nameVal = currentName;
      }
      qualityVal = parsedItem.quality ?? currentQuality ?? "";
    }

    if (parsedItem.stats?.length > 0) {
      // Filter out garbage data from the JSON and flag if the item is corrupted
      parsedItem.stats = parsedItem.stats.filter((stat: any) => {
        const name = String(stat.name || "");
        // If we find these lines, we know the item is corrupted,
        if (name.includes("Corrupt") || name.includes("ÿc1Corrupted")) {
          isCorrupted = true;
          return false;
        }
        // Remove redundant Enhanced Maximum (17) and Minimum (18) Damage
        // These are usually calculation helpers for the main "Enhanced Damage" stat
        if (stat.stat_id === 17 || stat.stat_id === 18) {
          return false;
        }
        return true;
      });

      // Fix for missing stat_id for Strength (ID 0 is often omitted in JSON)
      parsedItem.stats.forEach((stat: any) => {
        if (
          (stat.stat_id === undefined || stat.stat_id === null) &&
          (stat.name === "to Strength" || stat.name === "Strength")
        ) {
          stat.stat_id = 0;
        }
      });

      // --- Consolidations ---
      // Attributes: Strength(0), Energy(1), Dexterity(2), Vitality(3)
      parsedItem.stats = consolidateStats(
        parsedItem.stats,
        [0, 1, 2, 3],
        (val) => `+${val} to all Attributes`
      );

      // Resistances: Fire(39), Light(41), Cold(43), Poison(45)
      parsedItem.stats = consolidateStats(
        parsedItem.stats,
        [39, 41, 43, 45],
        (val) => `All Resistances +${val}`
      );

      // Physical Damage: Min(21), Max(22)
      parsedItem.stats = consolidateRangeStats(
        parsedItem.stats,
        21,
        22,
        (min, max) => `Adds ${min}-${max} Damage`
      );

      // Fire Damage: Min(48), Max(49)
      parsedItem.stats = consolidateRangeStats(
        parsedItem.stats,
        48,
        49,
        (min, max) => `Adds ${min}-${max} Fire Damage`
      );

      // Lightning Damage: Min(50), Max(51)
      parsedItem.stats = consolidateRangeStats(
        parsedItem.stats,
        50,
        51,
        (min, max) => `Adds ${min}-${max} Lightning Damage`
      );

      // Cold Damage: Min(54), Max(55)
      parsedItem.stats = consolidateRangeStats(
        parsedItem.stats,
        54,
        55,
        (min, max) => `Adds ${min}-${max} Cold Damage`
      );

      // Magic Damage: Min(52), Max(53)
      // Note: Uses special logic to read values from 'range' property
      parsedItem.stats = consolidateMagicStats(parsedItem.stats);

      // Poison Damage: Min(57), Max(58), Length(59)
      parsedItem.stats = consolidatePoisonStats(parsedItem.stats);

      // Remove any leftover "evil force" (ID 59) that wasn't consumed by poison logic.
      parsedItem.stats = parsedItem.stats.filter((stat: any) => {
        // If it's ID 59 or named "an evil force" and still here, kill it.
        if (
          stat.stat_id === 59 ||
          (stat.name && stat.name.includes("evil force"))
        ) {
          return false;
        }
        return true;
      });

      // --- Main Formatting Loop ---
      parsedItem.stats = parsedItem.stats.map((stat: any) => {
        // Fix Corrupted flag missing on a stat for certain items.
        // Determine if the stat range is above the max value for the item
        if (
          (parsedItem.quality === "Unique" || parsedItem.quality === "Set") &&
          stat.range &&
          typeof stat.range.max === "number" &&
          typeof stat.value === "number"
        ) {
          if (stat.value > stat.range.max) {
            stat.corrupted = 1;
            isCorrupted = true;
          }
        }

        // Track if we found the corrupted stat
        if (stat.corrupted) {
          corruptionStatFound = true;
        }

        // If this stat was already consolidated (ID -999), skip re-formatting
        if (stat.stat_id === -999) {
          return stat;
        }

        // Fix + to Class Skill Levels stat (ID 83 often needs name cleanup)
        if (stat.skill) {
          // We reconstruct this completely to avoid duplication
          return {
            name: `+${stat.value} to ${stat.skill}`,
            value: null,
            skill: stat.skill,
            ...(stat.corrupted ? { corrupted: 1 } : {}),
          };
        }

        // Apply formatting based on Stat ID rules
        // This overrides the simple "value + name" default of the frontend
        const formattedName = getStatDescription(stat);
        if (formattedName) {
          return {
            ...stat,
            name: formattedName,
            value: null, // Clear value so frontend doesn't double-render (e.g. "30 +30 to Strength")
          };
        }

        return stat;
      });
    }

    // Add Ethereal Line
    if (parsedItem.isEthereal) {
      parsedItem.stats.push({
        name: "Ethereal (Cannot be Repaired)",
        value: null,
        stat_id: -999, // Use dummy ID to prevent re-processing
      });
    }

    // Add Sockets Line
    if (parsedItem.sockets && parsedItem.sockets > 0) {
      if (!parsedItem.stats) parsedItem.stats = [];

      // If the item is corrupted, but we haven't found a specific stat that triggered it,
      // assume the sockets are the result of corruption.
      const socketsAreCorrupted = isCorrupted && !corruptionStatFound;

      parsedItem.stats.push({
        name: `Socketed (${parsedItem.sockets})`,
        value: null,
        stat_id: -999,
        ...(socketsAreCorrupted ? { corrupted: 1 } : {}),
      });
    }

    if (isCorrupted) {
      parsedItem.corrupted = true;
    }

    return {
      name: nameVal,
      quality: qualityVal,
      description: JSON.stringify(parsedItem),
      isMap: !!isMap,
    };
  } catch (e) {
    // Return fallback state if not JSON
    return {
      description: text,
      isMap: false,
    };
  }
};
