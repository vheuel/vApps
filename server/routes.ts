
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import { z } from "zod";
import { insertProjectSchema, insertCategorySchema, insertSiteSettingsSchema, insertJournalSchema } from "@shared/schema";
import { oauthRouter } from "./oauth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Projects API endpoints
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getApprovedProjects();
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching projects" });
    }
  });

  app.get("/api/projects/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const projects = await storage.getProjectsByCategory(category);
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ message: "Error fetching project" });
    }
  });

  app.get("/api/user/projects", async (req, res) => {
    console.log("GET /api/user/projects - Auth status:", req.isAuthenticated());
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      console.log("Fetching projects for user:", req.user.id);
      const projects = await storage.getProjectsByUser(req.user.id);
      console.log("User projects found:", projects);
      res.status(200).json(projects);
    } catch (error) {
      console.error("Error fetching user projects:", error);
      res.status(500).json({ message: "Error fetching user projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData, req.user.id);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Error creating project" });
    }
  });

  // Ensure updateUserSchema and related function are properly scoped
  const updateUserSchema = z.object({
    name: z.string().optional(),
    username: z.string().min(3).max(50).optional(),
    password: z.string().min(6).optional(),
    email: z.string().email().optional(),
    currentPassword: z.string().optional(), // For password verification
    bio: z.string().max(200).optional(),
    location: z.string().max(100).optional(),
    website: z.string().optional(), // Menerima semua format string, termasuk string kosong
    avatarUrl: z.string().optional(),
    company: z.string().max(100).optional(),
    headerImage: z.string().optional(),
  });

  app.put("/api/user/update", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const validatedData = updateUserSchema.parse(req.body);
      if (validatedData.password) {
        // Use the hashPassword function imported at the top of the file
        validatedData.password = await hashPassword(validatedData.password);
      }

      // Verifikasi password lama jika ada perubahan password
      if (validatedData.password && validatedData.currentPassword) {
        // Check if current password is correct
        const isPasswordValid = await comparePasswords(validatedData.currentPassword, req.user.password);
        
        if (!isPasswordValid) {
          return res.status(401).json({ message: "Current password is incorrect" });
        }
        
        // Remove the currentPassword field to avoid storing it
        delete validatedData.currentPassword;
      }
      
      // Membersihkan data gambar kosong (jika user menghapus gambar)
      // Saat avatarUrl empty string, kita set nilainya undefined untuk benar-benar menghapus dari database
      if (validatedData.avatarUrl === '') {
        validatedData.avatarUrl = undefined;
      }
      
      // Saat headerImage empty string, kita set nilainya undefined untuk benar-benar menghapus dari database
      if (validatedData.headerImage === '') {
        validatedData.headerImage = undefined;
      }
      
      // Update user in database
      const updatedUser = await storage.updateUser(req.user.id, validatedData);
      res.status(200).json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating user" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user owns the project or is admin
      if (project.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized to update this project" });
      }
      
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(id, validatedData);
      res.status(200).json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error updating project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Check if user owns the project or is admin
      if (project.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized to delete this project" });
      }
      
      await storage.deleteProject(id);
      res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting project" });
    }
  });

  // Admin routes
  app.get("/api/admin/projects/pending", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const projects = await storage.getPendingProjects();
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching pending projects" });
    }
  });

  app.post("/api/admin/projects/:id/approve", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.approveProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ message: "Error approving project" });
    }
  });

  app.post("/api/admin/projects/:id/reject", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.rejectProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ message: "Error rejecting project" });
    }
  });
  
  // Verify/unverify project routes
  app.post("/api/admin/projects/:id/verify", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.verifyProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ message: "Error verifying project" });
    }
  });
  
  app.post("/api/admin/projects/:id/unverify", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.unverifyProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ message: "Error unverifying project" });
    }
  });

  // Categories API endpoints
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ message: "Error fetching category" });
    }
  });

  app.get("/api/categories/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ message: "Error fetching category" });
    }
  });

  // Admin category management endpoints
  app.post("/api/admin/categories", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error creating category" });
    }
  });

  app.put("/api/admin/categories/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      const validatedData = insertCategorySchema.partial().parse(req.body);
      const updatedCategory = await storage.updateCategory(id, validatedData);
      res.status(200).json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error updating category" });
    }
  });

  app.delete("/api/admin/categories/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const success = await storage.deleteCategory(id);
      if (!success) {
        return res.status(400).json({ 
          message: "Cannot delete this category. It may be in use by projects." 
        });
      }
      
      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting category" });
    }
  });
  
  // Site Settings API endpoints
  app.get("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.status(200).json(settings || {});
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Error fetching site settings" });
    }
  });
  
  app.put("/api/admin/site-settings", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const validatedData = insertSiteSettingsSchema.parse(req.body);
      const updatedSettings = await storage.updateSiteSettings(validatedData);
      res.status(200).json(updatedSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      console.error("Error updating site settings:", error);
      res.status(500).json({ message: "Error updating site settings" });
    }
  });

  // Journal API endpoints
  app.get("/api/journals", async (req, res) => {
    try {
      const journals = await storage.getAllJournals();
      res.status(200).json(journals);
    } catch (error) {
      res.status(500).json({ message: "Error fetching journals" });
    }
  });

  // New endpoint: Posts (same as journals)
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching posts" });
    }
  });

  app.get("/api/journals/featured", async (req, res) => {
    try {
      const journals = await storage.getFeaturedJournals();
      res.status(200).json(journals);
    } catch (error) {
      res.status(500).json({ message: "Error fetching featured journals" });
    }
  });

  // Featured posts endpoint - optimized
  app.get("/api/posts/featured", async (req, res) => {
    try {
      // Use cached feature posts if available within the last minute
      const posts = await storage.getFeaturedPosts();
      res.status(200).json(posts);
    } catch (error) {
      console.error("Error fetching featured posts:", error);
      res.status(500).json({ message: "Error fetching featured posts" });
    }
  });

  app.get("/api/journals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid journal ID" });
      }
      
      const journal = await storage.getJournal(id);
      if (!journal) {
        return res.status(404).json({ message: "Journal not found" });
      }
      
      res.status(200).json(journal);
    } catch (error) {
      res.status(500).json({ message: "Error fetching journal" });
    }
  });

  // Posts endpoint
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ message: "Error fetching post" });
    }
  });

  app.get("/api/user/journals", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const journals = await storage.getJournalsByUser(req.user.id);
      res.status(200).json(journals);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user journals" });
    }
  });

  // Get authenticated user posts endpoint
  app.get("/api/user/posts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const posts = await storage.getPostsByUser(req.user.id);
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user posts" });
    }
  });
  
  // Get posts by specific user ID endpoint
  app.get("/api/user/:userId/posts", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const posts = await storage.getPostsByUser(userId);
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user posts" });
    }
  });
  
  // Get user profile by username (public)
  app.get("/api/users/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Jangan tampilkan password dan informasi sensitif lainnya
      const { password, ...publicUserInfo } = user;
      
      // Jika user login adalah admin atau user yang sama, tampilkan semua informasi (kecuali password)
      if (req.user && (req.user.isAdmin || req.user.id === user.id)) {
        return res.json(publicUserInfo);
      }
      
      // Jika tidak login atau user lain, jangan tampilkan email
      const { email, ...publicInfo } = publicUserInfo;
      res.json(publicInfo);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get user projects by username (public)
  app.get("/api/users/:username/projects", async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const projects = await storage.getProjectsByUser(user.id);
      
      // Jika user yang login adalah pemilik atau admin, tampilkan semua proyek
      if (req.user && (req.user.isAdmin || req.user.id === user.id)) {
        return res.json(projects);
      }
      
      // Jika tidak login atau user lain, hanya tampilkan proyek yang disetujui
      const approvedProjects = projects.filter(project => project.approved);
      res.json(approvedProjects);
    } catch (error) {
      console.error("Error fetching user projects:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get user posts by username (public)
  app.get("/api/users/:username/posts", async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const posts = await storage.getPostsByUser(user.id);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/journals", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const validatedData = insertJournalSchema.parse(req.body);
      const journal = await storage.createJournal(validatedData, req.user.id);
      res.status(201).json(journal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Error creating journal" });
    }
  });

  // New endpoint: Create a post (same as journal)
  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const validatedData = insertJournalSchema.parse(req.body);
      const post = await storage.createJournal(validatedData, req.user.id);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }
      res.status(500).json({ message: "Error creating post" });
    }
  });

  app.put("/api/journals/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid journal ID" });
      }
      
      const journal = await storage.getJournal(id);
      if (!journal) {
        return res.status(404).json({ message: "Journal not found" });
      }
      
      // Check if user owns the journal or is admin
      if (journal.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized to update this journal" });
      }
      
      const validatedData = insertJournalSchema.partial().parse(req.body);
      const updatedJournal = await storage.updateJournal(id, validatedData);
      res.status(200).json(updatedJournal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error updating journal" });
    }
  });

  // New endpoint: Update a post (same as journal)
  app.put("/api/posts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getJournal(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user owns the post or is admin
      if (post.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized to update this post" });
      }
      
      const validatedData = insertJournalSchema.partial().parse(req.body);
      const updatedPost = await storage.updateJournal(id, validatedData);
      res.status(200).json(updatedPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Error updating post" });
    }
  });

  app.delete("/api/journals/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid journal ID" });
      }
      
      const journal = await storage.getJournal(id);
      if (!journal) {
        return res.status(404).json({ message: "Journal not found" });
      }
      
      // Check if user owns the journal or is admin
      if (journal.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized to delete this journal" });
      }
      
      await storage.deleteJournal(id);
      res.status(200).json({ message: "Journal deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting journal" });
    }
  });

  // New endpoint: Delete a post (same as journal)
  app.delete("/api/posts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getJournal(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user owns the post or is admin
      if (post.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized to delete this post" });
      }
      
      await storage.deleteJournal(id);
      res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting post" });
    }
  });

  // Admin journal management endpoints
  app.post("/api/admin/journals/:id/feature", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid journal ID" });
      }
      
      const journal = await storage.setJournalAsFeatured(id, true);
      if (!journal) {
        return res.status(404).json({ message: "Journal not found" });
      }
      
      res.status(200).json(journal);
    } catch (error) {
      res.status(500).json({ message: "Error featuring journal" });
    }
  });

  // New endpoint: Feature a post (same as journal)
  app.post("/api/admin/posts/:id/feature", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.setJournalAsFeatured(id, true);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ message: "Error featuring post" });
    }
  });

  app.post("/api/admin/journals/:id/unfeature", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid journal ID" });
      }
      
      const journal = await storage.setJournalAsFeatured(id, false);
      if (!journal) {
        return res.status(404).json({ message: "Journal not found" });
      }
      
      res.status(200).json(journal);
    } catch (error) {
      res.status(500).json({ message: "Error unfeaturing journal" });
    }
  });

  // New endpoint: Unfeature a post (same as journal)
  app.post("/api/admin/posts/:id/unfeature", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.setJournalAsFeatured(id, false);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ message: "Error unfeaturing post" });
    }
  });
  
  // Like a journal
  app.post("/api/journals/:id/like", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid journal ID" });
      }
      
      const journal = await storage.likeJournal(id);
      if (!journal) {
        return res.status(404).json({ message: "Journal not found" });
      }
      
      res.status(200).json(journal);
    } catch (error) {
      res.status(500).json({ message: "Error liking journal" });
    }
  });

  // New endpoint: Like a post (same as journal)
  app.post("/api/posts/:id/like", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.likeJournal(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ message: "Error liking post" });
    }
  });
  
  // Unlike a journal
  app.post("/api/journals/:id/unlike", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid journal ID" });
      }
      
      const journal = await storage.unlikeJournal(id);
      if (!journal) {
        return res.status(404).json({ message: "Journal not found" });
      }
      
      res.status(200).json(journal);
    } catch (error) {
      res.status(500).json({ message: "Error unliking journal" });
    }
  });

  // New endpoint: Unlike a post (same as journal)
  app.post("/api/posts/:id/unlike", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.unlikeJournal(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ message: "Error unliking post" });
    }
  });
  
  // Add a comment to a journal
  app.post("/api/journals/:id/comment", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid journal ID" });
      }
      
      const journal = await storage.getJournal(id);
      if (!journal) {
        return res.status(404).json({ message: "Journal not found" });
      }
      
      // Ambil konten komentar dari body request
      const content = req.body.content;
      if (!content || typeof content !== 'string' || content.trim() === '') {
        return res.status(400).json({ message: "Comment content is required" });
      }
      
      // Buat komentar baru
      const comment = await storage.createComment({
        content: content.trim(),
        journalId: id
      }, req.user.id);
      
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Error creating comment" });
    }
  });

  // New endpoint: Add a comment to a post (same as journal)
  app.post("/api/posts/:id/comment", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getJournal(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Get comment content from request body
      const content = req.body.content;
      if (!content || typeof content !== 'string' || content.trim() === '') {
        return res.status(400).json({ message: "Comment content is required" });
      }
      
      // Create new comment
      const comment = await storage.createComment({
        content: content.trim(),
        journalId: id
      }, req.user.id);
      
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Error creating comment" });
    }
  });
  
  // Get all comments for a journal
  app.get("/api/journals/:id/comments", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid journal ID" });
      }
      
      const journal = await storage.getJournal(id);
      if (!journal) {
        return res.status(404).json({ message: "Journal not found" });
      }
      
      const comments = await storage.getCommentsByJournalId(id);
      
      // Untuk setiap komentar, ambil detail pengguna yang mengomentari
      const commentsWithUserDetails = await Promise.all(
        comments.map(async (comment) => {
          const user = await storage.getUser(comment.userId);
          return {
            ...comment,
            user: user ? {
              username: user.username,
              avatarUrl: user.avatarUrl,
              isAdmin: user.isAdmin,
              verified: user.verified
            } : null
          };
        })
      );
      
      res.status(200).json(commentsWithUserDetails);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Error fetching comments" });
    }
  });

  // New endpoint: Get all comments for a post (same as journal)
  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getJournal(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const comments = await storage.getCommentsByJournalId(id);
      
      // For each comment, get user details who commented
      const commentsWithUserDetails = await Promise.all(
        comments.map(async (comment) => {
          const user = await storage.getUser(comment.userId);
          return {
            ...comment,
            user: user ? {
              username: user.username,
              avatarUrl: user.avatarUrl,
              isAdmin: user.isAdmin,
              verified: user.verified
            } : null
          };
        })
      );
      
      res.status(200).json(commentsWithUserDetails);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Error fetching comments" });
    }
  });
  
  // Delete a comment
  app.delete("/api/comments/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }
      
      // Use updated deleteComment method with userId for permission checking
      const success = await storage.deleteComment(id, req.user.id);
      if (!success) {
        return res.status(404).json({ message: "Comment not found or you're not authorized to delete it" });
      }
      
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Error deleting comment" });
    }
  });

  // User management endpoints for admin
  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const users = await storage.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.post("/api/admin/users/:id/verify", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.verifyUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error verifying user" });
    }
  });

  app.post("/api/admin/users/:id/unverify", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.unverifyUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error unverifying user" });
    }
  });

  // Setup OAuth routes
  app.use("/api/oauth", oauthRouter);

  // User Follow System API endpoints
  app.post("/api/users/:username/follow", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // @ts-ignore
      const followerId = req.user.id;
      const { username } = req.params;
      
      // Get the user to follow
      const userToFollow = await storage.getUserByUsername(username);
      if (!userToFollow) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Cannot follow yourself
      if (followerId === userToFollow.id) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      const success = await storage.followUser(followerId, userToFollow.id);
      if (success) {
        res.status(200).json({ message: "Successfully followed user" });
      } else {
        res.status(500).json({ message: "Failed to follow user" });
      }
    } catch (error) {
      console.error("Error following user:", error);
      res.status(500).json({ message: "Error following user" });
    }
  });
  
  app.post("/api/users/:username/unfollow", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // @ts-ignore
      const followerId = req.user.id;
      const { username } = req.params;
      
      // Get the user to unfollow
      const userToUnfollow = await storage.getUserByUsername(username);
      if (!userToUnfollow) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const success = await storage.unfollowUser(followerId, userToUnfollow.id);
      if (success) {
        res.status(200).json({ message: "Successfully unfollowed user" });
      } else {
        res.status(500).json({ message: "Failed to unfollow user" });
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: "Error unfollowing user" });
    }
  });
  
  app.get("/api/users/:username/is-following", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // @ts-ignore
      const followerId = req.user.id;
      const { username } = req.params;
      
      // Get the user to check
      const userToCheck = await storage.getUserByUsername(username);
      if (!userToCheck) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const isFollowing = await storage.isFollowing(followerId, userToCheck.id);
      res.status(200).json({ isFollowing });
    } catch (error) {
      console.error("Error checking follow status:", error);
      res.status(500).json({ message: "Error checking follow status" });
    }
  });
  
  // Alias untuk /is-following untuk kompatibilitas UI
  app.get("/api/users/:username/follow-status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // @ts-ignore
      const followerId = req.user.id;
      const { username } = req.params;
      
      // Get the user to check
      const userToCheck = await storage.getUserByUsername(username);
      if (!userToCheck) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const isFollowing = await storage.isFollowing(followerId, userToCheck.id);
      res.status(200).json({ isFollowing });
    } catch (error) {
      console.error("Error checking follow status:", error);
      res.status(500).json({ message: "Error checking follow status" });
    }
  });
  
  // User Stats API endpoint - public endpoint
  app.get("/api/users/:username/stats", async (req, res) => {
    try {
      const { username } = req.params;
      
      // Get the user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const stats = await storage.getUserStats(user.id);
      if (!stats) {
        return res.status(404).json({ message: "User stats not found" });
      }
      
      res.status(200).json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Error fetching user stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
