import { eq, and, lt, or } from "drizzle-orm/sql/expressions/conditions";
import { desc, sql } from "drizzle-orm";
import { db } from "../config/db";
import { haveItems } from "../config/schema";

export const createHaveItem = async (data: {
  gsfGroupId: string;
  name: string;
  description?: string;
  foundBy: string;
  quality: string;
  createdAt: Date;
  isReserved: boolean;
  location: string;
  reservedBy?: string;
  imageUrl: string;
}) => {
  return db.insert(haveItems).values(data).returning();
};

export const getHaveItems = async (
  gsfGroupId: string,
  tab: string,
  accountName: string,
  limit: number,
  cursor?: { createdAt: Date; id: number }
) => {
  let where = and(
    eq(haveItems.gsfGroupId, gsfGroupId),
    eq(haveItems.isActive, true)
  );

  if (tab === "mine") {
    where = and(where, eq(haveItems.foundBy, accountName!));
  }

  if (tab === "requests") {
    where = and(
      where,
      eq(haveItems.foundBy, accountName!),
      eq(haveItems.isReserved, true)
    );
  }

  if (cursor) {
    where = and(
      where,
      or(
        lt(haveItems.createdAt, cursor.createdAt),
        and(
          eq(haveItems.createdAt, cursor.createdAt),
          lt(haveItems.id, cursor.id)
        )
      )
    );
  }

  const rows = await db
    .select()
    .from(haveItems)
    .where(where)
    .orderBy(desc(haveItems.createdAt), desc(haveItems.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;

  return {
    items,
    nextCursor: hasMore
      ? {
          createdAt: items[items.length - 1].createdAt,
          id: items[items.length - 1].id,
        }
      : null,
  };
};

export async function getHaveItemCounts(
  gsfGroupId: string,
  accountName: string
) {
  const [result] = await db
    .select({
      allCount: sql<number>`count(*)`,
      myItemsCount: sql<number>`
        count(*) filter (
          where ${haveItems.foundBy} = ${accountName}
        )
      `,
      requestsCount: sql<number>`
        count(*) filter (
          where ${haveItems.foundBy} = ${accountName}
          and ${haveItems.isReserved} = true
        )
      `,
    })
    .from(haveItems)
    .where(
      and(eq(haveItems.gsfGroupId, gsfGroupId), eq(haveItems.isActive, true))
    );

  return result;
}

export const deleteHaveItem = async (id: string) => {
  return db.delete(haveItems).where(eq(haveItems.id, parseInt(id)));
};

export const updateHaveItemReservedFlag = async (
  id: string,
  isReserved: boolean,
  reservedBy: string
) => {
  return db
    .update(haveItems)
    .set({
      isReserved,
      reservedBy: reservedBy ? reservedBy : null,
      reservedAt: new Date(),
    })
    .where(eq(haveItems.id, parseInt(id)))
    .returning();
};
