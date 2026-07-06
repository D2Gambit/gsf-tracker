import { eq, and, asc } from "drizzle-orm";
import { db } from "../config/db.js";
import { bingoItems, bingoClaims } from "../config/schema.js";

export const DEFAULT_BINGO_ITEMS: {
  label: string;
  maxEntries: number;
  isActive: boolean;
  slotLabels?: string[];
}[] = [
  { label: "Find 3 Ber runes in non-map zones", maxEntries: 3, isActive: true },
  { label: "5 people hit lvl 96", maxEntries: 5, isActive: true },
  {
    label: "Skill ring with GG corrupt (FCR / MAEK / LAEK / ...)",
    maxEntries: 1,
    isActive: true,
  },
  { label: "Run 15 uber trists .allstats", maxEntries: 3, isActive: true },
  { label: "Skiller +45 Life", maxEntries: 1, isActive: true },
  {
    label: "Every facet 5/5",
    maxEntries: 4,
    isActive: true,
    slotLabels: ["Fire", "Cold", "Light", "Poison"],
  },
  {
    label: "Soul Drainers Slammed ED / DS / IAS",
    maxEntries: 1,
    isActive: true,
  },
  {
    label: "Craft GG Armor (150+ ED, 15% PDR, 50+life OR 15 all res, 2 soc)",
    maxEntries: 1,
    isActive: true,
  },
  {
    label: "Small Charm: 20 Life +4 all res OR +15 Life 5 all res",
    maxEntries: 1,
    isActive: true,
  },
  { label: "Kill T1 Dclone", maxEntries: 3, isActive: true },
  {
    label: "Find a 5th anniversary skinned item",
    maxEntries: 5,
    isActive: true,
    slotLabels: ["Stormshield", "Shako", "Shaftstop", "Fenris", "Mang's Song"],
  },
  {
    label:
      "GG Crafted Rare Weapon (+400 ED, IAS, DS/CB or Amp Proc, +2/+4 soc)",
    maxEntries: 1,
    isActive: true,
  },
  {
    label: "5 people complete their personal bingos",
    maxEntries: 5,
    isActive: true,
  },
  { label: "Kill T1 Ratham", maxEntries: 3, isActive: true },
  { label: "Demonic Cube / Skeleton Key", maxEntries: 1, isActive: true },
  {
    label: '"Everyone" drops an HR (vex or up)',
    maxEntries: 1,
    isActive: true,
  },
  {
    label: "Grand Charm 10 dmg, xx AR, 40+ Life",
    maxEntries: 1,
    isActive: true,
  },
  { label: "Kill T1 Lucion", maxEntries: 3, isActive: true },
  { label: "Alamanac / Navigator", maxEntries: 1, isActive: true },
  { label: "Jewel 38+ ED, 10 Min / Max", maxEntries: 1, isActive: true },
  { label: "Get an Aura", maxEntries: 1, isActive: true },
  { label: "60/20 Anni", maxEntries: 1, isActive: true },
  { label: "Vial / Mirror", maxEntries: 1, isActive: true },
  {
    label: "Make a build guide & publish to youtube",
    maxEntries: 1,
    isActive: true,
  },
  { label: "Drop 3 Zod Runes", maxEntries: 3, isActive: true },
];

export async function seedDefaultBingoItems(gsfGroupId: string) {
  const existing = await db
    .select({ id: bingoItems.id })
    .from(bingoItems)
    .where(eq(bingoItems.gsfGroupId, gsfGroupId));

  if (existing.length > 0) return;

  await db.insert(bingoItems).values(
    DEFAULT_BINGO_ITEMS.map((item, i) => ({
      gsfGroupId,
      label: item.label,
      maxEntries: item.maxEntries,
      slotLabels: item.slotLabels ?? null,
      sortOrder: i,
      isActive: item.isActive,
    })),
  );
}

export async function getBingoBoard(gsfGroupId: string) {
  const items = await db
    .select()
    .from(bingoItems)
    .where(
      and(eq(bingoItems.gsfGroupId, gsfGroupId), eq(bingoItems.isActive, true)),
    )
    .orderBy(asc(bingoItems.sortOrder));

  const claims = await db
    .select()
    .from(bingoClaims)
    .where(eq(bingoClaims.gsfGroupId, gsfGroupId))
    .orderBy(asc(bingoClaims.slotIndex));

  return items.map((item) => ({
    ...item,
    claims: claims.filter((c) => c.bingoItemId === Number(item.id)),
  }));
}

export async function createBingoItem(data: {
  gsfGroupId: string;
  label: string;
  maxEntries: number;
  sortOrder: number;
}) {
  return db.insert(bingoItems).values(data).returning();
}

export async function updateBingoItem(
  id: string,
  data: Partial<{
    label: string;
    maxEntries: number;
    sortOrder: number;
    isActive: boolean;
  }>,
) {
  return db
    .update(bingoItems)
    .set(data)
    .where(eq(bingoItems.id, parseInt(id)))
    .returning();
}

export async function deleteBingoItem(id: string) {
  return db.delete(bingoItems).where(eq(bingoItems.id, parseInt(id)));
}

export async function claimBingoSlot(data: {
  bingoItemId: string;
  gsfGroupId: string;
  accountName: string;
}) {
  const [item] = await db
    .select()
    .from(bingoItems)
    .where(eq(bingoItems.id, parseInt(data.bingoItemId)));

  if (!item) throw new Error("Bingo item not found");

  const existingClaims = await db
    .select()
    .from(bingoClaims)
    .where(eq(bingoClaims.bingoItemId, item.id));

  if (existingClaims.some((c) => c.accountName === data.accountName)) {
    throw new Error("ALREADY_CLAIMED");
  }

  const takenSlots = new Set(existingClaims.map((c) => c.slotIndex));
  let slotIndex = -1;
  for (let i = 0; i < item.maxEntries; i++) {
    if (!takenSlots.has(i)) {
      slotIndex = i;
      break;
    }
  }

  if (slotIndex === -1) throw new Error("SQUARE_FULL");

  return db
    .insert(bingoClaims)
    .values({
      bingoItemId: item.id,
      gsfGroupId: data.gsfGroupId,
      accountName: data.accountName,
      slotIndex,
    })
    .returning();
}

export async function unclaimBingoSlot(claimId: string, accountName: string) {
  return db
    .delete(bingoClaims)
    .where(
      and(
        eq(bingoClaims.id, parseInt(claimId)),
        eq(bingoClaims.accountName, accountName),
      ),
    )
    .returning();
}
