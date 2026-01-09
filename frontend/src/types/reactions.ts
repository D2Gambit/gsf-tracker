export type ReactionRow = {
  id: string;
  gsfGroupId: string;
  findId: string;
  accountName: string;
  emoji: string;
  createdAt: string;
};

export type DeleteReactionRequest = {
  gsfGroupId: string;
  findId: string;
  accountName: string;
  emoji: string;
};

export type ReactionEntry = {
  count: number;
  accounts: string[];
};

export type ReactionCounts = Record<string, ReactionEntry>;
export type ReactionMap = Record<string, ReactionCounts>;
