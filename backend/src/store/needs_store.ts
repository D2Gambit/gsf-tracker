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

export const getNeedItems = async () => {
  return db
    .select()
    .from(needItems)
    .orderBy(needItems.createdAt, needItems.isActive);
};
