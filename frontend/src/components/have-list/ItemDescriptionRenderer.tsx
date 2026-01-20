import type { ParsedItem } from "../../types/list";
import {
  getQualityColor,
  getTitleColor,
  materialName,
} from "../../utils/colors";
import { determineIfMaterial } from "../../utils/strings";
export type ItemLineType =
  | "header"
  | "stat"
  | "range"
  | "socket"
  | "requirement"
  | "flavor";

export interface ParsedItemLine {
  itemStatLine: string;
  type: ItemLineType;
}

/**
 * Renders item description — parsing only happens here.
 * - If description is an array, render each entry on its own line.
 * - If description is a ParsedItem object, format its stats.
 * - Otherwise, split on commas/newlines and render each part on its own line.
 */

export default function ItemDescriptionRenderer({
  description,
  className,
  itemName: itemNameProp,
  foundBy,
  quality,
}: {
  description?: string | string[] | ParsedItem;
  className?: string;
  itemName?: string;
  foundBy?: string;
  quality?: string;
}) {
  if (!description) {
    return (
      <span className={className ?? "italic"}>No description provided.</span>
    );
  }

  let parts: { text: string; className: string }[] = [];
  let parsedName: string | undefined;
  let isMaterial = false;

  const safeValueToString = (value: any) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number")
      return String(value);
    if (Array.isArray(value))
      return value
        .filter((v) => v != null)
        .map(String)
        .join(" ");
    return Object.values(value)
      .filter((v) => v !== null && v !== undefined && v !== "")
      .map(String)
      .join(" ");
  };

  const getLineClassName = (
    text: string,
    lineQuality?: string,
    isLineCorrupted?: boolean,
    isMat?: boolean
  ) => {
    // If a specified quality is provided (e.g. for socketed item headers), use it
    if (lineQuality) return getTitleColor(lineQuality);

    // Corrupted logic (explicit flag or text detection)
    if (isLineCorrupted || text === "Corrupted" || text.includes("*")) {
      return "text-red-400 font-semibold";
    }

    if (isMat) {
      return "text-gray-300";
    }

    return "text-blue-400";
  };

  if (typeof description === "object" && !Array.isArray(description)) {
    // already-parsed payload
    const parsedItem = description as ParsedItem;
    parsedName = parsedItem.name;
    let foundCorrupt = !!parsedItem.corrupted;

    const stats = parsedItem.stats || [];

    stats.forEach((stat: any) => {
      if (!stat?.name) return;
      const name = String(stat.name);

      // detect corrupt/evil force lines but don't emit them now
      // This logic is moved to itemParser.ts, but is kept here for backwards compatibility
      if (name.includes("Corrupt") || name.includes("evil force")) {
        foundCorrupt = true;
        return;
      }

      const valStr = safeValueToString(stat.value);
      let line = [valStr, name].filter(Boolean).join(" ");

      if (stat.corrupted) {
        line += "*";
      }

      if (line) {
        parts.push({
          text: line,
          className: getLineClassName(
            line,
            stat.quality,
            stat.corrupted,
            false
          ),
        });
      }
    });

    // append single "Corrupted Item" line at the start if any corrupt lines were detected
    if (foundCorrupt) {
      parts.unshift({
        text: "Corrupted",
        className: "text-red-400 font-semibold",
      });
    }
  } else {
    // Legacy String / Array Handling
    let rawStrings: string[] = [];

    if (Array.isArray(description)) {
      rawStrings = description;
    } else {
      const itemStats = description.trim();

      try {
        const parsed = JSON.parse(itemStats);
        isMaterial = determineIfMaterial(parsed);
        if (isMaterial) {
          parsedName = parsed.type ?? parsed.name ?? undefined;
          rawStrings.push(`Quantity: ${parsed.quantity}`);
        } else {
          rawStrings = itemStats
            .split(/,(?![^(]*\))/)
            .map((s) => s.trim())
            .filter(Boolean);

          if (itemStats.includes("\n")) {
            const lines = itemStats
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean);
            if (lines.length > 1) {
              parsedName = lines[0];
              rawStrings = lines.slice(1);
            }
          }
        }
      } catch {
        rawStrings = itemStats
          .split(/,(?![^(]*\))/)
          .map((s) => s.trim())
          .filter(Boolean);

        if (itemStats.includes("\n")) {
          const lines = itemStats
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
          if (lines.length > 1) {
            parsedName = lines[0];
            rawStrings = lines.slice(1);
          }
        }
      }
    }

    // Convert raw strings to RenderParts
    parts = rawStrings.map((s) => ({
      text: s,
      className: getLineClassName(s, undefined, undefined, isMaterial),
    }));
  }

  const actualName = itemNameProp ?? parsedName;

  return (
    <div className={className}>
      {actualName && (
        <div
          className={`text-center mb-1 font-bold bg-opacity-0 text-lg drop-shadow-[1px_1px_1px_black] ${
            quality === "Unique"
              ? "text-orange-300"
              : isMaterial &&
                materialName.redName.some((name) => actualName.includes(name))
              ? "text-red-500"
              : isMaterial &&
                materialName.whiteName.some((name) => actualName.includes(name))
              ? "text-white"
              : isMaterial &&
                materialName.tealName.some((name) => actualName.includes(name))
              ? "text-teal-600"
              : isMaterial &&
                materialName.goldName.some((name) => actualName.includes(name))
              ? "text-orange-200"
              : isMaterial
              ? "text-orange-400"
              : getTitleColor(quality || "Normal")
          } `}
        >
          {actualName}
        </div>
      )}
      {foundBy && (
        <div className="text-center mb-2 text-gray-400 text-xs drop-shadow-[1px_1px_1px_black]">
          Found by: {foundBy}
        </div>
      )}
      {parts.map((part, i) => (
        <div
          className={`text-center mb-0.5 drop-shadow-[1px_1px_1px_black] ${part.className}`}
          key={i}
        >
          {part.text}
        </div>
      ))}
    </div>
  );
}
