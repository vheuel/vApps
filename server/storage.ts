import { 
  users, projects, categories, siteSettings, journals, comments, oauthProviders, userOAuthConnections,
  userFollowers, userCoins,
  type User, type InsertUser, type Project, type InsertProject, type Category, type InsertCategory, 
  type SiteSettings, type InsertSiteSettings, type Journal, type InsertJournal, type Comment, type InsertComment,
  type OAuthProvider, type InsertOAuthProvider, type UserOAuthConnection, type InsertUserOAuthConnection,
  type UserFollower, type InsertUserFollower, type UserCoin, type InsertUserCoin, type UserWithStats
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
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
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  verifyUser(id: number): Promise<User | undefined>;
  unverifyUser(id: number): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
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
  
  // Post management
  getPost(id: number): Promise<Journal | undefined>;
  createPost(post: InsertJournal, userId: number): Promise<Journal>;
  updatePost(id: number, post: Partial<InsertJournal>): Promise<Journal | undefined>;
  deletePost(id: number): Promise<boolean>;
  getPostsByUser(userId: number): Promise<Journal[]>;
  getAllPosts(): Promise<Journal[]>;
  getFeaturedPosts(): Promise<Journal[]>;
  setPostAsFeatured(id: number, featured: boolean): Promise<Journal | undefined>;
  likePost(id: number): Promise<Journal | undefined>;
  unlikePost(id: number): Promise<Journal | undefined>;
  addCommentToPost(id: number): Promise<Journal | undefined>;
  
  // For backward compatibility (Journal/Blog management)
  getJournal(id: number): Promise<Journal | undefined>;
  createJournal(journal: InsertJournal, userId: number): Promise<Journal>;
  updateJournal(id: number, journal: Partial<InsertJournal>): Promise<Journal | undefined>;
  deleteJournal(id: number): Promise<boolean>;
  getJournalsByUser(userId: number): Promise<Journal[]>;
  getAllJournals(): Promise<Journal[]>;
  getFeaturedJournals(): Promise<Journal[]>;
  setJournalAsFeatured(id: number, featured: boolean): Promise<Journal | undefined>;
  likeJournal(id: number): Promise<Journal | undefined>;
  unlikeJournal(id: number): Promise<Journal | undefined>;
  addComment(id: number): Promise<Journal | undefined>;
  
  // Comment management
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  createCommentForPost(comment: InsertComment, userId: number): Promise<Comment>;
  deleteComment(id: number, userId?: number): Promise<boolean>;
  
  // For backward compatibility
  getCommentsByJournalId(journalId: number): Promise<Comment[]>;
  createComment(comment: InsertComment, userId: number): Promise<Comment>;
  
  // Category management
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Site settings management
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings>;
  
  // Follow system
  followUser(followerId: number, followingId: number): Promise<boolean>;
  unfollowUser(followerId: number, followingId: number): Promise<boolean>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;
  getFollowersCount(userId: number): Promise<number>;
  getFollowingCount(userId: number): Promise<number>;
  
  // User stats
  getUserStats(userId: number): Promise<UserWithStats | undefined>;
  getUserCoins(userId: number): Promise<number>;
  addUserCoins(userId: number, amount: number): Promise<number>;
  
  // OAuth Provider management
  getOAuthProviders(): Promise<OAuthProvider[]>;
  getOAuthProvider(id: number): Promise<OAuthProvider | undefined>;
  getOAuthProviderByName(provider: string): Promise<OAuthProvider | undefined>;
  createOAuthProvider(provider: InsertOAuthProvider): Promise<OAuthProvider>;
  updateOAuthProvider(id: number, provider: Partial<InsertOAuthProvider>): Promise<OAuthProvider | undefined>;
  deleteOAuthProvider(id: number): Promise<boolean>;
  enableOAuthProvider(id: number): Promise<OAuthProvider | undefined>;
  disableOAuthProvider(id: number): Promise<OAuthProvider | undefined>;
  
  // User OAuth connections
  getUserOAuthConnections(userId: number): Promise<UserOAuthConnection[]>;
  getUserOAuthConnectionByProvider(userId: number, provider: string): Promise<UserOAuthConnection | undefined>;
  createUserOAuthConnection(connection: InsertUserOAuthConnection): Promise<UserOAuthConnection>;
  deleteUserOAuthConnection(id: number): Promise<boolean>;
  findUserByOAuthProvider(provider: string, providerId: string): Promise<User | undefined>;
  
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
    
    // We'll skip auto-creating admin user since we already have one
    // This section was causing issues with the duplicate username constraint
  }
  
  // Follow system methods
  async followUser(followerId: number, followingId: number): Promise<boolean> {
    try {
      // Verify that the users exist
      const follower = await this.getUser(followerId);
      const following = await this.getUser(followingId);
      
      if (!follower || !following) {
        return false;
      }
      
      // Check if already following
      const isAlreadyFollowing = await this.isFollowing(followerId, followingId);
      if (isAlreadyFollowing) {
        return true; // Already following, no need to insert again
      }
      
      // Create the follow relationship
      await db.insert(userFollowers).values({
        followerId,
        followingId,
      });
      
      return true;
    } catch (error) {
      console.error("Error in followUser:", error);
      return false;
    }
  }
  
  async unfollowUser(followerId: number, followingId: number): Promise<boolean> {
    try {
      await db.delete(userFollowers)
        .where(
          and(
            eq(userFollowers.followerId, followerId),
            eq(userFollowers.followingId, followingId)
          )
        );
      
      return true;
    } catch (error) {
      console.error("Error in unfollowUser:", error);
      return false;
    }
  }
  
  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    try {
      const result = await db.select()
        .from(userFollowers)
        .where(
          and(
            eq(userFollowers.followerId, followerId),
            eq(userFollowers.followingId, followingId)
          )
        );
      
      return result.length > 0;
    } catch (error) {
      console.error("Error in isFollowing:", error);
      return false;
    }
  }
  
  async getFollowers(userId: number): Promise<User[]> {
    try {
      // Find all users who are following the given user
      const followers = await db.select({
        followerId: userFollowers.followerId
      })
      .from(userFollowers)
      .where(eq(userFollowers.followingId, userId));
      
      // Get the actual user objects
      const followerIds = followers.map(f => f.followerId);
      
      if (followerIds.length === 0) {
        return [];
      }
      
      const followerUsers = await db.select()
        .from(users)
        .where(inArray(users.id, followerIds));
      
      return followerUsers;
    } catch (error) {
      console.error("Error in getFollowers:", error);
      return [];
    }
  }
  
  async getFollowing(userId: number): Promise<User[]> {
    try {
      // Find all users the given user is following
      const following = await db.select({
        followingId: userFollowers.followingId
      })
      .from(userFollowers)
      .where(eq(userFollowers.followerId, userId));
      
      // Get the actual user objects
      const followingIds = following.map(f => f.followingId);
      
      if (followingIds.length === 0) {
        return [];
      }
      
      const followingUsers = await db.select()
        .from(users)
        .where(inArray(users.id, followingIds));
      
      return followingUsers;
    } catch (error) {
      console.error("Error in getFollowing:", error);
      return [];
    }
  }
  
  async getFollowersCount(userId: number): Promise<number> {
    try {
      const followers = await db.select({
        count: sql<number>`count(*)`
      })
      .from(userFollowers)
      .where(eq(userFollowers.followingId, userId));
      
      return followers[0]?.count || 0;
    } catch (error) {
      console.error("Error in getFollowersCount:", error);
      return 0;
    }
  }
  
  async getFollowingCount(userId: number): Promise<number> {
    try {
      const following = await db.select({
        count: sql<number>`count(*)`
      })
      .from(userFollowers)
      .where(eq(userFollowers.followerId, userId));
      
      return following[0]?.count || 0;
    } catch (error) {
      console.error("Error in getFollowingCount:", error);
      return 0;
    }
  }
  
  // User stats methods
  async getUserStats(userId: number): Promise<UserWithStats | undefined> {
    try {
      const user = await this.getUser(userId);
      if (!user) return undefined;
      
      // Get counts
      const followersCount = await this.getFollowersCount(userId);
      const followingCount = await this.getFollowingCount(userId);
      
      // Get posts count
      const postsResult = await db.select({
        count: sql<number>`count(*)`
      })
      .from(journals)
      .where(eq(journals.userId, userId));
      const postsCount = postsResult[0]?.count || 0;
      
      // Get projects count
      const projectsResult = await db.select({
        count: sql<number>`count(*)`
      })
      .from(projects)
      .where(eq(projects.userId, userId));
      const projectsCount = projectsResult[0]?.count || 0;
      
      // Get user coins
      const coins = await this.getUserCoins(userId);
      
      return {
        ...user,
        _count: {
          followers: followersCount,
          following: followingCount,
          posts: postsCount,
          projects: projectsCount
        },
        coins
      };
    } catch (error) {
      console.error("Error in getUserStats:", error);
      return undefined;
    }
  }
  
  async getUserCoins(userId: number): Promise<number> {
    try {
      // Check if user has a coins record
      const coinsRecord = await db.select()
        .from(userCoins)
        .where(eq(userCoins.userId, userId));
      
      if (coinsRecord.length > 0) {
        return coinsRecord[0].amount;
      }
      
      // If no record exists, create one with 0 coins
      await db.insert(userCoins).values({
        userId,
        amount: 0
      });
      
      return 0;
    } catch (error) {
      console.error("Error in getUserCoins:", error);
      return 0;
    }
  }
  
  async addUserCoins(userId: number, amount: number): Promise<number> {
    try {
      // Get current coins
      const currentCoins = await this.getUserCoins(userId);
      const newAmount = currentCoins + amount;
      
      // Update coins
      const [updatedCoins] = await db.update(userCoins)
        .set({ amount: newAmount, updatedAt: new Date() })
        .where(eq(userCoins.userId, userId))
        .returning();
      
      return updatedCoins ? updatedCoins.amount : newAmount;
    } catch (error) {
      console.error("Error in addUserCoins:", error);
      return 0;
    }
  }

  // User management methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Convert to lowercase for comparison - using simpler implementation with string operation
    const allUsers = await db.select().from(users);
    const user = allUsers.find(u => 
      u.username.toLowerCase() === username.toLowerCase()
    );
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    // Using a simpler implementation for case-insensitive email matching
    const allUsers = await db.select().from(users);
    const user = allUsers.find(u => 
      u.email.toLowerCase() === email.toLowerCase()
    );
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async verifyUser(id: number): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ verified: true })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async unverifyUser(id: number): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ verified: false })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
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
    return db.select()
      .from(projects)
      .where(
        and(
          eq(projects.category, category),
          eq(projects.approved, true)
        )
      );
  }

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
  
  // Post management methods (previously Journal/Blog)
  async getPost(id: number): Promise<Journal | undefined> {
    const result = await db.select().from(journals).where(eq(journals.id, id));
    if (!result.length) return undefined;
    
    // Tambahkan informasi user ke post
    const post = result[0];
    const user = await this.getUser(post.userId);
    
    return {
      ...post,
      user: user ? {
        username: user.username,
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin,
        verified: user.verified
      } : null
    };
  }
  
  // Alias untuk backward compatibility
  async getJournal(id: number): Promise<Journal | undefined> {
    return this.getPost(id);
  }

  async createPost(insertJournal: InsertJournal, userId: number): Promise<Journal> {
    const [post] = await db.insert(journals)
      .values({
        ...insertJournal,
        userId,
        published: insertJournal.published !== undefined ? insertJournal.published : true,
        featured: insertJournal.featured !== undefined ? insertJournal.featured : false
      })
      .returning();
    
    // Tambahkan informasi user
    const user = await this.getUser(userId);
    return {
      ...post,
      user: user ? {
        username: user.username,
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin,
        verified: user.verified
      } : null
    };
  }
  
  // Alias untuk backward compatibility
  async createJournal(insertJournal: InsertJournal, userId: number): Promise<Journal> {
    return this.createPost(insertJournal, userId);
  }

  async updatePost(id: number, updates: Partial<InsertJournal>): Promise<Journal | undefined> {
    const [updatedPost] = await db.update(journals)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(journals.id, id))
      .returning();
    
    if (!updatedPost) return undefined;
    
    // Tambahkan informasi user
    const user = await this.getUser(updatedPost.userId);
    return {
      ...updatedPost,
      user: user ? {
        username: user.username,
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin,
        verified: user.verified
      } : null
    };
  }
  
  // Alias untuk backward compatibility
  async updateJournal(id: number, updates: Partial<InsertJournal>): Promise<Journal | undefined> {
    return this.updatePost(id, updates);
  }

  async deletePost(id: number): Promise<boolean> {
    await db.delete(journals).where(eq(journals.id, id));
    return true;
  }
  
  // Alias untuk backward compatibility
  async deleteJournal(id: number): Promise<boolean> {
    return this.deletePost(id);
  }

  async getPostsByUser(userId: number): Promise<Journal[]> {
    const posts = await db.select()
      .from(journals)
      .where(eq(journals.userId, userId))
      .orderBy(desc(journals.createdAt));
    
    // Untuk setiap post, dapatkan info user dan tambahkan ke post
    const postsWithUsers = await Promise.all(posts.map(async (post) => {
      const user = await this.getUser(post.userId);
      return {
        ...post,
        user: user ? {
          username: user.username,
          avatarUrl: user.avatarUrl,
          isAdmin: user.isAdmin,
          verified: user.verified
        } : null
      };
    }));
    
    return postsWithUsers;
  }
  
  // Alias untuk backward compatibility
  async getJournalsByUser(userId: number): Promise<Journal[]> {
    return this.getPostsByUser(userId);
  }

  async getAllPosts(): Promise<Journal[]> {
    const posts = await db.select()
      .from(journals)
      .where(eq(journals.published, true))
      .orderBy(desc(journals.createdAt));
    
    // Untuk setiap post, dapatkan info user dan tambahkan ke post
    const postsWithUsers = await Promise.all(posts.map(async (post) => {
      const user = await this.getUser(post.userId);
      return {
        ...post,
        user: user ? {
          username: user.username,
          avatarUrl: user.avatarUrl,
          isAdmin: user.isAdmin,
          verified: user.verified
        } : null
      };
    }));
    
    return postsWithUsers;
  }
  
  // Alias untuk backward compatibility
  async getAllJournals(): Promise<Journal[]> {
    return this.getAllPosts();
  }

  // Use a simple in-memory cache to improve performance
  private featuredPostsCache: { data: Journal[] | null; timestamp: number } = { 
    data: null, 
    timestamp: 0 
  };
  private CACHE_TTL = 60 * 1000; // 1 minute cache

  async getFeaturedPosts(): Promise<Journal[]> {
    // Check if we have a valid cache
    const now = Date.now();
    if (this.featuredPostsCache.data && now - this.featuredPostsCache.timestamp < this.CACHE_TTL) {
      return this.featuredPostsCache.data;
    }

    // If not in cache or expired, fetch from database
    const posts = await db.select()
      .from(journals)
      .where(
        and(
          eq(journals.published, true),
          eq(journals.featured, true)
        )
      )
      .orderBy(desc(journals.createdAt));
    
    // Get all unique user IDs from posts to minimize database queries
    const userIds = Array.from(new Set(posts.map(post => post.userId)));
    
    // Fetch all users in a single batch
    const usersMap = new Map();
    await Promise.all(userIds.map(async (userId) => {
      const user = await this.getUser(userId);
      if (user) {
        usersMap.set(userId, {
          username: user.username,
          avatarUrl: user.avatarUrl,
          isAdmin: user.isAdmin,
          verified: user.verified
        });
      }
    }));
    
    // Map user data to posts
    const postsWithUsers = posts.map(post => ({
      ...post,
      user: usersMap.get(post.userId) || null
    }));
    
    // Update cache
    this.featuredPostsCache = {
      data: postsWithUsers,
      timestamp: now
    };
    
    return postsWithUsers;
  }
  
  // Alias untuk backward compatibility
  async getFeaturedJournals(): Promise<Journal[]> {
    return this.getFeaturedPosts();
  }

  async setPostAsFeatured(id: number, featured: boolean): Promise<Journal | undefined> {
    const [updatedPost] = await db.update(journals)
      .set({
        featured,
        updatedAt: new Date()
      })
      .where(eq(journals.id, id))
      .returning();
      
    if (!updatedPost) return undefined;
    
    // Tambahkan informasi user
    const user = await this.getUser(updatedPost.userId);
    return {
      ...updatedPost,
      user: user ? {
        username: user.username,
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin,
        verified: user.verified
      } : null
    };
  }
  
  // Alias untuk backward compatibility
  async setJournalAsFeatured(id: number, featured: boolean): Promise<Journal | undefined> {
    return this.setPostAsFeatured(id, featured);
  }
  
  async likePost(id: number): Promise<Journal | undefined> {
    // Ambil nilai likes saat ini
    const post = await this.getPost(id);
    if (!post) return undefined;
    
    // Tambahkan 1 ke nilai likes
    const [updatedPost] = await db.update(journals)
      .set({
        likes: post.likes + 1,
        updatedAt: new Date()
      })
      .where(eq(journals.id, id))
      .returning();
      
    if (!updatedPost) return undefined;
    
    // Tambahkan informasi user
    const user = await this.getUser(updatedPost.userId);
    return {
      ...updatedPost,
      user: user ? {
        username: user.username,
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin,
        verified: user.verified
      } : null
    };
  }
  
  // Alias untuk backward compatibility
  async likeJournal(id: number): Promise<Journal | undefined> {
    return this.likePost(id);
  }
  
  async unlikePost(id: number): Promise<Journal | undefined> {
    // Ambil nilai likes saat ini
    const post = await this.getPost(id);
    if (!post) return undefined;
    
    // Kurangi 1 dari nilai likes, tapi jangan sampai di bawah 0
    const [updatedPost] = await db.update(journals)
      .set({
        likes: Math.max(0, post.likes - 1),
        updatedAt: new Date()
      })
      .where(eq(journals.id, id))
      .returning();
      
    if (!updatedPost) return undefined;
    
    // Tambahkan informasi user
    const user = await this.getUser(updatedPost.userId);
    return {
      ...updatedPost,
      user: user ? {
        username: user.username,
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin,
        verified: user.verified
      } : null
    };
  }
  
  // Alias untuk backward compatibility
  async unlikeJournal(id: number): Promise<Journal | undefined> {
    return this.unlikePost(id);
  }
  
  async addCommentToPost(id: number): Promise<Journal | undefined> {
    // Ambil nilai comments saat ini
    const post = await this.getPost(id);
    if (!post) return undefined;
    
    // Tambahkan 1 ke nilai comments
    const [updatedPost] = await db.update(journals)
      .set({
        comments: post.comments + 1,
        updatedAt: new Date()
      })
      .where(eq(journals.id, id))
      .returning();
      
    if (!updatedPost) return undefined;
    
    // Tambahkan informasi user
    const user = await this.getUser(updatedPost.userId);
    return {
      ...updatedPost,
      user: user ? {
        username: user.username,
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin,
        verified: user.verified
      } : null
    };
  }
  
  // Alias untuk backward compatibility
  async addComment(id: number): Promise<Journal | undefined> {
    return this.addCommentToPost(id);
  }
  
  // Site Settings management
  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const settings = await db.select().from(siteSettings);
    return settings.length ? settings[0] : undefined;
  }
  
  async updateSiteSettings(updateData: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    // Check if settings already exist
    const existing = await this.getSiteSettings();
    
    if (existing) {
      // Update existing settings
      const [updated] = await db.update(siteSettings)
        .set({
          ...updateData,
          updatedAt: new Date()
        })
        .where(eq(siteSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new settings
      const [created] = await db.insert(siteSettings)
        .values({
          ...updateData,
          updatedAt: new Date()
        })
        .returning();
      return created;
    }
  }
  
  // Comment methods
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return db.select()
      .from(comments)
      .where(eq(comments.journalId, postId))
      .orderBy(desc(comments.createdAt));
  }
  
  // Alias untuk backward compatibility
  async getCommentsByJournalId(journalId: number): Promise<Comment[]> {
    return this.getCommentsByPostId(journalId);
  }
  
  async createCommentForPost(insertComment: InsertComment, userId: number): Promise<Comment> {
    const [comment] = await db.insert(comments)
      .values({
        ...insertComment,
        userId
      })
      .returning();
    
    // Update the comment count on the post
    await this.addCommentToPost(insertComment.journalId);
    
    return comment;
  }
  
  // Alias untuk backward compatibility
  async createComment(insertComment: InsertComment, userId: number): Promise<Comment> {
    return this.createCommentForPost(insertComment, userId);
  }
  
  async deleteComment(id: number, userId?: number): Promise<boolean> {
    // Optionally check if the comment belongs to the user if userId is provided
    if (userId !== undefined) {
      const [comment] = await db.select()
        .from(comments)
        .where(
          and(
            eq(comments.id, id),
            eq(comments.userId, userId)
          )
        );
      
      if (!comment) {
        // Comment doesn't exist or doesn't belong to the user
        return false;
      }
    }
    
    // Delete the comment
    await db.delete(comments).where(eq(comments.id, id));
    return true;
  }

  // OAuth Provider management
  async getOAuthProviders(): Promise<OAuthProvider[]> {
    return db.select().from(oauthProviders);
  }

  async getOAuthProvider(id: number): Promise<OAuthProvider | undefined> {
    const result = await db.select().from(oauthProviders).where(eq(oauthProviders.id, id));
    return result.length ? result[0] : undefined;
  }

  async getOAuthProviderByName(provider: string): Promise<OAuthProvider | undefined> {
    const result = await db.select().from(oauthProviders).where(eq(oauthProviders.provider, provider));
    return result.length ? result[0] : undefined;
  }

  async createOAuthProvider(provider: InsertOAuthProvider): Promise<OAuthProvider> {
    const [newProvider] = await db.insert(oauthProviders).values(provider).returning();
    return newProvider;
  }

  async updateOAuthProvider(id: number, updates: Partial<InsertOAuthProvider>): Promise<OAuthProvider | undefined> {
    const [updatedProvider] = await db.update(oauthProviders)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(oauthProviders.id, id))
      .returning();
    return updatedProvider;
  }

  async deleteOAuthProvider(id: number): Promise<boolean> {
    await db.delete(oauthProviders).where(eq(oauthProviders.id, id));
    return true;
  }

  async enableOAuthProvider(id: number): Promise<OAuthProvider | undefined> {
    const [updatedProvider] = await db.update(oauthProviders)
      .set({ enabled: true })
      .where(eq(oauthProviders.id, id))
      .returning();
    return updatedProvider;
  }

  async disableOAuthProvider(id: number): Promise<OAuthProvider | undefined> {
    const [updatedProvider] = await db.update(oauthProviders)
      .set({ enabled: false })
      .where(eq(oauthProviders.id, id))
      .returning();
    return updatedProvider;
  }

  // User OAuth connections management
  async getUserOAuthConnections(userId: number): Promise<UserOAuthConnection[]> {
    return db.select()
      .from(userOAuthConnections)
      .where(eq(userOAuthConnections.userId, userId));
  }

  async getUserOAuthConnectionByProvider(userId: number, provider: string): Promise<UserOAuthConnection | undefined> {
    const result = await db.select()
      .from(userOAuthConnections)
      .where(
        and(
          eq(userOAuthConnections.userId, userId),
          eq(userOAuthConnections.provider, provider)
        )
      );
    return result.length ? result[0] : undefined;
  }

  async createUserOAuthConnection(connection: InsertUserOAuthConnection): Promise<UserOAuthConnection> {
    const [newConnection] = await db.insert(userOAuthConnections).values(connection).returning();
    return newConnection;
  }

  async deleteUserOAuthConnection(id: number): Promise<boolean> {
    await db.delete(userOAuthConnections).where(eq(userOAuthConnections.id, id));
    return true;
  }

  async findUserByOAuthProvider(provider: string, providerId: string): Promise<User | undefined> {
    // Find the connection first
    const result = await db.select()
      .from(userOAuthConnections)
      .where(
        and(
          eq(userOAuthConnections.provider, provider),
          eq(userOAuthConnections.providerId, providerId)
        )
      );
    
    if (!result.length) return undefined;
    
    // Then get the user
    return this.getUser(result[0].userId);
  }
}

export const storage = new DatabaseStorage();