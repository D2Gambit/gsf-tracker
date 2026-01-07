import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  bigint,
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
  discordName: text("discord_name").notNull(),
});
