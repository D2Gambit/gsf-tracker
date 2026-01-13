import {
  determineIfCharm,
  determineIfMaterial,
  determineIfMap,
} from "./strings";

export interface ParsedItemResult {
  name?: string;
  quality?: string;
  description: string;
  isMap: boolean;
}

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
        // but we don't want to save these lines to the DB.
        if (
          name.includes("Corrupt") ||
          name.includes("evil force") ||
          name.includes("ÿc1Corrupted")
        ) {
          isCorrupted = true;
          return false; // Remove from array
        }
        return true; // Keep line
      });

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

        // Fix + to Class Skill Levels stat
        if (stat.skill) {
          return {
            name: stat.skill,
            value: stat.value,
          };
        }
        return stat;
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
