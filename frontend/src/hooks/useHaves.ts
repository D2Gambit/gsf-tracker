import { useState } from "react";
import {
  addHave,
  deleteHave,
  fetchHaveItems,
  toggleReserved,
} from "../api/haves.api";
import { toast } from "react-toastify";
import type { AddHaveItemRequest, HaveItem } from "../types/list";

export function useHaves() {
  const [haveItems, setHaveItems] = useState<HaveItem[]>([]);
  const [loading, setLoading] = useState(false);
  //   const [cursor, setCursor] = useState<{
  //     createdAt: string;
  //     id: string;
  //   } | null>(null);
  //   const [hasMore, setHasMore] = useState(true);

  const userInfo = localStorage.getItem("gsfUserInfo");
  const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;

  async function loadHaves(groupId: string, reset = false) {
    // if (!hasMore && !reset) return;

    try {
      setLoading(true);

      const res = await fetchHaveItems(groupId);

      setHaveItems((prev) => {
        if (reset) return res.items;

        const map = new Map(prev.map((i) => [i.id, i]));
        res.forEach((i) => map.set(i.id, i));
        return Array.from(map.values());
      });

      //   setCursor(res.nextCursor);
      //   setHasMore(Boolean(res.nextCursor));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to fetch have list!"
      );
    } finally {
      setLoading(false);
    }
  }

  async function addHaveItem(item: AddHaveItemRequest, editItemId: string) {
    try {
      const res = await addHave(item);
      if (editItemId) {
        deleteHaveItem(editItemId);
      }
      setHaveItems([
        res,
        ...haveItems.filter((item) => editItemId !== item.id),
      ]);
      editItemId
        ? toast.success("Sucessfully editted item!")
        : toast.success("Sucessfully added item!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to add item!");
    }
  }

  async function deleteHaveItem(itemId: string) {
    try {
      const res = await deleteHave(itemId);
      setHaveItems((items) => items.filter((item) => item.id !== itemId));
      toast.success("Item successfully deleted!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete item!"
      );
    }
  }

  async function toggleReservation(itemId: string) {
    try {
      const selectedItem = haveItems.find((item) => item.id === itemId);
      const res = await toggleReserved(
        itemId,
        !selectedItem?.isReserved,
        parsedUserInfo.accountName
      );
      setHaveItems((items) =>
        items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                isReserved: !selectedItem?.isReserved,
                reservedBy: parsedUserInfo.accountName,
              }
            : item
        )
      );
      toast.success("Item Reserved!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to reserve item!"
      );
    }
  }

  return {
    haveItems,
    loading,
    // hasMore,
    loadHaves,
    addHaveItem,
    deleteHaveItem,
    toggleReservation,
  };
}
