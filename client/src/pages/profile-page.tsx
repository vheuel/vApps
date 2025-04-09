import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Project, InsertProject } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProjectCard from "@/components/project/project-card";
import ProjectForm from "@/components/project/project-form";
import { formatDistanceToNow } from "date-fns";
import { UserIcon, BriefcaseIcon, CalendarIcon, MailIcon, Plus, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const updateProjectMutation = useMutation({
    mutationFn: async (data: { id: number; project: Partial<InsertProject> }) => {
      const res = await apiRequest("PUT", `/api/projects/${data.id}`, data.project);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/projects"] });
      setIsEditDialogOpen(false);
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

  const memberSince = user.memberSince ? new Date(user.memberSince) : new Date();

  return (
    <div className="container mx-auto py-8 px-4">
      {/* User Info Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 sm:mb-0">
              <UserIcon className="h-12 w-12 text-primary" />
            </div>
            <div className="sm:ml-6 text-center sm:text-left">
              <h2 className="text-2xl font-semibold">{user.username}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center">
                  <MailIcon className="h-4 w-4 text-muted-foreground mr-2" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center">
                  <BriefcaseIcon className="h-4 w-4 text-muted-foreground mr-2" />
                  <span>Projects: {totalProjects}</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground mr-2" />
                  <span>Member since {formatDistanceToNow(memberSince, { addSuffix: true })}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 sm:mt-0 sm:ml-auto">
              <Button asChild>
                <Link href="/submit">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Project
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Statistics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Project Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span>Total Projects</span>
              <span>{totalProjects}</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span>Approved</span>
              <span>{approvedProjects}</span>
            </div>
            <Progress 
              value={totalProjects > 0 ? (approvedProjects / totalProjects) * 100 : 0} 
              className="h-2 bg-muted"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span>Pending</span>
              <span>{pendingProjects}</span>
            </div>
            <Progress 

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";

// Define the schema
const profileUpdateSchema = z.object({
  name: z.string().optional(),
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
});

export default function ProfilePage() {
  const { user, update } = useAuth();
  const form = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || '',
      password: '',
    },
  });

  const handleSubmit = async (values) => {
    await update(values);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <input {...form.register('name')} placeholder="Name" />
      <input {...form.register('username')} placeholder="Username" />
      <input type="email" {...form.register('email')} placeholder="Email" />
      <input type="password" {...form.register('password')} placeholder="New Password" />
      <button type="submit">Update Profile</button>
    </form>
  );
}

              value={totalProjects > 0 ? (pendingProjects / totalProjects) * 100 : 0} 
              className="h-2 bg-muted" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Projects Tabs */}
      <Card>
        <Tabs defaultValue="projects">
          <TabsList className="w-full border-b rounded-none">
            <TabsTrigger value="projects" className="flex-1">My Projects</TabsTrigger>
            <TabsTrigger value="activity" className="flex-1">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">My Projects</h3>
              <Button asChild>
                <Link href="/submit">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Project
                </Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} className="h-32 w-full" />
                ))}
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    showActions 
                    onEdit={handleEditProject}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't submitted any projects yet.</p>
                <Button asChild>
                  <Link href="/submit">Submit Your First Project</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="p-4">
            {/* Removed import and reference to RecentActivity */}
          </TabsContent>
        </Tabs>
      </Card>

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