import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Project, Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckIcon, 
  XIcon, 
  Loader2, 
  ShieldCheck, 
  ShieldX, 
  Clock,
  Archive,
  Search 
} from "lucide-react";
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";

export function ProjectsManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "verify" | "unverify">("approve");

  const { data: pendingProjects, isLoading: isPendingLoading } = useQuery<Project[]>({
    queryKey: ["/api/admin/projects/pending"],
  });

  const { data: allProjects, isLoading: isProjectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
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
      setConfirmationOpen(false);
      setSelectedProject(null);
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
      setConfirmationOpen(false);
      setSelectedProject(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reject project",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const verifyProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/projects/${id}/verify`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project verified",
        description: "The project has been marked as verified.",
      });
      setConfirmationOpen(false);
      setSelectedProject(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to verify project",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const unverifyProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/projects/${id}/unverify`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project unverified",
        description: "The project's verified status has been removed.",
      });
      setConfirmationOpen(false);
      setSelectedProject(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to unverify project",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getCategoryName = (slug: string) => {
    return categories?.find(c => c.slug === slug)?.name || slug;
  };

  const handleActionClick = (project: Project, action: "approve" | "reject" | "verify" | "unverify") => {
    setSelectedProject(project);
    setActionType(action);
    setConfirmationOpen(true);
  };

  const confirmAction = () => {
    if (!selectedProject) return;
    
    switch (actionType) {
      case "approve":
        approveMutation.mutate(selectedProject.id);
        break;
      case "reject":
        rejectMutation.mutate(selectedProject.id);
        break;
      case "verify":
        verifyProjectMutation.mutate(selectedProject.id);
        break;
      case "unverify":
        unverifyProjectMutation.mutate(selectedProject.id);
        break;
    }
  };

  // Filter projects based on search query
  const filterProjects = (projects: Project[] | undefined) => {
    if (!projects) return [];
    if (!searchQuery) return projects;
    
    const query = searchQuery.toLowerCase();
    return projects.filter(project => 
      project.name.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      getCategoryName(project.category).toLowerCase().includes(query)
    );
  };

  const pendingProjectsList = filterProjects(pendingProjects);
  const approvedProjects = allProjects?.filter(p => p.approved && !p.pending) || [];
  const approvedProjectsList = filterProjects(approvedProjects);

  // Get project stats
  const totalProjects = allProjects?.length || 0;
  const totalApproved = approvedProjects.length;
  const totalPending = pendingProjects?.length || 0;
  const totalVerified = approvedProjects.filter(p => p.verified).length;

  // Check if any action is pending
  const isPending = approveMutation.isPending || rejectMutation.isPending || 
                    verifyProjectMutation.isPending || unverifyProjectMutation.isPending;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center text-center py-6">
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-muted-foreground">Total Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center text-center py-6">
            <div className="text-2xl font-bold">{totalApproved}</div>
            <p className="text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center text-center py-6">
            <div className="text-2xl font-bold">{totalPending}</div>
            <p className="text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center text-center py-6">
            <div className="text-2xl font-bold">{totalVerified}</div>
            <p className="text-muted-foreground">Verified</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Project Management</CardTitle>
          <CardDescription>
            Review, approve and manage project submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects by name or category"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Pending Approval ({totalPending})</span>
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                <span>Approved Projects ({totalApproved})</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              {isPendingLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full" />
                  ))}
                </div>
              ) : pendingProjectsList && pendingProjectsList.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingProjectsList.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                                {project.iconUrl ? (
                                  <img 
                                    src={project.iconUrl} 
                                    alt={project.name} 
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-lg font-bold text-primary">
                                    {project.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div>{project.name}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {project.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getCategoryName(project.category)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDistanceToNow(new Date(project.createdAt))}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                      onClick={() => handleActionClick(project, "approve")}
                                      disabled={isPending}
                                    >
                                      <CheckIcon className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Approve Project</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                      onClick={() => handleActionClick(project, "reject")}
                                      disabled={isPending}
                                    >
                                      <XIcon className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Reject Project</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 border rounded-md">
                  <p className="text-muted-foreground">No pending projects to review.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="approved">
              {isProjectsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full" />
                  ))}
                </div>
              ) : approvedProjectsList && approvedProjectsList.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedProjectsList.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                                {project.iconUrl ? (
                                  <img 
                                    src={project.iconUrl} 
                                    alt={project.name} 
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-lg font-bold text-primary">
                                    {project.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1">
                                  {project.name}
                                  {project.verified && (
                                    <CheckIcon className="h-4 w-4 text-blue-500" />
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {project.description}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getCategoryName(project.category)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {project.verified ? (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
                                Approved
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              {project.verified ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => handleActionClick(project, "unverify")}
                                        disabled={isPending}
                                      >
                                        <ShieldX className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Remove Verification</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => handleActionClick(project, "verify")}
                                        disabled={isPending}
                                      >
                                        <ShieldCheck className="h-4 w-4 text-blue-500" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Verify Project</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 border rounded-md">
                  <p className="text-muted-foreground">No approved projects found.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Project" : 
               actionType === "reject" ? "Reject Project" :
               actionType === "verify" ? "Verify Project" : "Remove Verification"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Are you sure you want to approve this project? It will be published on the platform."
                : actionType === "reject"
                ? "Are you sure you want to reject this project? It will be removed from the pending queue."
                : actionType === "verify"
                ? "Are you sure you want to verify this project? Verified projects have a special badge displayed."
                : "Are you sure you want to remove verification from this project? This will remove its verified badge."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="flex items-center space-x-3 p-4 bg-muted rounded-md">
              <div className="h-12 w-12 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                {selectedProject.iconUrl ? (
                  <img 
                    src={selectedProject.iconUrl} 
                    alt={selectedProject.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-primary">
                    {selectedProject.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div className="font-medium">{selectedProject.name}</div>
                <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                  {selectedProject.description}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmationOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={actionType === "reject" || actionType === "unverify" ? "destructive" : "default"}
              onClick={confirmAction} 
              disabled={isPending}
            >
              {isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {actionType === "approve" ? "Approve Project" : 
               actionType === "reject" ? "Reject Project" :
               actionType === "verify" ? "Verify Project" : "Remove Verification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}