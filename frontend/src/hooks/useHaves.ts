import { useState } from "react";
import {
  addHave,
  deleteHave,
  fetchHaveItems,
  toggleReserved,
} from "../api/haves.api";
import { toast } from "react-toastify";
import type {
  AddHaveItemRequest,
  HaveItem,
  TabKey,
  TabState,
} from "../types/list";

export function useHaves() {
  const [haveItems, setHaveItems] = useState<HaveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabData, setTabData] = useState<Record<TabKey, TabState>>({
    all: {
      items: [],
      cursor: null,
      hasMore: true,
      loading: false,
      initialLoaded: false,
    },
    mine: {
      items: [],
      cursor: null,
      hasMore: true,
      loading: false,
      initialLoaded: false,
    },
    requests: {
      items: [],
      cursor: null,
      hasMore: true,
      loading: false,
      initialLoaded: false,
    },
  });

  const userInfo = localStorage.getItem("gsfUserInfo");
  const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;

  async function loadHaves(groupId: string, tab: TabKey, reset = false) {
    setTabData((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], loading: true },
    }));

    const state = tabData[tab];

    if (!state.hasMore && !reset) return;

    try {
      setLoading(true);

      const res = await fetchHaveItems(
        groupId,
        tab,
        parsedUserInfo.accountName,
        20,
        reset ? undefined : JSON.stringify(state.cursor)
      );

      setTabData((prev) => {
        const map = new Map(
          (reset ? [] : prev[tab].items).map((i) => [i.id, i])
        );
        res.items.forEach((i) => map.set(i.id, i));

        return {
          ...prev,
          [tab]: {
            items: Array.from(map.values()),
            cursor: res.nextCursor,
            hasMore: Boolean(res.nextCursor),
            loading: false,
            initialLoaded: true,
          },
        };
      });
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
    loadHaves,
    addHaveItem,
    deleteHaveItem,
    toggleReservation,
    tabData,
  };
}
