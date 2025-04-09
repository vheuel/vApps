import { users, projects, categories, type User, type InsertUser, type Project, type InsertProject, type Category, type InsertCategory } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import { pool } from "./db";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Project management
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject, userId: number): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  getProjectsByUser(userId: number): Promise<Project[]>;
  getProjectsByCategory(category: string): Promise<Project[]>;
  getApprovedProjects(): Promise<Project[]>;
  getPendingProjects(): Promise<Project[]>;
  approveProject(id: number): Promise<Project | undefined>;
  rejectProject(id: number): Promise<Project | undefined>;
  verifyProject(id: number): Promise<Project | undefined>;
  unverifyProject(id: number): Promise<Project | undefined>;
  incrementProjectClicks(id: number): Promise<void>;

  // Category management
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Session store
  sessionStore: any; // Using any type to fix typescript error
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any type to fix typescript error

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });

    // Check if admin user exists, if not create one
    this.getUserByEmail("admin@earnapp.com").then(async (adminUser) => {
      if (!adminUser) {
        const hashedPassword = await bcrypt.hash("admin123", 10);

        const user = await this.createUser({
          username: "admin",
          email: "admin@earnapp.com",
          password: hashedPassword
        });

        // Make the user an admin
        await db.update(users)
          .set({ isAdmin: true })
          .where(eq(users.id, user.id));
      }
    });
  }

  // User management methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length ? result[0] : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result.length ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Project management methods
  async getProject(id: number): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return result.length ? result[0] : undefined;
  }

  async createProject(insertProject: InsertProject, userId: number): Promise<Project> {
    const [project] = await db.insert(projects)
      .values({
        ...insertProject,
        userId,
        approved: false,
        pending: true
      })
      .returning();
    return project;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [updatedProject] = await db.update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    await db.delete(projects).where(eq(projects.id, id));
    return true; // In PostgreSQL with Drizzle, we don't get a count directly
  }

  async getProjectsByUser(userId: number): Promise<Project[]> {
    console.log("getProjectsByUser called with userId:", userId);
    const result = await db.select().from(projects).where(eq(projects.userId, userId));
    console.log("getProjectsByUser result:", result);
    return result;
  }

  async getProjectsByCategory(category: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.category, category));
  },

  async incrementProjectClicks(id: number): Promise<void> {
    await db
      .update(projects)
      .set({ clicks: sql`clicks + 1` })
      .where(eq(projects.id, id));
  },

  async getApprovedProjects(): Promise<Project[]> {
    return db.select()
      .from(projects)
      .where(eq(projects.approved, true))
      .orderBy(desc(projects.createdAt));
  }

  async getPendingProjects(): Promise<Project[]> {
    const pendingProjects = await db.select()
      .from(projects)
      .where(eq(projects.pending, true));

    console.log("Pending projects:", pendingProjects);
    return pendingProjects;
  }

  async approveProject(id: number): Promise<Project | undefined> {
    const [updatedProject] = await db.update(projects)
      .set({
        approved: true,
        pending: false
      })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async rejectProject(id: number): Promise<Project | undefined> {
    const [updatedProject] = await db.update(projects)
      .set({
        approved: false,
        pending: false
      })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async verifyProject(id: number): Promise<Project | undefined> {
    const [updatedProject] = await db.update(projects)
      .set({
        verified: true
      })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async unverifyProject(id: number): Promise<Project | undefined> {
    const [updatedProject] = await db.update(projects)
      .set({
        verified: false
      })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  // Category management methods
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.name);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result.length ? result[0] : undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug));
    return result.length ? result[0] : undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db.update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    // Check if there are projects using this category
    const categoryToDelete = await this.getCategory(id);
    if (!categoryToDelete) return false;

    const projectsWithCategory = await this.getProjectsByCategory(categoryToDelete.slug);
    if (projectsWithCategory.length > 0) {
      // Category is in use, cannot delete
      return false;
    }

    await db.delete(categories).where(eq(categories.id, id));
    return true;
  }
}

// Menggunakan DatabaseStorage untuk penyimpanan data
export const storage = new DatabaseStorage();