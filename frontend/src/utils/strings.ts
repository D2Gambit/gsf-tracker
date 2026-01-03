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
    return !!(parsed && Array.isArray(parsed.stats));
  } catch {
    return false;
  }
}
