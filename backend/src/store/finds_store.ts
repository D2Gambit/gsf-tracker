import { eq } from "drizzle-orm/sql/expressions/conditions";
import { desc } from "drizzle-orm";
import { db } from "../config/db";
import { findReactions, finds } from "../config/schema";

export const createFind = async (data: {
  gsfGroupId: string;
  name: string;
  description?: string;
  foundBy: string;
  imageUrl: string;
  createdAt: Date;
}) => {
  return db.insert(finds).values(data).returning();
};

export const getLatestFinds = async (gsfGroupId: string) => {
  return await db
    .select()
    .from(finds)
    .where(eq(finds.gsfGroupId, gsfGroupId))
    .orderBy(desc(finds.createdAt));
};

export const createFindReaction = async (data: {
  gsfGroupId: string;
  findId: string;
  accountName: string;
  emoji: string;
  createdAt: Date;
}) => {
  try {
    const result = await db.insert(findReactions).values(data).returning();
    return result;
  } catch (err: any) {
    // Check for Postgres unique violation
    if (err.cause.code === "23505") {
      // 23505 = unique_violation
      // Bubble up a custom error
      throw new Error("DUPLICATE_REACTION");
    }
    throw err; // rethrow other errors
  }
};

export const getGsfReactions = async (gsfGroupId: string) => {
  return db
    .select()
    .from(findReactions)
    .where(eq(findReactions.gsfGroupId, gsfGroupId));
};
