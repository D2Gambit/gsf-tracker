import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
export const finds = pgTable("gsffinds", {
  gsfGroupId: text("gsf_group_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  foundBy: text("found_by").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
