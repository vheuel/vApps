import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Project } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckIcon, XIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPage() {
  const { toast } = useToast();

  const { data: pendingProjects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/admin/projects/pending"],
  });

  const { data: allProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/projects/${id}/approve`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project approved",
        description: "The project has been approved and is now live.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to approve project",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/projects/${id}/reject`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project rejected",
        description: "The project has been rejected.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reject project",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Get category counts for approved projects
  const getCategoryCounts = () => {
    if (!allProjects) return {};
    
    const approvedProjects = allProjects.filter(p => p.approved);
    return approvedProjects.reduce((acc, project) => {
      acc[project.category] = (acc[project.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const categoryCounts = getCategoryCounts();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{allProjects?.length || 0}</div>
            <p className="text-muted-foreground">Total Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{allProjects?.filter(p => p.approved).length || 0}</div>
            <p className="text-muted-foreground">Approved Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pendingProjects?.length || 0}</div>
            <p className="text-muted-foreground">Pending Approval</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="pending" className="flex-1">Pending Projects</TabsTrigger>
          <TabsTrigger value="stats" className="flex-1">Category Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Projects Awaiting Approval</CardTitle>
              <CardDescription>
                Review and approve or reject user-submitted projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full" />
                  ))}
                </div>
              ) : pendingProjects && pendingProjects.length > 0 ? (
                <div className="space-y-4">
                  {pendingProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{project.name}</h3>
                          <p className="text-muted-foreground text-sm">{project.description}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {project.category}
                            </Badge>
                            {project.websiteUrl && (
                              <a
                                href={project.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary text-sm hover:underline"
                              >
                                Visit website
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 hover:bg-red-50 hover:text-red-600"
                            onClick={() => rejectMutation.mutate(project.id)}
                            disabled={rejectMutation.isPending}
                          >
                            {rejectMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XIcon className="h-4 w-4 mr-1" />
                            )}
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-200 hover:bg-green-50 hover:text-green-600"
                            onClick={() => approveMutation.mutate(project.id)}
                            disabled={approveMutation.isPending}
                          >
                            {approveMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckIcon className="h-4 w-4 mr-1" />
                            )}
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No pending projects to review.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Category Statistics</CardTitle>
              <CardDescription>
                Distribution of approved projects by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(categoryCounts).length > 0 ? (
                  Object.entries(categoryCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => (
                      <div key={category}>
                        <div className="flex justify-between mb-1">
                          <span className="capitalize">{category}</span>
                          <span>{count}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ 
                              width: `${(count / (allProjects?.filter(p => p.approved).length || 1)) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No approved projects to display statistics.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
