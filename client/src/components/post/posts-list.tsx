import { Journal } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Edit, Trash2, Calendar, Clock, Star, StarOff, 
  Heart, MessageSquare, ArrowRight, Share2, Bookmark, MoreVertical
} from "lucide-react";
import { MdVerified } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface PostsListProps {
  userId?: number;
  limit?: number;
  showManageOptions?: boolean;
  onEdit?: (post: Journal) => void;
  showAdminOptions?: boolean;
}

export function PostsList({
  userId,
  limit,
  showManageOptions = false,
  onEdit,
  showAdminOptions = false,
}: PostsListProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;

  // Choose the appropriate query based on whether a userId is provided
  const queryKey = userId 
    ? [`/api/user/${userId}/posts`] 
    : [`/api/posts`];

  const { data: posts, isLoading } = useQuery<Journal[]>({
    queryKey,
    refetchOnWindowFocus: false,
  });
  
  // Query for the user data if userId is provided
  const { data: postAuthor } = useQuery({
    queryKey: userId ? [`/api/user/${userId}`] : ['skip-query'],
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });

  // Mutation for deleting a post
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/posts/${id}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post deleted",
        description: "The post has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for featuring/unfeaturing a post (admin only)
  const featureMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: number; featured: boolean }) => {
      const endpoint = featured 
        ? `/api/admin/posts/${id}/feature` 
        : `/api/admin/posts/${id}/unfeature`;
      const res = await apiRequest("POST", endpoint, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/featured"] });
      toast({
        title: "Post updated",
        description: "The post featured status has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update post",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation for liking a post
  const likeMutation = useMutation({
    mutationFn: async (id: number = 0) => {
      const res = await apiRequest("POST", `/api/posts/${id}/like`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/posts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to like post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for unliking a post
  const unlikeMutation = useMutation({
    mutationFn: async (id: number = 0) => {
      const res = await apiRequest("POST", `/api/posts/${id}/unlike`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/posts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to unlike post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (post: Journal) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate(post.id);
    }
  };

  const handleFeatureToggle = (post: Journal) => {
    featureMutation.mutate({
      id: post.id,
      featured: !post.featured,
    });
  };

  // Format date for display without "about" prefix and "ago" suffix
  const formatDate = (date: Date | string | number) => {
    const rawFormat = formatDistanceToNow(new Date(date));
    // Remove "about " and " ago" from the format
    return rawFormat.replace(/^about\s/, '').replace(/\sago$/, '');
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

  if (!posts || posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No posts found.</p>
        </CardContent>
      </Card>
    );
  }

  // Apply limit if specified
  const displayedPosts = limit ? posts.slice(0, limit) : posts;

  // Function to parse content and highlight hashtags and links
  const parseContent = (content: string) => {
    // First split content into chunks by space
    const chunks = content.split(/(\s+)/);
    
    return chunks.map((chunk, idx) => {
      // Check if chunk is a hashtag
      if (chunk.startsWith('#')) {
        return <span key={idx} className="text-purple-500">{chunk}</span>;
      }
      // Check if chunk is a URL
      else if (chunk.match(/^(http|https):\/\/[^\s]+$/)) {
        return <a key={idx} href={chunk} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline">{chunk}</a>;
      }
      // Regular text
      else {
        return <span key={idx}>{chunk}</span>;
      }
    });
  };

  return (
    <div className="space-y-2">
      {displayedPosts.map((post) => (
        <div key={post.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-2 last:border-0">
          <div className="flex items-start gap-3">
            {/* User Avatar */}
            <Link href={`/profile/${post.userId}`}>
              <Avatar className="h-10 w-10">
                {postAuthor?.avatarUrl ? (
                  <AvatarImage src={postAuthor.avatarUrl} alt={postAuthor.username} />
                ) : (
                  <AvatarFallback className="bg-gray-200">
                    {postAuthor?.username ? postAuthor.username.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
            </Link>
            
            {/* Post Content */}
            <div className="flex-1">
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Link href={`/profile/${post.userId}`} className="font-semibold hover:underline">
                    {postAuthor?.username 
                      ? postAuthor.username.charAt(0).toUpperCase() + postAuthor.username.slice(1) 
                      : 'Username'}
                    {postAuthor?.isAdmin && (
                      <MdVerified className="h-4 w-4 text-amber-500 ml-1 inline" title="Admin" />
                    )}
                    {!postAuthor?.isAdmin && postAuthor?.verified && (
                      <MdVerified className="h-4 w-4 text-blue-500 ml-1 inline" title="Verified User" />
                    )}
                  </Link>
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">· {formatDate(post.createdAt)}</span>
                </div>
                
                {/* More Menu for Post Actions */}
                {(showManageOptions || showAdminOptions) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {showManageOptions && onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(post)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                      )}
                      {showManageOptions && (
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(post)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      )}
                      {showAdminOptions && isAdmin && (
                        <DropdownMenuItem onClick={() => handleFeatureToggle(post)}>
                          {post.featured ? (
                            <>
                              <StarOff className="h-4 w-4 mr-2" /> Unfeature
                            </>
                          ) : (
                            <>
                              <Star className="h-4 w-4 mr-2" /> Feature
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              {/* Post Title if available */}
              {post.title && post.title !== post.content && (
                <Link href={`/posts/${post.id}`}>
                  <h3 className="font-medium mb-1 hover:underline">{post.title}</h3>
                </Link>
              )}
              
              {/* Post Content */}
              <div className="mb-2">
                <Link href={`/posts/${post.id}`} className="text-foreground hover:text-gray-700 dark:hover:text-gray-300">
                  {parseContent(post.content.length > 280 ? post.content.substring(0, 280) + "..." : post.content)}
                </Link>
              </div>
              
              {/* Post Image if available */}
              {post.coverImage && (
                <Link href={`/posts/${post.id}`}>
                  <div className="mt-2 mb-3 rounded-xl overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={post.title || "Post image"}
                      className="w-full max-h-80 object-cover"
                    />
                  </div>
                </Link>
              )}
              
              {/* Post Actions */}
              <div className="flex items-center justify-between mt-3 text-gray-500">
                <button className="flex items-center hover:text-blue-500">
                  <MessageSquare className="h-5 w-5" />
                </button>
                <button className="flex items-center hover:text-green-500">
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button 
                  className={`flex items-center hover:text-red-500 ${post.likes > 0 ? 'text-red-500' : ''}`}
                  onClick={() => {
                    if (post.likes === 0) {
                      likeMutation.mutate(post.id);
                    } else {
                      unlikeMutation.mutate(post.id);
                    }
                  }}
                >
                  <Heart className={`h-5 w-5 ${post.likes > 0 ? 'fill-red-500' : ''}`} />
                </button>
                <button className="flex items-center hover:text-blue-500">
                  <Share2 className="h-5 w-5" />
                </button>
                <button className="flex items-center hover:text-yellow-500">
                  <Bookmark className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}