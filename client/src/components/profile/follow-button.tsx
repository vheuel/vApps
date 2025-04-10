import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, UserMinus } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface FollowButtonProps {
  username: string;
}

export function FollowButton({ username }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Mengambil status following saat komponen dimuat
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user || !username) return;
      
      try {
        const response = await fetch(`/api/users/${username}/follow-status`);
        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing);
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };
    
    checkFollowStatus();
  }, [user, username]);

  const handleFollowToggle = async () => {
    if (!user || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const endpoint = `/api/users/${username}/${isFollowing ? 'unfollow' : 'follow'}`;
      const response = await apiRequest("POST", endpoint, {});
      
      if (response.ok) {
        setIsFollowing(!isFollowing);
        
        // Update cache for user stats
        queryClient.invalidateQueries({ queryKey: ["/api/users", username, "stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/users", user.username, "stats"] });
        
        toast({
          title: isFollowing ? "Unfollowed" : "Following",
          description: isFollowing 
            ? `You are no longer following ${username}` 
            : `You are now following ${username}`,
        });
      } else {
        throw new Error("Failed to update follow status");
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Jika status belum dimuat, tampilkan loading state
  if (isFollowing === null) {
    return (
      <Button 
        variant="outline" 
        className="rounded-full px-6 bg-white text-black border-0 shadow-md font-medium"
        disabled
      >
        <span className="animate-pulse">Loading...</span>
      </Button>
    );
  }

  return (
    <Button 
      variant={isFollowing ? "outline" : "default"} 
      className={`rounded-full px-6 ${isFollowing 
        ? 'bg-white text-black border border-gray-300' 
        : 'bg-green-600 text-white border-0'} shadow-md font-medium`}
      onClick={handleFollowToggle}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="animate-pulse">Loading...</span>
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" /> 
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" /> 
          Follow
        </>
      )}
    </Button>
  );
}