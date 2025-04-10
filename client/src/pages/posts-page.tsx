import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PostsList } from "@/components/post/posts-list";
import { PostForm } from "@/components/post/post-form"; 
import { useAuth } from "@/hooks/use-auth";
import { Plus } from "lucide-react";
import { Journal } from "@shared/schema";

export default function PostsPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Journal | null>(null);

  const handleEditPost = (post: Journal) => {
    setEditingPost(post);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setEditingPost(null);
    setShowForm(false);
  };

  const handleFormSuccess = () => {
    setEditingPost(null);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Community Posts</h1>
          <p className="text-muted-foreground mt-2">
            Discover insights and stories from the community
          </p>
        </div>
        
        {user && (
          <Button 
            onClick={() => {
              setEditingPost(null);
              setShowForm(!showForm);
            }}
          >
            {showForm ? "Cancel" : (
              <>
                <Plus className="mr-2 h-4 w-4" /> 
                Create Post
              </>
            )}
          </Button>
        )}
      </div>

      {showForm && user && (
        <div className="mb-8">
          <PostForm 
            initialData={editingPost || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        <div>
          <PostsList userId={undefined} />
        </div>
      </div>
    </div>
  );
}