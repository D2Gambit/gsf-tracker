import { db } from "../config/db";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { gsfMembers } from "../config/schema";

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
  return db.insert(gsfMembers).values(data).returning();
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
