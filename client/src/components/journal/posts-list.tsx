import { Journal } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { MessageSquare, Heart, Link2, MoreVertical, CheckCircle, Send } from "lucide-react";
import { MdVerified } from "react-icons/md";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface PostsListProps {
  userId?: number;
  limit?: number;
}

export function PostsList({
  userId,
  limit = 10,
}: PostsListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State untuk dialog comment
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedJournalId, setSelectedJournalId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");

  const mainQueryKey = userId 
    ? ['api', 'user', 'journals'] 
    : ['api', 'journals'];

  const { data: journals, isLoading, refetch } = useQuery<Journal[]>({
    queryKey: mainQueryKey,
    queryFn: async () => {
      const url = userId ? "/api/user/journals" : "/api/journals";
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch journals");
      }
      return res.json();
    },
    refetchOnWindowFocus: false,
  });
  
  // Add like functionality
  const likeMutation = useMutation({
    mutationFn: async (journalId: number) => {
      const res = await apiRequest("POST", `/api/journals/${journalId}/like`);
      if (!res.ok) {
        throw new Error("Failed to like post");
      }
      return res.json();
    },
    onSuccess: () => {
      // Langsung refetch data
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
    mutationFn: async (journalId: number) => {
      const res = await apiRequest("POST", `/api/journals/${journalId}/unlike`);
      if (!res.ok) {
        throw new Error("Failed to unlike post");
      }
      return res.json();
    },
    onSuccess: () => {
      // Langsung refetch data
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
  
  // Function to handle opening comment dialog
  const handleOpenCommentDialog = (journalId: number) => {
    setSelectedJournalId(journalId);
    setCommentText("");
    setCommentDialogOpen(true);
  };
  
  // Function to handle submitting a comment
  const handleSubmitComment = () => {
    if (!commentText.trim() || !selectedJournalId) return;
    
    submitCommentMutation.mutate({
      journalId: selectedJournalId,
      commentText: commentText.trim()
    });
  };
  
  // Add comment functionality (simplified version, just counts)
  const commentMutation = useMutation({
    mutationFn: async (journalId: number) => {
      const res = await apiRequest("POST", `/api/journals/${journalId}/comment`);
      if (!res.ok) {
        throw new Error("Failed to comment on post");
      }
      return res.json();
    },
    onSuccess: () => {
      // Langsung refetch data
      refetch();
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
  
  // Submit comment with text mutation
  const submitCommentMutation = useMutation({
    mutationFn: async ({ journalId, commentText }: { journalId: number, commentText: string }) => {
      // Di implementasi nyata, ini akan mengirim komentar dengan teks ke backend
      // Untuk sekarang kita gunakan endpoint yang sudah ada
      const res = await apiRequest("POST", `/api/journals/${journalId}/comment`);
      if (!res.ok) {
        throw new Error("Failed to comment on post");
      }
      return res.json();
    },
    onSuccess: () => {
      // Reset form and close dialog
      setCommentText("");
      setCommentDialogOpen(false);
      setSelectedJournalId(null);
      
      // Refresh data
      refetch();
      
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

  // Fungsi untuk mendeteksi dan format URL dalam teks
  const formatTextWithURLs = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-purple-600 hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Fungsi untuk mendeteksi dan format hashtags dalam teks
  const formatTextWithHashtags = (text: string) => {
    const hashtags = text.match(/#(\w+)/g) || [];
    let formattedText = text;

    hashtags.forEach(hashtag => {
      formattedText = formattedText.replace(
        hashtag,
        `<span class="text-pink-600">${hashtag}</span>`
      );
    });

    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="mt-3">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!journals || journals.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No posts found.</p>
      </div>
    );
  }

  // Apply limit and sort by date (newest first)
  const displayedJournals = journals
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  return (
    <div className="space-y-6">
      {displayedJournals.map((journal) => (
        <div key={journal.id} className="rounded-lg shadow p-4">
          {/* Post header with username and time */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                {user?.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                ) : (
                  <AvatarFallback className="bg-gray-200">
                    {user?.username.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="flex items-center">
                  <div className="flex items-center">
                    <span className="font-medium">{user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : ""}</span>
                    {user?.isAdmin && (
                      <MdVerified className="h-4 w-4 text-amber-500 ml-1" title="Admin" />
                    )}
                    {!user?.isAdmin && user?.verified && (
                      <MdVerified className="h-4 w-4 text-blue-500 ml-1" title="Verified User" />
                    )}
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                    · {formatDistanceToNow(new Date(journal.createdAt)).replace(/^about\s/, '').replace(/\sago$/, '')}
                  </span>
                </div>
              </div>
            </div>
            <button>
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Post content */}
          <div className="mb-3">
            {/* Deteksi URL dalam konten */}
            {journal.content.includes("http") ? (
              <div>{formatTextWithURLs(journal.content)}</div>
            ) : journal.content.includes("#") ? (
              <div>{formatTextWithHashtags(journal.content)}</div>
            ) : (
              <div>{journal.content}</div>
            )}
          </div>

          {/* Post image if available */}
          {journal.coverImage && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <img
                src={journal.coverImage}
                alt={journal.title}
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}

          {/* Interaction buttons */}
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 pt-2">
            <div className="flex items-center space-x-6">
              <button 
                className="flex items-center hover:text-blue-500 transition-colors"
                onClick={() => handleOpenCommentDialog(journal.id)}
                disabled={submitCommentMutation.isPending}
              >
                <MessageSquare className="h-5 w-5 mr-1" />
                {journal.comments > 0 && <span>{journal.comments}</span>}
              </button>
              <button 
                className="flex items-center hover:text-red-500 transition-colors"
                onClick={() => {
                  // Jika jumlah likes adalah genap, kita tambahkan like
                  // Jika ganjil, kita unlike (implementasi sederhana)
                  if (journal.likes % 2 === 0) {
                    likeMutation.mutate(journal.id);
                  } else {
                    unlikeMutation.mutate(journal.id);
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

          {/* Featured badge removed */}
        </div>
      ))}
      
      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>
              Enter your comment below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Input
                id="comment"
                placeholder="Write your comment..."
                className="col-span-3"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setCommentDialogOpen(false)}
              variant="outline"
              disabled={submitCommentMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitComment} 
              disabled={!commentText.trim() || submitCommentMutation.isPending}
            >
              {submitCommentMutation.isPending ? "Submitting..." : "Submit Comment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}