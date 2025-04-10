
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import { z } from "zod";
import { insertProjectSchema, insertCategorySchema, insertSiteSettingsSchema, insertJournalSchema } from "@shared/schema";

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

  app.get("/api/journals/featured", async (req, res) => {
    try {
      const journals = await storage.getFeaturedJournals();
      res.status(200).json(journals);
    } catch (error) {
      res.status(500).json({ message: "Error fetching featured journals" });
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

  const httpServer = createServer(app);
  return httpServer;
}
