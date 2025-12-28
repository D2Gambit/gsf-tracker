import { eq } from "drizzle-orm/sql/expressions/conditions";
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
}) => {
  return db.insert(haveItems).values(data).returning();
};

export const getHaveItems = async () => {
  return db.select().from(haveItems).orderBy(haveItems.createdAt);
};

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
    })
    .where(eq(haveItems.id, parseInt(id)))
    .returning();
};
