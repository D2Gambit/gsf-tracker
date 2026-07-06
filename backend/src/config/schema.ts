import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  bigint,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
export const finds = pgTable("gsffinds", {
  id: serial("id").primaryKey(),
  gsfGroupId: text("gsf_group_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  quality: text("quality"),
  foundBy: text("found_by").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const findReactions = pgTable("gsffindreactions", {
  id: serial("id").primaryKey(),
  gsfGroupId: text("gsf_group_id").notNull(),
  findId: bigint("find_id", { mode: "number" }).notNull(),
  accountName: text("account_name").notNull(),
  emoji: text("emoji").notNull(),
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

export const haveItems = pgTable("gsfhaves", {
  id: serial("id").primaryKey(),
  gsfGroupId: text("gsf_group_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  foundBy: text("found_by").notNull(),
  location: text("location"),
  isReserved: boolean("is_reserved").notNull(),
  reservedBy: text("reserved_by"),
  quality: text("quality").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  reservedAt: timestamp("reserved_at"),
});

export const gsfGroups = pgTable("gsfgroups", {
  id: serial("id").primaryKey(),
  gsfGroupId: text("gsf_group_id").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gsfMembers = pgTable("gsfmembers", {
  id: serial("id").primaryKey(),
  gsfGroupId: text("gsf_group_id").notNull(),
  accountName: text("account_name").notNull(),
  characterName: text("character_name").notNull(),
  role: text("role").notNull().default("member"),
  hasPlayedGsf: boolean("has_played_gsf").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  preferredTimezone: text("preferred_timezone")
    .notNull()
    .default("UTC+00:00 - London"),
  preferredClass: text("preferred_class").notNull().default("Amazon"),
  preferredSecondaryClass: text("preferred_secondary_class")
    .notNull()
    .default("Assassin"),
  buildName: text("build_name").notNull().default("Unknown"),
  discordName: text("discord_name").notNull(),
});

export const bingoItems = pgTable("bingo_items", {
  id: serial("id").primaryKey(),
  gsfGroupId: text("gsf_group_id").notNull(),
  label: text("label").notNull(),
  maxEntries: integer("max_entries").notNull().default(1), // e.g. 3 for "Player 1/2/3"
  slotLabels: jsonb("slot_labels").$type<string[] | null>(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bingoClaims = pgTable("bingo_claims", {
  id: serial("id").primaryKey(),
  bingoItemId: integer("bingo_item_id")
    .notNull()
    .references(() => bingoItems.id),
  gsfGroupId: text("gsf_group_id").notNull(),
  accountName: text("account_name").notNull(),
  slotIndex: integer("slot_index").notNull(), // 0-based, which "Player #" slot this fills
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const personalBingoItems = pgTable("personal_bingo_items", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const personalBingoProgress = pgTable("personal_bingo_progress", {
  id: serial("id").primaryKey(),
  personalBingoItemId: integer("personal_bingo_item_id")
    .notNull()
    .references(() => personalBingoItems.id),
  gsfGroupId: text("gsf_group_id").notNull(),
  accountName: text("account_name").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});
