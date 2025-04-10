import { useParams } from "wouter";
import { PostDetail } from "@/components/post/post-detail";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const postId = params?.id ? parseInt(params.id) : 0;

  if (!postId) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold text-destructive">Invalid Post ID</h1>
        <p className="text-muted-foreground mt-2">
          The post you're looking for could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4" tabIndex={-1}>
      <PostDetail postId={postId} />
    </div>
  );
}