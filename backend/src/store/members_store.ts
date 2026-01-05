import { db } from "../config/db.js";
import { eq } from "drizzle-orm/sql/expressions/conditions";
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
    .where(eq(gsfMembers.gsfGroupId, gsfGroupId));
};

export const getMemberByAccountName = async (accountName: string) => {
  return db
    .select()
    .from(gsfMembers)
    .where(eq(gsfMembers.accountName, accountName));
};
