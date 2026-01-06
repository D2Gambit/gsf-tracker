import bcrypt from "bcryptjs";
import { db } from "../config/db.js";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { gsfGroups } from "../config/schema.js";

export const createGroup = async (data: {
  gsfGroupId: string;
  password: string;
  createdAt: Date;
}) => {
  const passwordHash = await bcrypt.hash(data.password, 12);
  try {
    const result = await db
      .insert(gsfGroups)
      .values({
        gsfGroupId: data.gsfGroupId,
        passwordHash,
        createdAt: data.createdAt,
      })
      .returning();
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

export const updateGroupPassword = async (
  gsfGroupId: string,
  password: string
) => {
  const passwordHash = await bcrypt.hash(password, 12);
  return db
    .update(gsfGroups)
    .set({ passwordHash: passwordHash })
    .where(eq(gsfGroups.gsfGroupId, gsfGroupId))
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
