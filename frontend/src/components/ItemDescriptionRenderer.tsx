export type ParsedItem = {
  name?: string;
  stats: { name: string; value?: string | number | any }[];
};

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

  let parts: string[] = [];
  let parsedName: string | undefined;

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

  if (typeof description === "object" && !Array.isArray(description)) {
    // already-parsed payload
    const parsedItem = description as ParsedItem;
    parsedName = parsedItem.name;

    let foundCorrupt = false;

    parts = (parsedItem.stats || [])
      .map((stat) => {
        if (!stat?.name) return undefined;
        const name = String(stat.name);
        // detect corrupt/evil force lines but don't emit them now
        if (name.includes("Corrupt") || name.includes("evil force")) {
          foundCorrupt = true;
          return undefined;
        }
        const valStr = safeValueToString(stat.value);
        const line = [valStr, name].filter(Boolean).join(" ");
        return line || undefined;
      })
      .filter(Boolean) as string[];

    // append single "Corrupted Item" line at the end if any corrupt lines were detected
    if (foundCorrupt) {
      parts.push("Corrupted Item");
    }
  } else if (Array.isArray(description)) {
    parts = description;
  } else {
    // string fallback
    const itemStats = description.trim();
    parts = itemStats
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
        parts = lines.slice(1);
      }
    }
  }

  const finalName = itemNameProp ?? parsedName;

  const getQualityColor = (qual?: string) => {
    switch (qual) {
      case "Normal":
        return "text-gray-300";
      case "Magic":
        return "text-blue-300";
      case "Rare":
        return "text-yellow-300";
      case "Set":
        return "text-green-300";
      case "Unique":
        return "text-orange-300";
      default:
        return "text-yellow-300";
    }
  };

  return (
    <div className={className}>
      {finalName && (
        <div
          className={`text-center mb-1 font-bold text-lg drop-shadow-[1px_1px_1px_black] ${getQualityColor(
            quality
          )}`}
        >
          {finalName}
        </div>
      )}
      {foundBy && (
        <div className="text-center mb-2 text-gray-400 text-xs drop-shadow-[1px_1px_1px_black]">
          Found by: {foundBy}
        </div>
      )}
      {parts.map((part, i) => (
        <div
          className={`text-center mb-0.5 drop-shadow-[1px_1px_1px_black] ${
            part === "Corrupted Item"
              ? "text-red-400 font-semibold"
              : "text-blue-400"
          }`}
          key={i}
        >
          {part}
        </div>
      ))}
    </div>
  );
}
