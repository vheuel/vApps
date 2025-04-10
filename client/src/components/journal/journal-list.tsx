import { Journal } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, Calendar, Clock, Star, StarOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface JournalListProps {
  userId?: number;
  limit?: number;
  showManageOptions?: boolean;
  onEdit?: (journal: Journal) => void;
  showAdminOptions?: boolean;
}

export function JournalList({
  userId,
  limit,
  showManageOptions = false,
  onEdit,
  showAdminOptions = false,
}: JournalListProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;

  // Choose the appropriate query based on whether a userId is provided
  const queryKey = userId 
    ? [`/api/user/journals`] 
    : [`/api/journals`];

  const { data: journals, isLoading } = useQuery<Journal[]>({
    queryKey,
    refetchOnWindowFocus: false,
  });

  // Mutation for deleting a journal
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/journals/${id}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/journals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/journals"] });
      toast({
        title: "Journal deleted",
        description: "The journal has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete journal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for featuring/unfeaturing a journal (admin only)
  const featureMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: number; featured: boolean }) => {
      const endpoint = featured 
        ? `/api/admin/journals/${id}/feature` 
        : `/api/admin/journals/${id}/unfeature`;
      const res = await apiRequest("POST", endpoint, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/journals/featured"] });
      toast({
        title: "Journal updated",
        description: "The journal featured status has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update journal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (journal: Journal) => {
    if (window.confirm("Are you sure you want to delete this journal?")) {
      deleteMutation.mutate(journal.id);
    }
  };

  const handleFeatureToggle = (journal: Journal) => {
    featureMutation.mutate({
      id: journal.id,
      featured: !journal.featured,
    });
  };

  // Format date for display
  const formatDate = (date: Date | string | number) => {
    return formatDistanceToNow(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <div className="flex space-x-2 pt-2">
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!journals || journals.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No journal entries found.</p>
        </CardContent>
      </Card>
    );
  }

  // Apply limit if specified
  const displayedJournals = limit ? journals.slice(0, limit) : journals;

  return (
    <div className="space-y-4">
      {displayedJournals.map((journal) => (
        <Card key={journal.id} className="overflow-hidden">
          <CardContent className="p-0">
            {journal.coverImage && (
              <div className="w-full h-40 overflow-hidden">
                <img
                  src={journal.coverImage}
                  alt={journal.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-start">
                <Link href={`/journal/${journal.id}`}>
                  <h3 className="text-xl font-semibold hover:text-primary cursor-pointer">
                    {journal.title}
                  </h3>
                </Link>
                <div className="flex space-x-1">
                  {journal.featured && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-500">
                      Featured
                    </Badge>
                  )}
                  {!journal.published && (
                    <Badge variant="outline" className="border-gray-400 text-gray-500">
                      Draft
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground mt-2 line-clamp-2">
                {journal.excerpt || journal.content.substring(0, 150) + "..."}
              </p>
              <div className="flex items-center mt-3 text-xs text-muted-foreground space-x-3">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(journal.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(journal.createdAt)}
                </span>
              </div>
            </div>
          </CardContent>

          {(showManageOptions || showAdminOptions) && (
            <CardFooter className="bg-muted/30 px-4 py-2 flex justify-end space-x-2">
              {showManageOptions && onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(journal)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}

              {showManageOptions && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(journal)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}

              {showAdminOptions && isAdmin && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFeatureToggle(journal)}
                  disabled={featureMutation.isPending}
                >
                  {journal.featured ? (
                    <>
                      <StarOff className="h-4 w-4 mr-1" />
                      Unfeature
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-1" />
                      Feature
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}