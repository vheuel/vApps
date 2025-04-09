import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  bio: text("bio"),
  location: text("location"),
  website: text("website"),
  avatarUrl: text("avatar_url"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  memberSince: timestamp("member_since").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

// Categories model
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCategorySchema = createInsertSchema(categories)
  .pick({
    name: true,
    slug: true,
    icon: true,
    description: true
  });

// Default categories - maintained for compatibility
export const categoryEnum = z.enum([
  'airdrop',
  'wallets',
  'exchanges',
  'explorers',
  'utilities',
  'nft',
  'staking',
  'bridges',
  'channels'
]);

// Project model
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  websiteUrl: text("website_url").notNull(),
  iconUrl: text("icon_url"),
  category: text("category").notNull(),
  userId: integer("user_id").notNull(),
  approved: boolean("approved").default(false).notNull(),
  pending: boolean("pending").default(true).notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects)
  .pick({
    name: true,
    description: true,
    websiteUrl: true,
    iconUrl: true,
    category: true
  })
  .extend({
    description: z.string().max(200, { message: "Description cannot exceed 200 characters" }),
    category: z.string()
  });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type CategorySlug = z.infer<typeof categoryEnum>;
