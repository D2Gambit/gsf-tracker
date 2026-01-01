import { useState } from "react";
import type { ReactionMap } from "../types/reactions";
import { buildReactionMap } from "../utils/reactions";
import { fetchFindReactions, createReaction } from "../api/reactions.api";
import { toast } from "react-toastify";

export function useReactions() {
  const [reactions, setReactions] = useState<ReactionMap>({});

  async function loadReactions(groupId: string) {
    try {
      const rows = await fetchFindReactions(groupId);
      setReactions(buildReactionMap(rows));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to fetch reactions!"
      );
    }
  }

  async function saveReaction(data: {
    gsfGroupId: string;
    findId: string;
    accountName: string;
    emoji: string;
  }) {
    try {
      setReactions((prev) => ({
        ...prev,
        [data.findId]: {
          ...(prev[data.findId] ?? {}),
          [data.emoji]: {
            count: (prev[data.findId]?.[data.emoji]?.count ?? 0) + 1,
            accounts: [
              ...(prev[data.findId]?.[data.emoji]?.accounts ?? []),
              data.accountName,
            ],
          },
        },
      }));

      await createReaction(data);
    } catch (err) {
      // rollback
      setReactions((prev) => {
        const copy = { ...prev };
        if (copy[data.findId]?.[data.emoji]?.count === 1) {
          delete copy[data.findId][data.emoji];
        } else {
          copy[data.findId][data.emoji].count--;
        }
        return copy;
      });
      toast.error(
        err instanceof Error ? err.message : "Unable to create reaction!"
      );
    }
  }

  return {
    reactions,
    setReactions,
    loadReactions,
    saveReaction,
  };
}
