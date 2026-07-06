import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { fetchBingoBoard, claimBingo, unclaimBingo } from "../api/bingo.api";
import type { BingoItem } from "../types/list";

export function useBingo() {
  const [items, setItems] = useState<BingoItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (gsfGroupId: string) => {
    setLoading(true);
    try {
      setItems(await fetchBingoBoard(gsfGroupId));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to load bingo board",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const claim = async (
    bingoItemId: number,
    gsfGroupId: string,
    accountName: string,
  ) => {
    try {
      const newClaim = await claimBingo(bingoItemId, gsfGroupId, accountName);
      setItems((prev) =>
        prev.map((i) =>
          i.id === bingoItemId ? { ...i, claims: [...i.claims, newClaim] } : i,
        ),
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to claim square",
      );
    }
  };

  const unclaim = async (
    claimId: number,
    bingoItemId: number,
    accountName: string,
  ) => {
    try {
      await unclaimBingo(claimId, accountName);
      setItems((prev) =>
        prev.map((i) =>
          i.id === bingoItemId
            ? { ...i, claims: i.claims.filter((c) => c.id !== claimId) }
            : i,
        ),
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to unclaim square",
      );
    }
  };

  return { items, loading, load, claim, unclaim };
}
