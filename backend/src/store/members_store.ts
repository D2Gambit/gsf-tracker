import { db } from "../config/db.js";
import { desc, eq, and } from "drizzle-orm";
import { gsfMembers } from "../config/schema.js";

export const createMember = async (data: {
  gsfGroupId: string;
  accountName: string;
  characterName: string;
  role: string;
  hasPlayedGsf: boolean;
  createdAt: Date;
  preferredTimezone: string;
  preferredClass: string;
  preferredSecondaryClass: string;
  discordName: string;
  buildName: string;
}) => {
  try {
    const result = await db.insert(gsfMembers).values(data).returning();
    return result;
  } catch (err: any) {
    if (err.cause.code === "23505") {
      // 23505 = unique_violation
      // Bubble up a custom error
      throw new Error("DUPLICATE_REACTION");
    }
    throw err; // rethrow other errors
  }
};

export const updateMember = async (
  data: {
    gsfGroupId: string;
    accountName: string;
    characterName: string;
    preferredTimezone: string;
    preferredClass: string;
    preferredSecondaryClass: string;
    discordName: string;
    buildName: string;
  },
  previousAccountName: string,
) => {
  return await db
    .update(gsfMembers)
    .set(data)
    .where(
      and(
        eq(gsfMembers.gsfGroupId, data.gsfGroupId),
        eq(gsfMembers.accountName, previousAccountName),
      ),
    )
    .returning();
};

export const deleteMember = async (id: string) => {
  return db
    .delete(gsfMembers)
    .where(eq(gsfMembers.id, parseInt(id)))
    .returning();
};

export const getMembersByGroup = async (gsfGroupId: string) => {
  return db
    .select()
    .from(gsfMembers)
    .where(eq(gsfMembers.gsfGroupId, gsfGroupId))
    .orderBy(desc(gsfMembers.role));
};

export const getMemberByAccountName = async (
  gsfGroupId: string,
  accountName: string,
) => {
  return db
    .select()
    .from(gsfMembers)
    .where(
      and(
        eq(gsfMembers.gsfGroupId, gsfGroupId),
        eq(gsfMembers.accountName, accountName),
      ),
    );
};
