import cron from "node-cron";
import { db, supabase } from "../config/db.js";
import { finds, haveItems } from "../config/schema.js";
import { and, eq, lt } from "drizzle-orm";

export function startExpireReservedItemsJob() {
  // Runs every hour
  cron.schedule("0 * * * *", async () => {
    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      const result = await db
        .update(haveItems)
        .set({ isActive: false })
        .where(
          and(
            eq(haveItems.isReserved, true),
            eq(haveItems.isActive, true),
            lt(haveItems.reservedAt, threeDaysAgo)
          )
        );

      // We keep this console log here as this will only be displayed on the backend
      console.log("[CRON] Expired reserved items");
    } catch (err) {
      console.error("[CRON] Failed to expire items", err);
    }
  });
}

export function startExpireFindsJob() {
  // Runs once per day at 3am
  cron.schedule("0 3 * * *", async () => {
    try {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

      const oldFinds = await db
        .select({
          id: finds.id,
          imageUrl: finds.imageUrl,
        })
        .from(finds)
        .where(lt(finds.createdAt, twoWeeksAgo));

      if (!oldFinds.length) return;

      // Delete images from Supabase
      const imagePaths = oldFinds
        .map((f) => f.imageUrl?.split("/").pop())
        .filter((p): p is string => Boolean(p));

      if (imagePaths.length) {
        const { error } = await supabase.storage
          .from("loot-images")
          .remove(imagePaths);

        if (error) {
          console.error("[CRON] Failed deleting images", error);
        }
      }

      // Delete DB rows
      await db.delete(finds).where(lt(finds.createdAt, twoWeeksAgo));

      console.log(`[CRON] Deleted ${oldFinds.length} old finds + images`);
    } catch (err) {
      console.error("[CRON] Failed to expire finds", err);
    }
  });
}
