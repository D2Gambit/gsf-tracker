import { eq } from "drizzle-orm/sql/expressions/conditions";
import { desc } from "drizzle-orm";
import { db } from "../config/db.js";
import { needItems } from "../config/schema.js";
export const createNeedItem = async (data) => {
    return db.insert(needItems).values(data).returning();
};
export const updateNeedItemActiveFlag = async (id, _isActive) => {
    return db
        .update(needItems)
        .set({ isActive: _isActive })
        .where(eq(needItems.id, parseInt(id)));
};
export const getNeedItems = async (gsfGroupId) => {
    return db
        .select()
        .from(needItems)
        .where(eq(needItems.gsfGroupId, gsfGroupId))
        .orderBy(desc(needItems.isActive), desc(needItems.createdAt));
};
export const deleteNeedItem = async (id) => {
    return db.delete(needItems).where(eq(needItems.id, parseInt(id)));
};
