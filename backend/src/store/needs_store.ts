import { eq } from "drizzle-orm/sql/expressions/conditions";
import { db } from "../config/db";
import { needItems } from "../config/schema";

export const createNeedItem = async (data: {
  gsfGroupId: string;
  name: string;
  description?: string;
  requestedBy: string;
  priority: string;
  createdAt: Date;
  isActive: boolean;
}) => {
  return db.insert(needItems).values(data).returning();
};
export const updateNeedItemActiveFlag = async (
  id: string,
  _isActive: boolean
) => {
  return db
    .update(needItems)
    .set({ isActive: _isActive })
    .where(eq(needItems.id, parseInt(id)));
};

export const getNeedItems = async () => {
  return db
    .select()
    .from(needItems)
    .orderBy(needItems.createdAt, needItems.isActive);
};

export const deleteNeedItem = async (id: string) => {
  return db.delete(needItems).where(eq(needItems.id, parseInt(id)));
};
