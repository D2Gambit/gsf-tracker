const BASE = "/api";

export async function fetchPersonalBingoBoard(
  gsfGroupId: string,
  accountName: string,
) {
  const res = await fetch(
    `${BASE}/personal-bingo/${gsfGroupId}/${accountName}`,
  );
  if (!res.ok) throw new Error("Unable to fetch personal bingo board");
  return res.json();
}

export async function completePersonalBingoItem(
  personalBingoItemId: number,
  gsfGroupId: string,
  accountName: string,
  requestingAccount: string,
) {
  const res = await fetch(`${BASE}/personal-bingo/complete`, {
    method: "POST",
    body: new URLSearchParams({
      personalBingoItemId: String(personalBingoItemId),
      gsfGroupId,
      accountName,
      requestingAccount,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Unable to complete item");
  return data;
}

export async function uncompletePersonalBingoItem(
  personalBingoItemId: number,
  gsfGroupId: string,
  accountName: string,
  requestingAccount: string,
) {
  const res = await fetch(`${BASE}/personal-bingo/uncomplete`, {
    method: "POST",
    body: new URLSearchParams({
      personalBingoItemId: String(personalBingoItemId),
      gsfGroupId,
      accountName,
      requestingAccount,
    }),
  });
  if (!res.ok) throw new Error("Unable to uncomplete item");
  return res.json();
}

export async function fetchPersonalBingoSummary(gsfGroupId: string) {
  const res = await fetch(`${BASE}/personal-bingo/summary/${gsfGroupId}`);
  if (!res.ok) throw new Error("Unable to fetch personal bingo summary");
  return res.json();
}
