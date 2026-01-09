import { useState } from "react";
import type { DeleteReactionRequest, ReactionMap } from "../types/reactions";
import { buildReactionMap } from "../utils/reactions";
import {
  fetchFindReactions,
  createReaction,
  deleteReaction,
} from "../api/reactions.api";
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
      console.error(err);
      toast.error("Unable to create reaction!");
      // Simplest rollback is to reload
      loadReactions(data.gsfGroupId);
    }
  }

  async function removeReaction(data: DeleteReactionRequest) {
    try {
      setReactions((prev) => {
        const currentFind = prev[data.findId];
        if (!currentFind || !currentFind[data.emoji]) return prev;

        const currentEmojiData = currentFind[data.emoji];
        const newCount = currentEmojiData.count - 1;
        const newAccounts = currentEmojiData.accounts.filter(
          (acc) => acc !== data.accountName
        );

        // If count hits 0, remove the emoji key entirely
        if (newCount <= 0) {
          const newFindReactions = { ...currentFind };
          delete newFindReactions[data.emoji];
          return {
            ...prev,
            [data.findId]: newFindReactions,
          };
        }

        // Otherwise decrement count and update accounts list
        return {
          ...prev,
          [data.findId]: {
            ...currentFind,
            [data.emoji]: {
              count: newCount,
              accounts: newAccounts,
            },
          },
        };
      });

      await deleteReaction(data);
    } catch (err) {
      // Rollback if API fails
      console.error(err);
      toast.error("Failed to remove reaction");
      loadReactions(data.gsfGroupId);
    }
  }

  return {
    reactions,
    setReactions,
    loadReactions,
    saveReaction,
    removeReaction,
  };
}
