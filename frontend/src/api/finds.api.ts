import type { LootUploadItem } from "../types/loot";

export async function fetchFinds(groupId: string) {
  const res = await fetch(`/api/finds/${groupId}`);
  if (!res.ok) throw new Error("Failed to fetch finds");
  return res.json();
}

export async function createFind(find: LootUploadItem) {
  const userInfo = localStorage.getItem("gsfUserInfo");
  const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;

  const formData = new FormData();
  formData.append("image", find.image!);
  formData.append("name", find.name);
  formData.append("description", find.description);
  formData.append("foundBy", parsedUserInfo.accountName);
  formData.append("gsfGroupId", find.gsfGroupId);

  const res = await fetch("/api/upload-finds", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Upload Loot Item failed");
  }

  return res.json();
}
