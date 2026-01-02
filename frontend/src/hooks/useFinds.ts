import { useState } from "react";
import { fetchFinds, createFind } from "../api/finds.api";
import { toast } from "react-toastify";
import type { LootItem, LootUploadItem } from "../types/loot";

export function useFinds() {
  const [items, setItems] = useState<LootItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadFinds(groupId: string) {
    try {
      setLoading(true);
      setItems(await fetchFinds(groupId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to fetch finds");
    } finally {
      setLoading(false);
    }
  }

  async function saveFind(find: LootUploadItem) {
    try {
      const res = await createFind(find);

      setItems([res, ...items]);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to upload find!"
      );
    }
  }

  return { items, setItems, saveFind, loading, loadFinds };
}
