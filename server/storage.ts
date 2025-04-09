import { users, projects, type User, type InsertUser, type Project, type InsertProject } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private userIdCounter: number;
  private projectIdCounter: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.userIdCounter = 1;
    this.projectIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Add an admin user for testing
    this.createUser({
      username: "admin",
      email: "admin@earnapp.com",
      password: "$2b$10$NL5o1PB3Qq1hWnvaFgeBluPH8nFCJqmEg9Wz9OBGtPHs4RYxyQN3K" // "admin123"
    }).then(user => {
      // Update the user to make them admin
      const adminUser = { ...user, isAdmin: true };
      this.users.set(user.id, adminUser);
    });
  }

  // User management methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === username.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      isAdmin: false,
      memberSince: now
    };
    this.users.set(id, user);
    return user;
  }

  // Project management methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject, userId: number): Promise<Project> {
    const id = this.projectIdCounter++;
    const now = new Date();
    const project: Project = {
      ...insertProject,
      id,
      userId,
      approved: false,
      pending: true,
      createdAt: now
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  async getProjectsByUser(userId: number): Promise<Project[]> {
    const userProjects: Project[] = [];
    for (const project of this.projects.values()) {
      if (project.userId === userId) {
        userProjects.push(project);
      }
    }
    return userProjects;
  }

  async getProjectsByCategory(category: string): Promise<Project[]> {
    const filtered: Project[] = [];
    for (const project of this.projects.values()) {
      if (project.category === category && project.approved) {
        filtered.push(project);
      }
    }
    return filtered;
  }

  async getApprovedProjects(): Promise<Project[]> {
    const approved: Project[] = [];
    for (const project of this.projects.values()) {
      if (project.approved) {
        approved.push(project);
      }
    }
    return approved.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPendingProjects(): Promise<Project[]> {
    const pending: Project[] = [];
    for (const project of this.projects.values()) {
      if (project.pending) {
        pending.push(project);
      }
    }
    return pending;
  }

  async approveProject(id: number): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject = { 
      ...project, 
      approved: true,
      pending: false
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async rejectProject(id: number): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject = { 
      ...project, 
      approved: false,
      pending: false
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
}

export const storage = new MemStorage();
