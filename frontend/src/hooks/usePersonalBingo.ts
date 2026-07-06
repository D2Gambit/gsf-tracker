import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  fetchPersonalBingoBoard,
  fetchPersonalBingoSummary,
  completePersonalBingoItem,
  uncompletePersonalBingoItem,
} from "../api/personalBingo.api";
import type { PersonalBingoItem, PersonalBingoSummary } from "../types/list";

export function usePersonalBingo() {
  const [items, setItems] = useState<PersonalBingoItem[]>([]);
  const [summary, setSummary] = useState<PersonalBingoSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (gsfGroupId: string, accountName: string) => {
    setLoading(true);
    try {
      setItems(await fetchPersonalBingoBoard(gsfGroupId, accountName));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to load personal bingo",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSummary = useCallback(async (gsfGroupId: string) => {
    try {
      setSummary(await fetchPersonalBingoSummary(gsfGroupId));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to load bingo summary",
      );
    }
  }, []);

  // ...complete/uncomplete unchanged, but bump summary locally so % updates without a refetch:

  const complete = async (
    personalBingoItemId: number,
    gsfGroupId: string,
    accountName: string,
    requestingAccount: string,
  ) => {
    try {
      const progress = await completePersonalBingoItem(
        personalBingoItemId,
        gsfGroupId,
        accountName,
        requestingAccount,
      );
      setItems((prev) =>
        prev.map((i) =>
          i.id === personalBingoItemId ? { ...i, progress } : i,
        ),
      );
      setSummary((prev) => bumpSummary(prev, accountName, 1));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to complete item",
      );
    }
  };

  const uncomplete = async (
    personalBingoItemId: number,
    gsfGroupId: string,
    accountName: string,
    requestingAccount: string,
  ) => {
    try {
      await uncompletePersonalBingoItem(
        personalBingoItemId,
        gsfGroupId,
        accountName,
        requestingAccount,
      );
      setItems((prev) =>
        prev.map((i) =>
          i.id === personalBingoItemId ? { ...i, progress: null } : i,
        ),
      );
      setSummary((prev) => bumpSummary(prev, accountName, -1));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to uncomplete item",
      );
    }
  };

  return { items, summary, loading, load, loadSummary, complete, uncomplete };
}

function bumpSummary(
  prev: PersonalBingoSummary | null,
  accountName: string,
  delta: number,
): PersonalBingoSummary | null {
  if (!prev) return prev;
  const existing = prev.counts.find((c) => c.accountName === accountName);
  const counts = existing
    ? prev.counts.map((c) =>
        c.accountName === accountName
          ? { ...c, completedCount: c.completedCount + delta }
          : c,
      )
    : [...prev.counts, { accountName, completedCount: delta }];
  return { ...prev, counts };
}
