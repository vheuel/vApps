import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Project, InsertProject } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JournalList } from "@/components/journal/journal-list";
import { QuickJournalForm } from "@/components/journal/quick-journal-form";

import ProjectForm from "@/components/project/project-form";
import { format, differenceInMinutes, differenceInHours, differenceInDays, differenceInMonths, differenceInYears } from "date-fns";
import { 
  UserIcon, 
  BriefcaseIcon, 
  CalendarIcon, 
  ArrowLeft,
  MoreVertical,
  MessageSquare,
  Zap,
  Heart,
  RotateCw,
  Bookmark,
  MapPin,
  Link as LinkIcon,
  Check,
  Star,
  Image,
  Share2,
  Edit,
  Eye,
  Link2
} from "lucide-react";
import { MdVerified } from "react-icons/md";
import PortfolioTab from "@/components/profile/portfolio-tab";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

// Format time in natural language without "ago"
function formatTimeCompact(date: Date | string | number): string {
  const now = new Date();
  const dateToCompare = new Date(date);
  
  const minutesDiff = differenceInMinutes(now, dateToCompare);
  
  // Less than a minute
  if (minutesDiff < 1) {
    return "just now";
  }
  
  // Less than an hour
  if (minutesDiff < 60) {
    return `${minutesDiff} ${minutesDiff === 1 ? 'minute' : 'minutes'}`;
  }
  
  const hoursDiff = differenceInHours(now, dateToCompare);
  
  // Less than a day
  if (hoursDiff < 24) {
    return `${hoursDiff} ${hoursDiff === 1 ? 'hour' : 'hours'}`;
  }
  
  const daysDiff = differenceInDays(now, dateToCompare);
  
  // Less than a week
  if (daysDiff < 7) {
    return `${daysDiff} ${daysDiff === 1 ? 'day' : 'days'}`;
  }
  
  // Less than a month
  if (daysDiff < 30) {
    const weeks = Math.floor(daysDiff / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
  }
  
  const monthsDiff = differenceInMonths(now, dateToCompare);
  
  // Less than a year
  if (monthsDiff < 12) {
    return `${monthsDiff} ${monthsDiff === 1 ? 'month' : 'months'}`;
  }
  
  const yearsDiff = differenceInYears(now, dateToCompare);
  
  // More than a year
  return `${yearsDiff} ${yearsDiff === 1 ? 'year' : 'years'}`;
}

export default function ProfilePage() {
  const { user, update } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("journal");
  
  // Memuat ulang data pengguna hanya saat komponen pertama kali dimuat
  useEffect(() => {
    // Kita tidak perlu secara eksplisit memperbarui data user karena sudah dihandle oleh AuthProvider
    // Data user sudah dimuat dari /api/user saat navigasi ke halaman profil
    // Menghapus pemanggilan update() yang menyebabkan refresh loop
  }, []);

  const { data: projects, isLoading, isError, error } = useQuery<Project[]>({
    queryKey: ["/api/user/projects"],
    refetchOnWindowFocus: false,
    retry: 3,
  });

  // Untuk menyimpan tab yang aktif di local storage
  useEffect(() => {
    // Simpan tab aktif ke local storage saat berubah
    localStorage.setItem('profileActiveTab', activeTab);
  }, [activeTab]);
  
  // Memuat tab aktif dari local storage saat komponen dimuat
  useEffect(() => {
    const savedTab = localStorage.getItem('profileActiveTab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

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
        
        {/* Header Background - Menampilkan gambar header jika ada */}
        <div className="w-full h-36 relative overflow-hidden bg-gray-300">
          {user.headerImage ? (
            <img 
              src={user.headerImage} 
              alt="Profile Header" 
              className="w-full h-full object-cover"
            />
          ) : (
            /* Kosong, tidak ada tulisan jika tidak ada gambar header */
            <div className="w-full h-full bg-gradient-to-r from-gray-300 to-gray-400"></div>
          )}
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
            onClick={() => navigate("/profile/edit")}
          >
            Edit profil
          </Button>
        </div>
        
        {/* Bio and Other Info */}
        <div className="px-4 pt-12 pb-4">
          <div className="flex items-center mb-1">
            <h1 className="text-xl font-bold">
              {user.username.charAt(0).toUpperCase() + user.username.slice(1)}
            </h1>
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
              <MapPin className="h-4 w-4 mr-1" />
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
                value="journal" 
                className="w-36 py-3 rounded-none relative bg-transparent data-[state=active]:bg-[#f0f9ff] data-[state=active]:font-bold text-gray-500 dark:text-gray-400 font-medium data-[state=active]:text-black data-[state=active]:shadow-none"
              >
                <span>Posts</span>
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-500 transform data-[state=active]:scale-100 scale-0 transition-transform duration-200 ease-in-out rounded-full mx-auto w-3/4"></span>
              </TabsTrigger>
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

      {/* Quick Journal Form - positioned below the tabs but above all content */}
      <div className="container mx-auto px-4 pt-4">
        <QuickJournalForm />
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
                {[...projects]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((project) => (
                  <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex">
                        <Avatar className="h-10 w-10 mr-3 bg-sky-200">
                          {user.avatarUrl ? (
                            <AvatarImage src={user.avatarUrl} alt={user.username} />
                          ) : (
                            <AvatarFallback className="bg-sky-200">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <span className="font-semibold">{user.username.charAt(0).toUpperCase() + user.username.slice(1)}</span>
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
                          {project.iconUrl ? (
                            <AvatarImage src={project.iconUrl} alt={project.name} />
                          ) : (
                            <AvatarFallback className="bg-sky-200">M</AvatarFallback>
                          )}
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
                    
                    {/* Interaction Buttons - Simplified, all aligned to the right */}
                    <div className="mt-3 flex items-center justify-end space-x-4 text-gray-500 dark:text-gray-400">
                      <button className="p-2 hover:text-blue-500 flex items-center">
                        <MessageSquare className="h-5 w-5 mr-1" />
                        <span>1</span>
                      </button>
                      <button className="p-2 hover:text-red-500 flex items-center">
                        <Heart className="h-5 w-5" />
                        <span className="ml-1">1</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="flex justify-center mb-4">
                  <Eye className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No projects found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't submitted any projects yet.</p>
                <Button onClick={() => navigate("/submit-project")}>
                  Submit a project
                </Button>
              </div>
            )}
          </>
        ) : activeTab === "activity" ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-4">
              {/* Activity untuk avatar */}
              {user.avatarUrl && (
                <div className="flex items-start space-x-3 pb-4 border-b dark:border-gray-700">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                    <Image className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <span className="font-medium">{user.username.charAt(0).toUpperCase() + user.username.slice(1)}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">· {formatTimeCompact(new Date(Date.now() - 3600000 * 0.5))}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Update foto profil</p>
                    {/* Menampilkan preview gambar avatar */}
                    <div className="mt-2 overflow-hidden rounded-md">
                      <img 
                        src={user.avatarUrl} 
                        alt="Profile Avatar" 
                        className="w-16 h-16 object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Activity untuk header image */}
              {user.headerImage && (
                <div className="flex items-start space-x-3 pb-4 border-b dark:border-gray-700">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                    <Image className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <span className="font-medium">{user.username.charAt(0).toUpperCase() + user.username.slice(1)}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">· {formatTimeCompact(new Date(Date.now() - 3600000 * 1.5))}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Update header image</p>
                    {/* Menampilkan preview header image */}
                    <div className="mt-2 overflow-hidden rounded-md">
                      <img 
                        src={user.headerImage} 
                        alt="Header Image" 
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Activity untuk bio */}
              {user.bio && (
                <div className="flex items-start space-x-3 pb-4 border-b dark:border-gray-700">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                    <Edit className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <span className="font-medium">{user.username.charAt(0).toUpperCase() + user.username.slice(1)}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">· {formatTimeCompact(new Date(Date.now() - 3600000 * 3))}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Update bio</p>
                    {/* Menampilkan bio content */}
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity untuk website */}
              {user.website && (
                <div className="flex items-start space-x-3 pb-4 border-b dark:border-gray-700">
                  <div className="p-2 rounded-full bg-pink-100 dark:bg-pink-900">
                    <Link2 className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <span className="font-medium">{user.username.charAt(0).toUpperCase() + user.username.slice(1)}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">· {formatTimeCompact(new Date(Date.now() - 3600000 * 5))}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Update website to <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{user.website}</a>
                    </p>
                  </div>
                </div>
              )}

              {/* Activity untuk location */}
              {user.location && (
                <div className="flex items-start space-x-3 pb-4 border-b dark:border-gray-700">
                  <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
                    <MapPin className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <span className="font-medium">{user.username.charAt(0).toUpperCase() + user.username.slice(1)}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">· {formatTimeCompact(new Date(Date.now() - 3600000 * 7))}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Update location to {user.location}
                    </p>
                  </div>
                </div>
              )}

              {/* Activity untuk company */}
              {user.company && (
                <div className="flex items-start space-x-3 pb-4 border-b dark:border-gray-700">
                  <div className="p-2 rounded-full bg-cyan-100 dark:bg-cyan-900">
                    <BriefcaseIcon className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <span className="font-medium">{user.username.charAt(0).toUpperCase() + user.username.slice(1)}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">· {formatTimeCompact(new Date(Date.now() - 3600000 * 12))}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      Update perusahaan to {user.company}
                    </p>
                  </div>
                </div>
              )}

              {/* Project activities */}
              {projects && projects.length > 0 && (
                [...projects]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5) // Show only the last 5 projects
                .map((project) => (
                  <div key={`activity-${project.id}`} className="flex items-start space-x-3 pb-4 border-b dark:border-gray-700">
                    <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900">
                      {project.verified ? (
                        <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <Share2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="font-medium">{user.username.charAt(0).toUpperCase() + user.username.slice(1)}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">· {formatTimeCompact(project.createdAt)}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        {project.verified ? "Got verified for " : "Submitted "} 
                        <Link href={`/category/${project.category}`} className="text-blue-500 hover:underline">{project.name}</Link>
                      </p>
                      {project.verified && (
                        <div className="mt-1 text-sm text-green-600 dark:text-green-400 flex items-center">
                          <Check className="h-4 w-4 mr-1" /> Verified project
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Joined activity */}
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-teal-100 dark:bg-teal-900">
                  <UserIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center">
                    <span className="font-medium">{user.username.charAt(0).toUpperCase() + user.username.slice(1)}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">· {user.memberSince ? format(new Date(user.memberSince), 'MMMM yyyy') : 'Recently'}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Joined the platform
                  </p>
                </div>
              </div>

              {/* Show empty state if no activity */}
              {(!user.avatarUrl && !user.bio && !user.location && !user.website && !user.company && 
                (!projects || projects.length === 0)) && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">Belum ada aktivitas.</p>
              )}
            </div>
          </div>
        ) : activeTab === "portfolio" ? (
          // Portfolio Tab Content
          <PortfolioTab />
        ) : activeTab === "journal" ? (
          // Posts Tab Content
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Posts</h2>
              <Button 
                onClick={() => navigate("/journals")}
                variant="outline"
                size="sm"
              >
                <Link href="/journals">Manage Posts</Link>
              </Button>
            </div>
            
            <JournalList 
              userId={user.id} 
              showManageOptions={false} 
              limit={5}
            />
          </div>
        ) : null}
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
    </div>
  );
}