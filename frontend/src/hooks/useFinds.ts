import { useState } from "react";
import { fetchFinds, createFind, fetchHotFinds } from "../api/finds.api";
import { toast } from "react-toastify";
import type { LootItem, LootUploadItem } from "../types/loot";

export function useFinds() {
  const [items, setItems] = useState<LootItem[]>([]);
  const [hotItems, setHotItems] = useState<LootItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<{
    createdAt: string;
    id: string;
  } | null>(null);
  const [hasMore, setHasMore] = useState(true);

  async function loadFinds(groupId: string, reset = false) {
    if (!hasMore && !reset) return;

    try {
      setLoading(true);

      const res = await fetchFinds(
        groupId,
        9,
        cursor ? JSON.stringify(cursor) : undefined,
      );

      setItems((prev) => {
        if (reset) return res.items;

        const map = new Map(prev.map((i) => [i.id, i]));
        res.items.forEach((i) => map.set(i.id, i));
        return Array.from(map.values());
      });

      setCursor(res.nextCursor);
      setHasMore(Boolean(res.nextCursor));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to fetch finds");
    } finally {
      setLoading(false);
    }
  }

  async function loadHotFinds(groupId: string) {
    try {
      setLoading(true);

      const res = await fetchHotFinds(groupId);
      const _hotItems = res.map((item) => {
        return {
          name: item.name,
          id: item.id,
          description: item.description,
          foundBy: item.foundBy,
          imageUrl: item.imageUrl,
          createdAt: item.createdAt,
          quality: item.quality,
        };
      });
      setHotItems(_hotItems);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to fetch hot finds",
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveFind(find: LootUploadItem) {
    try {
      const res = await createFind(find);
      setItems((prev) => [res, ...prev]);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to upload find!",
      );
    }
  }

  return {
    items,
    setItems,
    hotItems,
    loading,
    hasMore,
    loadFinds,
    loadHotFinds,
    saveFind,
  };
}
