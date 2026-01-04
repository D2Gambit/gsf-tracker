import {
  eq,
  and,
  lt,
  or,
  ilike,
  inArray,
  ne,
} from "drizzle-orm/sql/expressions/conditions";
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
  limit: number,
  search?: string,
  qualities?: string[],
  reservable?: boolean,
  accountName?: string,
  cursor?: { createdAt: Date; id: number }
) => {
  const conditions = [
    eq(haveItems.gsfGroupId, gsfGroupId),
    eq(haveItems.isActive, true),
  ];

  if (tab === "mine") {
    conditions.push(eq(haveItems.foundBy, accountName!));
  }

  if (tab === "requests") {
    conditions.push(eq(haveItems.foundBy, accountName!));
    conditions.push(eq(haveItems.isReserved, true));
  }

  if (search) {
    conditions.push(
      or(
        ilike(haveItems.name, `%${search}%`),
        ilike(haveItems.description, `%${search}%`)
      )!
    );
  }

  if (qualities?.length) {
    conditions.push(inArray(haveItems.quality, qualities));
  }

  if (reservable !== undefined) {
    const reservableCondition = and(
      eq(haveItems.isReserved, !reservable),
      ne(haveItems.foundBy, accountName!)
    );
    if (reservableCondition) {
      conditions.push(reservableCondition);
    }
  }

  if (cursor) {
    conditions.push(
      or(
        lt(haveItems.createdAt, cursor.createdAt),
        and(
          eq(haveItems.createdAt, cursor.createdAt),
          lt(haveItems.id, cursor.id)
        )
      )!
    );
  }

  const rows = await db
    .select()
    .from(haveItems)
    .where(and(...conditions))
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
