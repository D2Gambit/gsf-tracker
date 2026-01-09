import type { DeleteReactionRequest } from "../types/reactions";

export async function fetchFindReactions(groupId: string) {
  const res = await fetch(`/api/find-reactions/${groupId}`);
  if (!res.ok) throw new Error("Failed to fetch reactions");
  return res.json();
}

export async function createReaction(obj: any) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(obj)) {
    formData.append(key, String(value));
  }
  const res = await fetch(`/api/create-reaction`, {
    method: "POST",
    body: formData,
  });
  if (res.status === 409) {
    throw new Error("You already reacted with this emoji!");
  }
  if (!res.ok) {
    throw new Error("Failed to create reaction");
  }
  return res.json();
}

export async function deleteReaction(deleteRequest: DeleteReactionRequest) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(deleteRequest)) {
    formData.append(key, String(value));
  }

  const res = await fetch(`/api/delete-reaction`, {
    method: "DELETE",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to delete reaction");
  }
  return res.json();
}
