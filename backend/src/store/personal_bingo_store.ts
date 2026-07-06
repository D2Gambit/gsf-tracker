import { eq, and, asc, sql } from "drizzle-orm";
import { db } from "../config/db.js";
import { personalBingoItems, personalBingoProgress } from "../config/schema.js";

export const DEFAULT_PERSONAL_BINGO_ITEMS: string[] = [
  "Drop Vex or Higher",
  "Level 91",
  "Kill any T0 boss",
  "Reach 150k Kills",
  "Clear a unique Map",
  "Drop a skiller with life",
  "Hand in 12 keys",
  "Kill 50 of any boss (LOD)",
];

export async function seedDefaultPersonalBingoItems() {
  const existing = await db
    .select({ id: personalBingoItems.id })
    .from(personalBingoItems);
  if (existing.length > 0) return;

  await db.insert(personalBingoItems).values(
    DEFAULT_PERSONAL_BINGO_ITEMS.map((label, i) => ({
      label,
      sortOrder: i,
      isActive: true,
    })),
  );
}

export async function getPersonalBingoItems() {
  return db
    .select()
    .from(personalBingoItems)
    .where(eq(personalBingoItems.isActive, true))
    .orderBy(asc(personalBingoItems.sortOrder));
}

export async function getPersonalBingoBoard(
  gsfGroupId: string,
  accountName: string,
) {
  const items = await getPersonalBingoItems();

  const progress = await db
    .select()
    .from(personalBingoProgress)
    .where(
      and(
        eq(personalBingoProgress.gsfGroupId, gsfGroupId),
        eq(personalBingoProgress.accountName, accountName),
      ),
    );

  return items.map((item) => ({
    ...item,
    progress:
      progress.find((p) => p.personalBingoItemId === Number(item.id)) ?? null,
  }));
}

export async function completePersonalBingoItem(data: {
  personalBingoItemId: string;
  gsfGroupId: string;
  accountName: string;
}) {
  const existing = await db
    .select()
    .from(personalBingoProgress)
    .where(
      and(
        eq(
          personalBingoProgress.personalBingoItemId,
          parseInt(data.personalBingoItemId),
        ),
        eq(personalBingoProgress.gsfGroupId, data.gsfGroupId),
        eq(personalBingoProgress.accountName, data.accountName),
      ),
    );

  if (existing.length > 0) throw new Error("ALREADY_COMPLETED");

  return db
    .insert(personalBingoProgress)
    .values({
      personalBingoItemId: parseInt(data.personalBingoItemId),
      gsfGroupId: data.gsfGroupId,
      accountName: data.accountName,
    })
    .returning();
}

export async function uncompletePersonalBingoItem(
  personalBingoItemId: string,
  gsfGroupId: string,
  accountName: string,
) {
  return db
    .delete(personalBingoProgress)
    .where(
      and(
        eq(
          personalBingoProgress.personalBingoItemId,
          parseInt(personalBingoItemId),
        ),
        eq(personalBingoProgress.gsfGroupId, gsfGroupId),
        eq(personalBingoProgress.accountName, accountName),
      ),
    )
    .returning();
}

export async function getPersonalBingoSummary(gsfGroupId: string) {
  const totalItems = (await getPersonalBingoItems()).length;

  const rows = await db
    .select({
      accountName: personalBingoProgress.accountName,
      completedCount: sql<number>`count(*)`,
    })
    .from(personalBingoProgress)
    .where(eq(personalBingoProgress.gsfGroupId, gsfGroupId))
    .groupBy(personalBingoProgress.accountName);

  return { totalItems, counts: rows };
}
