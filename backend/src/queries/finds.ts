import { db } from "../db";
import { finds } from "../schema";

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

export const getLatestFinds = async () => {
  return db.select().from(finds).orderBy(finds.createdAt);
};
