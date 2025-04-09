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
import { format, formatDistanceToNow, differenceInMinutes, differenceInHours, differenceInDays, differenceInMonths, differenceInYears } from "date-fns";
import { 
  UserIcon, 
  BriefcaseIcon, 
  CalendarIcon, 
  MailIcon, 
  ArrowLeft,
  Globe,
  Building2,
  Pencil,
  MoreVertical,
  MessageSquare,
  Zap,
  Heart,
  RotateCw,
  Bookmark,
  Search,
  MapPin,
  Link as LinkIcon,
  MapPinIcon
} from "lucide-react";
import { MdVerified } from "react-icons/md";
import PortfolioTab from "@/components/profile/portfolio-tab";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Schema for profile edit
const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  email: z.string().email("Please enter a valid email address"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  bio: z.string().max(200, "Bio should be less than 200 characters").optional(),
  location: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
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

// Custom compact time format (1H, 1D, 1M, etc.)
function formatTimeCompact(date: Date | string | number): string {
  const now = new Date();
  const dateToCompare = new Date(date);
  
  const minutesDiff = differenceInMinutes(now, dateToCompare);
  if (minutesDiff < 60) {
    return `${minutesDiff}M`;
  }
  
  const hoursDiff = differenceInHours(now, dateToCompare);
  if (hoursDiff < 24) {
    return `${hoursDiff}H`;
  }
  
  const daysDiff = differenceInDays(now, dateToCompare);
  if (daysDiff < 30) {
    return `${daysDiff}D`;
  }
  
  const monthsDiff = differenceInMonths(now, dateToCompare);
  if (monthsDiff < 12) {
    return `${monthsDiff}M`;
  }
  
  const yearsDiff = differenceInYears(now, dateToCompare);
  return `${yearsDiff}Y`;
}

export default function ProfilePage() {
  const { user, update } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
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
      company: user?.company || "",
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
      setIsProfileDialogOpen(false);
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
      <div className="relative">
        {/* Nav Bar with Back and Search Button (fixed position on top) */}
        <div className="fixed top-0 left-0 right-0 px-4 py-2 flex justify-between z-20 bg-black bg-opacity-30">
          <button 
            onClick={() => navigate("/")} 
            className="bg-blue-900 bg-opacity-60 rounded-full p-3"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          
          <div className="flex space-x-2">
            <button className="bg-green-800 bg-opacity-60 rounded-full p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            <button className="bg-green-800 bg-opacity-60 rounded-full p-3">
              <MoreVertical className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
        
        {/* Header Background - Plain Gray with no text */}
        <div className="w-full h-36 relative overflow-hidden bg-gray-300">
          {/* Kosong, tidak ada tulisan */}
        </div>
        
        {/* Profile Picture and Edit Button - These are aligned and below the header */}
        <div className="px-4 flex justify-between items-center -mt-8 relative z-10">
          <Avatar className="h-24 w-24 bg-gray-100 border-4 border-white dark:border-gray-800 shadow-lg">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
            <AvatarFallback className="bg-gray-200">
              <UserIcon className="h-12 w-12 text-gray-500" />
            </AvatarFallback>
          </Avatar>
          
          <Button 
            variant="outline" 
            className="rounded-full px-6 bg-white text-black border-0 shadow-md font-medium"
            onClick={() => setIsProfileDialogOpen(true)}
          >
            Edit profil
          </Button>
        </div>
        
        {/* Bio and Other Info */}
        <div className="px-4 pt-12 pb-4">
          <div className="flex items-center mb-1">
            <h1 className="text-xl font-bold">{user.username}</h1>
            {user.isAdmin && (
              <MdVerified className="h-5 w-5 text-blue-500 ml-2" />
            )}
          </div>
          
          <p className="text-gray-500 dark:text-gray-400 mb-3">{user.email}</p>
          
          {/* User Bio */}
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {user.bio || "No bio available"}
          </p>
          
          {/* User Information with Icons - Horizontal layout without dots */}
          <div className="flex items-center flex-wrap text-sm text-gray-600 dark:text-gray-400 space-x-4">
            {/* Company/Organization */}
            <div className="flex items-center">
              <BriefcaseIcon className="h-4 w-4 mr-1" />
              <span>{user.company || 'No company'}</span>
            </div>
            
            {/* Location */}
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span>{user.location || 'No location'}</span>
            </div>
            
            {/* Website */}
            <div className="flex items-center">
              <LinkIcon className="h-4 w-4 mr-1" />
              {user.website ? (
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {user.website.replace(/^https?:\/\//, '')}
                </a>
              ) : (
                <span>No website</span>
              )}
            </div>
            
            {/* Join date */}
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>Joined {user.memberSince ? format(new Date(user.memberSince), 'MMMM yyyy') : 'Recently'}</span>
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
      <div className="bg-white dark:bg-gray-800">
        <div className="container mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full flex rounded-none bg-transparent justify-center border-0">
              <TabsTrigger 
                value="project" 
                className="w-36 py-3 rounded-none relative bg-transparent data-[state=active]:bg-[#f0f9ff] data-[state=active]:font-bold text-gray-500 dark:text-gray-400 font-medium data-[state=active]:text-black data-[state=active]:shadow-none"
              >
                <span>Projects</span>
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-500 transform data-[state=active]:scale-100 scale-0 transition-transform duration-200 ease-in-out rounded-full mx-auto w-3/4"></span>
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="w-36 py-3 rounded-none relative bg-transparent data-[state=active]:bg-[#f0f9ff] data-[state=active]:font-bold text-gray-500 dark:text-gray-400 font-medium data-[state=active]:text-black data-[state=active]:shadow-none"
              >
                <span>Activity</span>
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-500 transform data-[state=active]:scale-100 scale-0 transition-transform duration-200 ease-in-out rounded-full mx-auto w-3/4"></span>
              </TabsTrigger>
              <TabsTrigger 
                value="portfolio" 
                className="w-36 py-3 rounded-none relative bg-transparent data-[state=active]:bg-[#f0f9ff] data-[state=active]:font-bold text-gray-500 dark:text-gray-400 font-medium data-[state=active]:text-black data-[state=active]:shadow-none"
              >
                <span>Portfolio</span>
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-500 transform data-[state=active]:scale-100 scale-0 transition-transform duration-200 ease-in-out rounded-full mx-auto w-3/4"></span>
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
                        <Avatar className="h-10 w-10 mr-3 bg-sky-200">
                          <AvatarFallback className="bg-sky-200">{user.username.charAt(0).toLowerCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <span className="font-semibold">{user.username}</span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                              · {formatTimeCompact(project.createdAt)}
                            </span>
                          </div>
                          <div className="mt-2">
                            Just added {' '}
                            <Link
                              href={`/category/${project.category}`}
                              className="text-blue-500 hover:underline"
                            >
                              {project.name}
                            </Link>{' '}
                            to{' '}
                            <Link
                              href={`/category/${project.category}`}
                              className="text-blue-500 hover:underline"
                            >
                              {project.category}
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
                        <Avatar className="h-10 w-10 mr-3 bg-sky-200">
                          <AvatarFallback className="bg-sky-200">M</AvatarFallback>
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
        ) : activeTab === "activity" ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No recent activities.</p>
          </div>
        ) : (
          // Portfolio Tab Content
          <PortfolioTab />
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
              Update your profile information and password
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="profile" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="pt-4">
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
                  
                  <FormField
                    control={profileForm.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company/Organization</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your company or organization" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
            </TabsContent>
            
            <TabsContent value="password" className="pt-4">
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
                    <Button type="button" variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
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
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>


    </div>
  );
}