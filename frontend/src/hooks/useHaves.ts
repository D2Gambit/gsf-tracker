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
  HaveFilters,
  HaveItem,
  TabKey,
  TabState,
} from "../types/list";

export function useHaves() {
  const [loading, setLoading] = useState(false);
  const [tabData, setTabData] = useState<Record<TabKey, TabState>>({
    todaysFinds: {
      items: [],
      cursor: null,
      hasMore: true,
      loading: false,
      loadingMore: false,
      initialLoaded: false,
      filters: {},
    },
    all: {
      items: [],
      cursor: null,
      hasMore: true,
      loading: false,
      loadingMore: false,
      initialLoaded: false,
      filters: {},
    },
    mine: {
      items: [],
      cursor: null,
      hasMore: true,
      loading: false,
      loadingMore: false,
      initialLoaded: false,
      filters: {},
    },
    requests: {
      items: [],
      cursor: null,
      hasMore: true,
      loading: false,
      loadingMore: false,
      initialLoaded: false,
      filters: {},
    },
    itemsIWant: {
      items: [],
      cursor: null,
      hasMore: true,
      loading: false,
      loadingMore: false,
      initialLoaded: false,
      filters: {},
    },
  });

  const userInfo = localStorage.getItem("gsfUserInfo");
  const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;

  let cursorToUse: string | undefined;

  async function loadHaves(groupId: string, tab: TabKey, reset = false) {
    let state = tabData[tab];

    setTabData((prev) => {
      const state = prev[tab];
      cursorToUse = reset
        ? undefined
        : (JSON.stringify(state.cursor) ?? undefined);

      return {
        ...prev,
        [tab]: {
          ...state,
          loading: reset,
          loadingMore: !reset,
        },
      };
    });

    try {
      setLoading(true);
      const res = await fetchHaveItems(
        groupId,
        tab,
        parsedUserInfo.accountName,
        20,
        cursorToUse,
        state.filters,
      );

      setTabData((prev) => {
        const map = new Map(
          (reset ? [] : prev[tab].items).map((i) => [i.id, i]),
        );
        res.items.forEach((i) => map.set(i.id, i));

        return {
          ...prev,
          [tab]: {
            items: Array.from(map.values()),
            cursor: res.nextCursor,
            hasMore: Boolean(res.nextCursor),
            loading: false,
            loadingMore: false,
            initialLoaded: true,
          },
        };
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to fetch have list!",
      );
    } finally {
      setLoading(false);
    }
  }

  async function addHaveItem(item: AddHaveItemRequest, editItemId: string) {
    try {
      const res = await addHave(item);
      if (editItemId) {
        deleteHaveItem(editItemId, true);
      }
      setTabData((prev) =>
        updateTabs(
          prev,
          (items) => {
            const filtered = editItemId
              ? items.filter((i) => i.id !== editItemId)
              : items;

            return [res, ...filtered];
          },
          res.foundBy === parsedUserInfo.accountName
            ? ["all", "mine"]
            : ["all"],
        ),
      );

      toast.success(
        editItemId ? "Successfully edited item!" : "Successfully added item!",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to add item!");
    }
  }

  async function deleteHaveItem(
    itemId: string,
    isEdittedItem: boolean = false,
  ) {
    try {
      await deleteHave(itemId);

      setTabData((prev) =>
        updateTabs(prev, (items) => items.filter((i) => i.id !== itemId), [
          "all",
          "mine",
          "requests",
        ]),
      );

      !isEdittedItem && toast.success("Item successfully deleted!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete item!",
      );
    }
  }

  async function toggleReservation(itemId: string) {
    try {
      const item =
        tabData.todaysFinds.items.find((i) => i.id === itemId) ??
        tabData.all.items.find((i) => i.id === itemId) ??
        tabData.mine.items.find((i) => i.id === itemId);

      if (!item) return;

      const newReserved = !item.isReserved;

      await toggleReserved(itemId, newReserved, parsedUserInfo.accountName);

      setTabData((prev) =>
        updateTabs(
          prev,
          (items) =>
            items.map((i) =>
              i.id === itemId
                ? {
                    ...i,
                    isReserved: newReserved,
                    reservedBy: newReserved ? parsedUserInfo.accountName : null,
                  }
                : i,
            ),
          ["todaysFinds", "all", "mine", "requests"],
        ),
      );

      toast.success(newReserved ? "Item reserved!" : "Reservation removed!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to reserve item!",
      );
    }
  }

  return {
    loading,
    loadHaves,
    addHaveItem,
    deleteHaveItem,
    toggleReservation,
    tabData,
    setTabData,
  };
}

function updateTabs(
  prev: Record<TabKey, TabState>,
  updater: (items: HaveItem[]) => HaveItem[],
  tabs: TabKey[],
) {
  const next = { ...prev };

  tabs.forEach((tab) => {
    next[tab] = {
      ...prev[tab],
      items: updater(prev[tab].items),
    };
  });

  return next;
}
