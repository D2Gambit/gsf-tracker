import { db } from "../config/db.js";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { gsfMembers } from "../config/schema.js";
export const createMember = async (data) => {
    try {
        const result = await db.insert(gsfMembers).values(data).returning();
        return result;
    }
    catch (err) {
        if (err.cause.code === "23505") {
            // 23505 = unique_violation
            // Bubble up a custom error
            throw new Error("DUPLICATE_REACTION");
        }
        throw err; // rethrow other errors
    }
};
export const deleteMember = async (id) => {
    return db
        .delete(gsfMembers)
        .where(eq(gsfMembers.id, parseInt(id)))
        .returning();
};
export const getMembersByGroup = async (gsfGroupId) => {
    return db
        .select()
        .from(gsfMembers)
        .where(eq(gsfMembers.gsfGroupId, gsfGroupId));
};
export const getMemberByAccountName = async (accountName) => {
    return db
        .select()
        .from(gsfMembers)
        .where(eq(gsfMembers.accountName, accountName));
};
