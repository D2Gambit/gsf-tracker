import type { AddHaveItemRequest, HaveFilters } from "../types/list";

export async function fetchHaveItems(
  groupId: string,
  tab: string,
  accountName: string,
  limit = 20,
  cursor?: string,
  filters?: HaveFilters,
) {
  const params = new URLSearchParams({
    limit: String(limit),
  });

  if (cursor) params.append("cursor", cursor);
  if (tab) params.append("tab", tab);
  if (accountName) params.append("accountName", accountName);

  if (filters?.search) {
    params.set("search", filters.search);
  }

  filters?.qualities?.forEach((q) => params.append("qualities", q));

  if (filters?.reservable !== undefined) {
    params.set("reservable", String(filters.reservable));
  }

  const res = await fetch(`/api/have-items/${groupId}?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch have items");

  return res.json();
}

export async function deleteHave(itemId: string) {
  const res = await fetch(`/api/delete-have-item/${itemId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete item");
  return res.json();
}

export async function fetchHaveItemCounts(
  gsfGroupId: string,
  accountName: string,
) {
  const res = await fetch(
    `/api/have-items/counts/${gsfGroupId}?accountName=${encodeURIComponent(
      accountName,
    )}`,
  );
  if (!res.ok) throw new Error("Failed to fetch item counts");
  return res.json() as Promise<{
    allCount: number;
    myItemsCount: number;
    requestsCount: number;
    itemsIWantCount: number;
  }>;
}

export async function addHave(data: AddHaveItemRequest) {
  const formData = new FormData();
  formData.append("image", data.image!);
  formData.append("gsfGroupId", data.gsfGroupId);
  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("foundBy", data.foundBy);
  formData.append("quality", data.quality);
  formData.append("location", data.location);
  formData.append("isReserved", data.isReserved);
  formData.append("reservedBy", data.reservedBy);

  const res = await fetch("/api/add-have-item", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Unable to add item!");
  }
  return res.json();
}

export async function toggleReserved(
  id: string,
  isReserved: boolean,
  reservedBy: string,
) {
  try {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("isReserved", isReserved.toString());
    formData.append("reservedBy", reservedBy);

    const res = await fetch("/api/reserve-have-item", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Unable to reserve item");
    }
  } catch (error) {
    console.error("Error toggling reservation:", error);
  }
}
