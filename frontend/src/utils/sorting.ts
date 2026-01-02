import type { LootItem } from "../types/loot";
import type { ReactionMap } from "../types/reactions";
import { totalReactions } from "./reactions";

export function sortLootWithTopReactions(
  items: LootItem[],
  reactions: ReactionMap,
  topN = 3
) {
  const sortedByReactions = [...items]
    .sort(
      (a, b) =>
        totalReactions(reactions, b.id) - totalReactions(reactions, a.id)
    )
    .slice(0, topN);

  const remaining = items.filter(
    (i) => !sortedByReactions.some((s) => s.id === i.id)
  );

  return [...sortedByReactions, ...remaining];
}
