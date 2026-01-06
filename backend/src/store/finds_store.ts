import { eq } from "drizzle-orm/sql/expressions/conditions";
import { desc, lt, and, or, sql } from "drizzle-orm";
import { db } from "../config/db.js";
import { findReactions, finds } from "../config/schema.js";

export const createFind = async (data: {
  gsfGroupId: string;
  name: string;
  description?: string;
  quality?: string;
  foundBy: string;
  imageUrl?: string;
  createdAt: Date;
}) => {
  return db.insert(finds).values(data).returning();
};

export const getHotFinds = async (gsfGroupId: string, limit = 3) => {
  return db
    .select({
      id: finds.id,
      gsfGroupId: finds.gsfGroupId,
      name: finds.name,
      description: finds.description,
      quality: finds.quality,
      foundBy: finds.foundBy,
      imageUrl: finds.imageUrl,
      createdAt: finds.createdAt,
      reactionCount: sql<number>`count(${findReactions.id})`,
    })
    .from(finds)
    .leftJoin(findReactions, eq(findReactions.findId, finds.id))
    .where(eq(finds.gsfGroupId, gsfGroupId))
    .groupBy(finds.id)
    .orderBy(desc(sql`count(${findReactions.id})`))
    .limit(limit);
};

export const getLatestFinds = async (
  gsfGroupId: string,
  limit: number,
  cursor?: { createdAt: Date; id: string }
) => {
  let query = db
    .select()
    .from(finds)
    .where(eq(finds.gsfGroupId, gsfGroupId))
    .orderBy(desc(finds.createdAt), desc(finds.id))
    .limit(limit + 1);

  if (cursor) {
    query = db
      .select()
      .from(finds)
      .where(
        and(
          eq(finds.gsfGroupId, gsfGroupId),
          or(
            lt(finds.createdAt, cursor.createdAt),
            and(
              eq(finds.createdAt, cursor.createdAt),
              lt(finds.id, parseInt(cursor.id))
            )
          )
        )
      )
      .orderBy(desc(finds.createdAt), desc(finds.id))
      .limit(limit + 1);
  }

  const rows = await query;

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;

  const lastItem = items[items.length - 1];

  return {
    items,
    nextCursor: hasMore
      ? {
          createdAt: lastItem.createdAt,
          id: lastItem.id,
        }
      : null,
  };
};

export const createFindReaction = async (data: {
  gsfGroupId: string;
  findId: number;
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
