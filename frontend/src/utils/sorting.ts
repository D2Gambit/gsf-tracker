import type { LootItem } from "../types/loot";

export function removeHotItems(items: LootItem[], hotItems: LootItem[]) {
  const hotIds = new Set(hotItems.map((i) => i.id));
  return items.filter((item) => !hotIds.has(item.id));
}
