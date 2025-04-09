import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Project, InsertProject, User } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

import ProjectCard from "@/components/project/project-card";
import ProjectForm from "@/components/project/project-form";
import { format, formatDistanceToNow } from "date-fns";
import { 
  UserIcon, 
  BriefcaseIcon, 
  CalendarIcon, 
  MailIcon, 
  ArrowLeft,
  Globe,
  Building2,
  CheckCircle,
  Pencil,
  MoreVertical,
  MessageSquare,
  Zap,
  Heart,
  RotateCw,
  Bookmark
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Schema for profile edit
const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().email("Please enter a valid email address"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  bio: z.string().max(200, "Bio should be less than 200 characters").optional(),
  location: z.string().max(100).optional(),
});

// Schema for password change
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const { user, update } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("project");

  const { data: projects, isLoading, isError, error } = useQuery<Project[]>({
    queryKey: ["/api/user/projects"],
    refetchOnWindowFocus: true,
    retry: 3,
  });

  // Debugging untuk melihat response
  useEffect(() => {
    if (isError) {
      console.error("Error fetching user projects:", error);
    }
    if (projects) {
      console.log("User projects:", projects);
    }
  }, [projects, isError, error]);

  // Form untuk edit profile
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      website: user?.website || "",
      bio: user?.bio || "",
      location: user?.location || "",
    },
  });

  // Form untuk ganti password
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const res = await apiRequest("PUT", "/api/user/update", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      update(data);
      setIsProfileDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Password update mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { 
      currentPassword: string; 
      newPassword: string; 
    }) => {
      const res = await apiRequest("PUT", "/api/user/update", {
        password: data.newPassword,
        currentPassword: data.currentPassword,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      passwordForm.reset();
      setIsPasswordDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (data: { id: number; project: Partial<InsertProject> }) => {
      const res = await apiRequest("PUT", `/api/projects/${data.id}`, data.project);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/projects"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Project updated",
        description: "Your project has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update project. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleEditProject = (project: Project) => {
    setEditProject(project);
    setIsEditDialogOpen(true);
  };

  const handleSubmitEdit = (values: InsertProject) => {
    if (editProject) {
      updateProjectMutation.mutate({
        id: editProject.id,
        project: values,
      });
    }
  };

  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    updatePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  // Calculate project statistics
  const totalProjects = projects?.length || 0;
  const approvedProjects = projects?.filter(p => p.approved).length || 0;
  const pendingProjects = projects?.filter(p => p.pending).length || 0;
  const verifiedProjects = projects?.filter(p => p.verified).length || 0;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header - hidden for now 
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="text-gray-500 dark:text-gray-400">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex">
            <button className="text-gray-500 dark:text-gray-400 mr-4">
              <Globe className="h-6 w-6" />
            </button>
            <button className="text-gray-500 dark:text-gray-400">
              <MoreVertical className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      */}

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 pb-8">
        <div className="container mx-auto px-4 pt-8">
          <div className="flex flex-col items-center">
            <div className="mb-5 relative">
              <Avatar className="h-24 w-24 bg-gray-100 dark:bg-gray-700 border-[6px] border-white dark:border-gray-800 shadow-lg">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                  <UserIcon className="h-12 w-12 text-gray-500 dark:text-gray-400" />
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="text-center mb-3">
              <div className="flex items-center justify-center mb-1">
                <h1 className="text-3xl font-bold">{user.username}</h1>
                {user.isAdmin && (
                  <CheckCircle className="h-6 w-6 text-blue-500 ml-2" />
                )}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">{user.email}</p>
            </div>

            <div className="flex justify-center items-center mt-4 mb-6 space-x-8 text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Globe className="h-5 w-5 mr-2 text-gray-400" />
                <a href={user.website || "#"} target="_blank" rel="noopener noreferrer" 
                  className="text-blue-500 hover:underline">
                  {user.website && user.website.trim() !== "" ? 
                    new URL(user.website).hostname : 
                    "userwebsite.com"}
                </a>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                <span>Joined {user.memberSince ? format(new Date(user.memberSince), "MMM yyyy") : "Apr 2025"}</span>
              </div>
            </div>

            <div className="w-full max-w-md">
              <Button 
                variant="outline" 
                className="w-full rounded-full h-12 text-base font-medium border-gray-200 dark:border-gray-700 bg-blue-50 hover:bg-blue-100 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                onClick={() => setIsProfileDialogOpen(true)}
              >
                edit profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto">
          <div className="grid grid-cols-4 border-t border-gray-200 dark:border-gray-700">
            <div className="py-4 text-center">
              <p className="text-2xl font-bold">{totalProjects}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">project</p>
            </div>
            <div className="py-4 text-center">
              <p className="text-2xl font-bold">{verifiedProjects}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">verified project</p>
            </div>
            <div className="py-4 text-center">
              <p className="text-2xl font-bold">{pendingProjects}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">pending</p>
            </div>
            <div className="py-4 text-center">
              <p className="text-2xl font-bold">{approvedProjects}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">approved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 rounded-none bg-transparent border-b dark:border-gray-700">
              <TabsTrigger 
                value="project" 
                className={`py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none data-[state=active]:text-blue-500 text-gray-700 dark:text-gray-300 font-medium`}
              >
                project
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className={`py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-none data-[state=active]:text-blue-500 text-gray-700 dark:text-gray-300 font-medium`}
              >
                activity
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto py-4 px-4">
        {activeTab === "project" ? (
          <>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} className="h-32 w-full" />
                ))}
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="space-y-6">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <span className="font-semibold">{user.username}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                              • {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="mt-2">
                            <span className="font-semibold">{user.username}</span> just added a{' '}
                            <Link
                              href={`/category/${project.category}`}
                              className="text-blue-500 hover:underline"
                            >
                              project name
                            </Link>{' '}
                            to{' '}
                            <Link
                              href={`/category/${project.category}`}
                              className="text-blue-500 hover:underline"
                            >
                              the category
                            </Link>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleEditProject(project)}>
                        <MoreVertical className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                    
                    {/* Project Card */}
                    <div className="mt-4 p-3 border dark:border-gray-700 rounded-lg">
                      <div className="flex items-start">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>{project.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{project.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{project.description}</p>
                          <div className="mt-2">
                            <a 
                              href={project.websiteUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 text-sm hover:underline"
                            >
                              {project.websiteUrl}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Interaction Buttons */}
                    <div className="mt-3 flex items-center justify-between text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <button className="p-2 hover:text-blue-500 flex items-center">
                          <MessageSquare className="h-5 w-5 mr-1" />
                          <span>1</span>
                        </button>
                        <button className="p-2 hover:text-blue-500 flex items-center">
                          <Zap className="h-5 w-5 mr-1" />
                          <span>1</span>
                        </button>
                      </div>
                      <div className="flex items-center">
                        <button className="p-2 hover:text-red-500">
                          <Heart className="h-5 w-5" />
                        </button>
                        <button className="p-2 hover:text-blue-500">
                          <RotateCw className="h-5 w-5" />
                        </button>
                        <button className="p-2 hover:text-yellow-500">
                          <Bookmark className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't submitted any projects yet.</p>
                <Button asChild>
                  <Link href="/submit">Submit Your First Project</Link>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No recent activities.</p>
          </div>
        )}
      </div>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {editProject && (
            <ProjectForm
              defaultValues={editProject}
              onSubmit={handleSubmitEdit}
              isSubmitting={updateProjectMutation.isPending}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your email address" type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Tell a little about yourself" 
                        className="resize-none"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://yourwebsite.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your account password
            </DialogDescription>
          </DialogHeader>
          
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Your current password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Your new password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Confirm new password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updatePasswordMutation.isPending}
                >
                  {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}