import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { InsertProject } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ProjectForm from "@/components/project/project-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubmitProjectPage() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const submitMutation = useMutation({
    mutationFn: async (project: InsertProject) => {
      const res = await apiRequest("POST", "/api/projects", project);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/projects"] });
      
      toast({
        title: "Project submitted successfully",
        description: "Your project has been submitted and is awaiting approval.",
      });
      
      navigate("/profile");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit project",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (values: InsertProject) => {
    submitMutation.mutate(values);
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Submit a New Project</CardTitle>
          <CardDescription>
            Fill out the form below to add your project to the EARN App catalog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            onSubmit={handleSubmit}
            isSubmitting={submitMutation.isPending}
            mode="create"
          />
        </CardContent>
      </Card>
    </div>
  );
}
