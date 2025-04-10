import { Journal } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, Clock, MessageSquare, Heart, Send, MoreVertical } from "lucide-react";
import { MdVerified } from "react-icons/md";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; 
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface JournalDetailProps {
  journalId: number;
}

export function JournalDetail({ journalId }: JournalDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Get post data
  const { data: journal, isLoading, error, refetch } = useQuery<Journal>({
    queryKey: [`/api/journals/${journalId}`],
    refetchOnWindowFocus: false,
  });

  // Get author details
  const { data: author, isLoading: isAuthorLoading } = useQuery<{ username: string, isAdmin: boolean, verified: boolean }>({
    queryKey: [`/api/user/${journal?.userId}`],
    enabled: !!journal?.userId,
    refetchOnWindowFocus: false,
  });
  
  // Get comments from the API
  const { 
    data: comments = [], 
    isLoading: isCommentsLoading,
    refetch: refetchComments
  } = useQuery<any[]>({
    queryKey: [`/api/journals/${journalId}/comments`],
    enabled: !!journalId,
    refetchOnWindowFocus: false,
  });
  
  // Add like functionality
  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/journals/${journalId}/like`);
      if (!res.ok) {
        throw new Error("Failed to like post");
      }
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Success",
        description: "Post liked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Could not like post",
        variant: "destructive"
      });
    }
  });
  
  // Add unlike functionality
  const unlikeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/journals/${journalId}/unlike`);
      if (!res.ok) {
        throw new Error("Failed to unlike post");
      }
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Success",
        description: "Post unliked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Could not unlike post",
        variant: "destructive"
      });
    }
  });
  
  // Add comment functionality using real API
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/journals/${journalId}/comment`, {
        content
      });
      if (!res.ok) {
        throw new Error("Failed to add comment");
      }
      return res.json();
    },
    onSuccess: () => {
      setCommentText(""); // Clear input field
      refetchComments(); // Refresh comments list
      refetch(); // Refresh journal details (to update comment count)
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Could not add comment",
        variant: "destructive"
      });
    }
  });
  
  // Delete comment functionality
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const res = await apiRequest("DELETE", `/api/comments/${commentId}`);
      if (!res.ok) {
        throw new Error("Failed to delete comment");
      }
      return res.json();
    },
    onSuccess: () => {
      refetchComments(); // Refresh comments list
      refetch(); // Refresh journal details (to update comment count)
      setIsDeleteDialogOpen(false); // Close dialog after successful deletion
      setCommentToDelete(null); // Reset comment to delete
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Could not delete comment",
        variant: "destructive"
      });
    }
  });

  // Handle delete comment from the dialog
  const handleDeleteComment = () => {
    if (commentToDelete) {
      deleteCommentMutation.mutate(commentToDelete);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !journal) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Failed to load post.</p>
          <Button 
            asChild 
            variant="outline" 
            className="mt-4"
          >
            <Link href="/journals">Back to Posts</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <article className="max-w-4xl mx-auto">
        <div className="mb-6">
          {journal.coverImage && (
            <div className="w-full h-64 md:h-96 overflow-hidden rounded-lg mb-6">
              <img 
                src={journal.coverImage} 
                alt={journal.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-3xl font-bold">{journal.title}</h1>
          
          <div className="flex flex-wrap items-center mt-4 space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(journal.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatDistanceToNow(new Date(journal.createdAt)).replace(/^about\s/, '').replace(/\sago$/, '')}
            </span>
            {author ? (
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {author.username || "Unknown author"}
                {author.isAdmin && (
                  <MdVerified className="h-4 w-4 text-amber-500 ml-1" title="Admin" />
                )}
                {!author.isAdmin && author.verified && (
                  <MdVerified className="h-4 w-4 text-blue-500 ml-1" title="Verified User" />
                )}
              </span>
            ) : isAuthorLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : null}
            
            {journal.featured && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-500">
                Featured
              </Badge>
            )}
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none mb-6">
          {/* Apply some simple formatting to the content by splitting paragraphs */}
          {journal.content.split("\n\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        
        {/* Like and comment count */}
        <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 py-4 border-t border-b">
          <div className="flex items-center space-x-6">
            <button 
              className="flex items-center hover:text-blue-500 transition-colors"
              id="comments"
            >
              <MessageSquare className="h-5 w-5 mr-1" />
              {journal.comments > 0 && <span>{journal.comments}</span>}
            </button>
            <button 
              className="flex items-center hover:text-red-500 transition-colors"
              onClick={() => {
                if (journal.likes % 2 === 0) {
                  likeMutation.mutate();
                } else {
                  unlikeMutation.mutate();
                }
              }}
              disabled={likeMutation.isPending || unlikeMutation.isPending}
            >
              <Heart 
                className={`h-5 w-5 mr-1 ${journal.likes % 2 === 1 ? 'fill-red-500 text-red-500' : ''}`} 
              />
              {journal.likes > 0 && <span>{journal.likes}</span>}
            </button>
          </div>
        </div>
        
        {/* Comment form - without heading */}
        {user && (
          <div className="mt-6 mb-8">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                {user?.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                ) : (
                  <AvatarFallback className="bg-gray-200">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 flex items-center gap-2">
                <Input 
                  placeholder="Write a comment..." 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  size="sm" 
                  onClick={() => commentMutation.mutate(commentText)}
                  disabled={!commentText.trim() || commentMutation.isPending}
                >
                  {commentMutation.isPending ? "Posting..." : "Send"}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Comments section - without heading */}
        <div className="mt-6">
          
          {isCommentsLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-8"> {/* Meningkatkan jarak antar komentar */}
              {comments.map((comment, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    {comment.user?.avatarUrl ? (
                      <AvatarImage src={comment.user.avatarUrl} alt={comment.user.username} />
                    ) : (
                      <AvatarFallback className="bg-gray-200">
                        {comment.user?.username.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium">
                          {comment.user?.username 
                            ? comment.user.username.charAt(0).toUpperCase() + comment.user.username.slice(1) 
                            : "Unknown user"}
                        </span>
                        {comment.user?.isAdmin && (
                          <MdVerified className="h-4 w-4 text-amber-500 ml-1" title="Admin" />
                        )}
                        {!comment.user?.isAdmin && comment.user?.verified && (
                          <MdVerified className="h-4 w-4 text-blue-500 ml-1" title="Verified User" />
                        )}
                        <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                          · {formatDistanceToNow(new Date(comment.createdAt)).replace(/^about\s/, '').replace(/\sago$/, '')}
                        </span>
                      </div>
                      
                      {/* More options dropdown - only show if user owns comment or is admin */}
                      {user && (user.id === comment.userId || user.isAdmin) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-[100px]">
                            <DropdownMenuItem 
                              className="text-destructive text-center justify-center" 
                              onClick={() => {
                                setCommentToDelete(comment.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <p className="mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm mx-4 rounded-lg">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl">Delete Comment</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete this comment?
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 mt-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteComment}
              className="w-full py-6 text-base"
              disabled={deleteCommentMutation.isPending}
            >
              {deleteCommentMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full py-6 text-base bg-gray-100 hover:bg-gray-200 text-black"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}