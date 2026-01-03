import type { AddHaveItemRequest } from "../types/list";

export async function fetchHaveItems(groupId: string) {
  const res = await fetch(`/api/have-items/${groupId}`);
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
  reservedBy: string
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
