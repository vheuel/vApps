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
  headerImage: text("header_image"), // Menambahkan field untuk header image
  company: text("company"), // Menambahkan field untuk nama perusahaan
  isAdmin: boolean("is_admin").default(false).notNull(),
  verified: boolean("verified").default(false).notNull(),
  memberSince: timestamp("member_since").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  bioUpdatedAt: timestamp("bio_updated_at"),
  locationUpdatedAt: timestamp("location_updated_at"),
  websiteUpdatedAt: timestamp("website_updated_at"),
  avatarUpdatedAt: timestamp("avatar_updated_at"),
  headerUpdatedAt: timestamp("header_updated_at"),
  companyUpdatedAt: timestamp("company_updated_at"),
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
// Schema untuk pengaturan website
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").default("Web3 Project"),
  siteDescription: text("site_description").default("The cutting-edge Web3 project discovery platform connecting blockchain innovators."),
  logoUrl: text("logo_url").default(""),
  primaryColor: text("primary_color").default("#3B82F6"),
  footerText: text("footer_text").default("© 2025 Web3 Project. All Rights Reserved."),
  defaultProjectIcon: text("default_project_icon").default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type CategorySlug = z.infer<typeof categoryEnum>;
// Journal blogs
export const journals = pgTable("journals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImage: text("cover_image"),
  userId: integer("user_id").notNull(),
  published: boolean("published").default(true).notNull(),
  featured: boolean("featured").default(false).notNull(),
  likes: integer("likes").default(0).notNull(),
  comments: integer("comments").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertJournalSchema = createInsertSchema(journals)
  .pick({
    title: true,
    content: true,
    excerpt: true,
    coverImage: true,
    published: true,
    featured: true
  })
  .extend({
    excerpt: z.string().max(300, { message: "Excerpt cannot exceed 300 characters" }).optional(),
  });

export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type Journal = typeof journals.$inferSelect;
export type InsertJournal = z.infer<typeof insertJournalSchema>;
