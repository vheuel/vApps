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
import { useState, useRef, useEffect } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "./confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostDetailProps {
  postId: number;
}

export function PostDetail({ postId }: PostDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Create a ref for the post title element
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  // Get post data
  const { data: post, isLoading, error, refetch } = useQuery<Journal>({
    queryKey: [`/api/posts/${postId}`],
    refetchOnWindowFocus: false,
  });

  // Get author details
  const { data: author, isLoading: isAuthorLoading } = useQuery<{ username: string, isAdmin: boolean, verified: boolean }>({
    queryKey: [`/api/user/${post?.userId}`],
    enabled: !!post?.userId,
    refetchOnWindowFocus: false,
  });
  
  // Effect to highlight the post title when loaded
  useEffect(() => {
    // Only proceed if post data is loaded and title element exists
    if (post && titleRef.current) {
      // We'll use a staggered approach with multiple timeouts for reliability
      
      // Step 1: Scroll to the title initially
      const initialScrollTimeout = setTimeout(() => {
        if (titleRef.current) {
          // Force scroll to top first to reset any previous scroll position
          window.scrollTo(0, 0);
          
          // Set a manual anchor element to ensure we're at the top
          document.getElementById('post-title')?.scrollIntoView({ 
            behavior: 'auto',
            block: 'start'
          });
        }
      }, 50);
      
      // Step 2: After a brief pause, calculate precise position and scroll with offset
      const preciseScrollTimeout = setTimeout(() => {
        if (titleRef.current) {
          // Calculate ideal position with offset
          const yOffset = -100; // Header offset
          const titlePosition = titleRef.current.getBoundingClientRect().top;
          const offsetPosition = titlePosition + window.pageYOffset + yOffset;
          
          // Smooth scroll to position
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 200);
      
      // Step 3: Apply highlight effect after scrolling is likely complete
      const highlightTimeout = setTimeout(() => {
        if (titleRef.current) {
          // Apply animation class
          titleRef.current.classList.add('post-title-focus');
          
          // Remove animation class after it completes
          const cleanupTimeout = setTimeout(() => {
            if (titleRef.current) {
              titleRef.current.classList.remove('post-title-focus');
            }
          }, 3000);
          
          return () => clearTimeout(cleanupTimeout);
        }
      }, 600);
      
      // Clear all timeouts on cleanup
      return () => {
        clearTimeout(initialScrollTimeout);
        clearTimeout(preciseScrollTimeout);
        clearTimeout(highlightTimeout);
      };
    }
  }, [post]);
  
  // Get comments from the API
  const { 
    data: comments = [], 
    isLoading: isCommentsLoading,
    refetch: refetchComments
  } = useQuery<any[]>({
    queryKey: [`/api/posts/${postId}/comments`],
    enabled: !!postId,
    refetchOnWindowFocus: false,
  });
  
  // Add like functionality
  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/posts/${postId}/like`);
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
      const res = await apiRequest("POST", `/api/posts/${postId}/unlike`);
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
      const res = await apiRequest("POST", `/api/posts/${postId}/comment`, {
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
      refetch(); // Refresh post details (to update comment count)
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
      refetch(); // Refresh post details (to update comment count)
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

  if (error || !post) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Failed to load post.</p>
          <Button 
            asChild 
            variant="outline" 
            className="mt-4"
          >
            <Link href="/posts">Back to Posts</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <article className="max-w-4xl mx-auto">
        <div className="mb-6">
          {post.coverImage && (
            <div className="w-full h-64 md:h-96 overflow-hidden rounded-lg mb-6">
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 
            ref={titleRef} 
            tabIndex={-1} 
            id="post-title"
            className="text-3xl font-bold focus:outline-none"
          >
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center mt-4 space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatDistanceToNow(new Date(post.createdAt)).replace(/^about\s/, '').replace(/\sago$/, '')}
            </span>
            {author ? (
              <Link href={`/profile/${author.username || ''}`} className="flex items-center hover:underline">
                <User className="h-4 w-4 mr-1" />
                {author.username || "Unknown author"}
                {author.isAdmin && (
                  <MdVerified className="h-4 w-4 text-amber-500 ml-1" title="Admin" />
                )}
                {!author.isAdmin && author.verified && (
                  <MdVerified className="h-4 w-4 text-blue-500 ml-1" title="Verified User" />
                )}
              </Link>
            ) : isAuthorLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : null}
            
            {post.featured && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-500">
                Featured
              </Badge>
            )}
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none mb-6">
          {/* Apply some simple formatting to the content by splitting paragraphs */}
          {post.content.split("\n\n").map((paragraph, index) => (
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
              {post.comments > 0 && <span>{post.comments}</span>}
            </button>
            <button 
              className="flex items-center hover:text-red-500 transition-colors"
              onClick={() => {
                if (post.likes % 2 === 0) {
                  likeMutation.mutate();
                } else {
                  unlikeMutation.mutate();
                }
              }}
              disabled={likeMutation.isPending || unlikeMutation.isPending}
            >
              <Heart 
                className={`h-5 w-5 mr-1 ${post.likes % 2 === 1 ? 'fill-red-500 text-red-500' : ''}`} 
              />
              {post.likes > 0 && <span>{post.likes}</span>}
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
            <div className="space-y-8"> {/* Increased spacing between comments */}
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
                        <Link href={`/profile/${comment.user?.username || ''}`} className="font-medium hover:underline">
                          {comment.user?.username 
                            ? comment.user.username.charAt(0).toUpperCase() + comment.user.username.slice(1) 
                            : "Unknown user"}
                          {comment.user?.isAdmin && (
                            <MdVerified className="h-4 w-4 text-amber-500 ml-1 inline" title="Admin" />
                          )}
                          {!comment.user?.isAdmin && comment.user?.verified && (
                            <MdVerified className="h-4 w-4 text-blue-500 ml-1 inline" title="Verified User" />
                          )}
                        </Link>
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
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Comment"
        description="Are you sure you want to delete this comment?<br />This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteComment}
        isLoading={deleteCommentMutation.isPending}
      />
    </>
  );
}