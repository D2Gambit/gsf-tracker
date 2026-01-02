import type { ReactionRow, ReactionMap } from "../types/reactions";

export function buildReactionMap(rows: ReactionRow[]): ReactionMap {
  return rows.reduce((acc, row) => {
    acc[row.findId] ??= {};
    acc[row.findId][row.emoji] ??= {
      count: 0,
      accounts: [],
    };

    acc[row.findId][row.emoji].count += 1;
    acc[row.findId][row.emoji].accounts.push(row.accountName);

    return acc;
  }, {} as ReactionMap);
}

export function totalReactions(map: ReactionMap, findId: string) {
  return Object.values(map[findId] ?? {}).reduce(
    (sum, entry) => sum + entry.count,
    0
  );
}
