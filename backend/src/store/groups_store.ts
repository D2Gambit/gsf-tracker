import bcrypt from "bcryptjs";
import { db } from "../config/db";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { gsfGroups } from "../config/schema";

export const createGroup = async (data: {
  gsfGroupId: string;
  password: string;
  createdAt: Date;
}) => {
  const passwordHash = await bcrypt.hash(data.password, 12);
  return db
    .insert(gsfGroups)
    .values({
      gsfGroupId: data.gsfGroupId,
      passwordHash,
      createdAt: data.createdAt,
    })
    .returning();
};

export const validateGroupLogin = async (
  gsfGroupId: string,
  password: string
) => {
  const group = await db
    .select()
    .from(gsfGroups)
    .where(eq(gsfGroups.gsfGroupId, gsfGroupId));

  if (group.length === 0) {
    return null;
  }

  const isValid = await bcrypt.compare(password, group[0].passwordHash);
  return isValid ? group[0] : null;
};
