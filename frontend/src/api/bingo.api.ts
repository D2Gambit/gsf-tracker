const BASE = "/api"; // match your existing api base

export async function fetchBingoBoard(gsfGroupId: string) {
  const res = await fetch(`${BASE}/bingo/${gsfGroupId}`);
  if (!res.ok) throw new Error("Unable to fetch bingo board");
  return res.json();
}

export async function claimBingo(
  bingoItemId: number,
  gsfGroupId: string,
  accountName: string,
  slotIndex?: number,
) {
  const body: Record<string, string> = {
    bingoItemId: String(bingoItemId),
    gsfGroupId,
    accountName,
  };
  if (slotIndex !== undefined) {
    body.slotIndex = String(slotIndex);
  }

  const res = await fetch(`${BASE}/bingo/claim`, {
    method: "POST",
    body: new URLSearchParams(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Unable to claim square");
  return data;
}

export async function unclaimBingo(claimId: number, accountName: string) {
  const res = await fetch(`${BASE}/bingo/unclaim/${claimId}`, {
    method: "POST",
    body: new URLSearchParams({ accountName }),
  });
  if (!res.ok) throw new Error("Unable to unclaim square");
  return res.json();
}
