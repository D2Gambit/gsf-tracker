import { pgTable, text, timestamp, boolean, serial } from "drizzle-orm/pg-core";
export const finds = pgTable("gsffinds", {
  gsfGroupId: text("gsf_group_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  foundBy: text("found_by").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const needItems = pgTable("gsfneeds", {
  id: serial("id").primaryKey(),
  gsfGroupId: text("gsf_group_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  requestedBy: text("requested_by").notNull(),
  priority: text("priority").notNull(),
  isActive: boolean("is_active").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
