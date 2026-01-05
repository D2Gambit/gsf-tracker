import cron from "node-cron";
import { db } from "../config/db.js";
import { haveItems } from "../config/schema.js";
import { and, eq, lt } from "drizzle-orm";
export function startExpireReservedItemsJob() {
    // Runs every hour
    cron.schedule("0 * * * *", async () => {
        try {
            const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
            const result = await db
                .update(haveItems)
                .set({ isActive: false })
                .where(and(eq(haveItems.isReserved, true), eq(haveItems.isActive, true), lt(haveItems.reservedAt, threeDaysAgo)));
            // We keep this console log here as this will only be displayed on the backend
            console.log("[CRON] Expired reserved items");
        }
        catch (err) {
            console.error("[CRON] Failed to expire items", err);
        }
    });
}
