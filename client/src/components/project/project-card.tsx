import { Project } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, CheckCircle, XCircle, Check, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProjectCardProps {
  project: Project;
  showActions?: boolean;
  showVerificationIcon?: boolean;
  onEdit?: (project: Project) => void;
  showAdminActions?: boolean;
}

export default function ProjectCard({ 
  project, 
  showActions = false, 
  showVerificationIcon = false,
  onEdit,
  showAdminActions = false
}: ProjectCardProps) {
  const createdAt = project.createdAt ? new Date(project.createdAt) : new Date();
  const { toast } = useToast();

  const isValidUrl = (stringUrl: string) => {
    try {
      new URL(stringUrl);
      return true;
    } catch {
      return false;
    }
  };

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

  const verifyMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/projects/${id}/verify`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project verified",
        description: "The project has been verified and will show a verification badge.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to verify project",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const unverifyMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/admin/projects/${id}/unverify`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project unverified",
        description: "The verification badge has been removed from this project.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to unverify project",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {project.iconUrl ? (
                <img 
                  src={project.iconUrl} 
                  alt={project.name} 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 rounded-lg text-primary">
                  {project.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-lg">{project.name}</h3>
                {showVerificationIcon && project.verified && (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                )}
                {project.websiteUrl && (
                  <a 
                    href={project.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-muted-foreground hover:text-primary"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <p className="text-muted-foreground text-sm line-clamp-2 mt-1">{project.description}</p>

              {showActions && (
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Added {formatDistanceToNow(createdAt, { addSuffix: true })}
                  </span>
                  <div className="space-x-2">
                    {onEdit && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onEdit(project)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {showAdminActions && (
                <div className="mt-3 flex justify-end items-center space-x-2">
                  {/* Only show approve/reject if project is pending */}
                  {project.pending && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 hover:bg-red-50 hover:text-red-600"
                        onClick={() => rejectMutation.mutate(project.id)}
                        disabled={rejectMutation.isPending}
                      >
                        {rejectMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <X className="h-4 w-4 mr-1" />
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
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        Approve
                      </Button>
                    </>
                  )}

                  {/* Show verify/unverify for approved projects */}
                  {project.approved && !project.pending && (
                    <>
                      {project.verified ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 hover:bg-red-50 hover:text-red-600"
                          onClick={() => unverifyMutation.mutate(project.id)}
                          disabled={unverifyMutation.isPending}
                        >
                          {unverifyMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <X className="h-4 w-4 mr-1" />
                          )}
                          Remove Verification
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => verifyMutation.mutate(project.id)}
                          disabled={verifyMutation.isPending}
                        >
                          {verifyMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          )}
                          Verify Project
                        </Button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}