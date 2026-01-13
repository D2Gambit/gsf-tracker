import type { ParsedItem } from "../types/list";

export function truncate(s?: string, max = 30) {
  if (!s) return "";
  return s.length > max ? s.slice(0, max) + "..." : s;
}

// normalize a description so ItemModal/ItemDescriptionRenderer gets either
// a ParsedItem or a plain string. returns { description, name? }
export function normalizeDescriptionForModal(
  rawDesc: string | undefined,
  fallbackName?: string
) {
  const itemDesc = (rawDesc ?? "").trim();
  if (!itemDesc)
    return { description: "No description provided.", name: fallbackName };

  try {
    const parsed = JSON.parse(itemDesc);
    if (parsed?.stats && Array.isArray(parsed.stats)) {
      return {
        description: parsed as ParsedItem,
        name: parsed.name ?? fallbackName,
      };
    }
  } catch {
    // console.error("Description is not valid JSON, treating as raw text.");
  }

  // fallback: return raw string (kept as-is for renderer to split/format)
  return { description: itemDesc, name: fallbackName };
}

// detect if saved description is a parsed JSON payload (from clipboard)
export function hasParsedDescription(rawDesc?: string) {
  if (!rawDesc) return false;
  try {
    const parsed = JSON.parse(rawDesc);
    return !!((parsed && Array.isArray(parsed.stats)) || parsed.type);
  } catch {
    return false;
  }
}

// detect if the parsed item is a material
export function determineIfMaterial(parsedItem: {
  name: string;
  quantity: string;
}) {
  if (!parsedItem) return false;

  const qty = Number(parsedItem.quantity);
  const name = parsedItem.name;

  // If the parsed item does NOT have a "name" field, and has a "quantity" field which is a number between 1 and 50, the item is a material
  return !name && !Number.isNaN(qty) && qty >= 1 && qty <= 50;
}

// detect if the parsed item is a charm
export function determineIfCharm(parsedItem: { name: string; type: string }) {
  if (!parsedItem) return false;

  const type = parsedItem.type;
  const name = parsedItem.name;

  // If the parsed item has a "name" field and a "type" field that includes the word "Charm", the item is a charm
  return name && type && type.includes("Charm");
}

// detect if the parsed item is a map
export function determineIfMap(parsedItem: { name: string; type: string }) {
  if (!parsedItem) return false;

  const type = parsedItem.type;
  const name = parsedItem.name;

  // If the parsed item has a "name" field and a "type" field that includes the word "Map", the item is a map
  return name && type && type.includes("Map");
}