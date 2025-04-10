import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Journal, insertJournalSchema } from "@shared/schema";
import { ImageUpload } from "@/components/ui/image-upload";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Extended schema with validation
const postFormSchema = insertJournalSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters").max(255, "Title is too long"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  excerpt: z.string().max(250, "Excerpt must be less than 250 characters").optional(),
  coverImage: z.string().optional(),
  published: z.boolean().default(true),
});

type PostFormValues = z.infer<typeof postFormSchema>;

interface PostFormProps {
  initialData?: Journal;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PostForm({ initialData, onSuccess, onCancel }: PostFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [coverImage, setCoverImage] = useState<string | undefined>(initialData?.coverImage || undefined);

  const defaultValues: Partial<PostFormValues> = {
    title: initialData?.title || "",
    content: initialData?.content || "",
    excerpt: initialData?.excerpt || "",
    coverImage: initialData?.coverImage || "",
    published: initialData?.published ?? true,
  };

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues,
  });

  const isEditMode = !!initialData;

  const createPostMutation = useMutation({
    mutationFn: async (postData: PostFormValues) => {
      const response = await apiRequest("POST", "/api/posts", postData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/posts"] });
      toast({
        title: "Post created",
        description: "Your post has been published successfully.",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PostFormValues }) => {
      const response = await apiRequest("PUT", `/api/posts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/posts"] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${initialData?.id}`] });
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully.",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (url: string) => {
    setCoverImage(url);
    form.setValue("coverImage", url, { shouldValidate: true });
  };

  const handleImageRemove = () => {
    setCoverImage(undefined);
    form.setValue("coverImage", "", { shouldValidate: true });
  };

  const onSubmit = (data: PostFormValues) => {
    // Make sure to include the coverImage from state
    const postData = {
      ...data,
      coverImage
    };

    if (isEditMode && initialData) {
      updatePostMutation.mutate({
        id: initialData.id,
        data: postData,
      });
    } else {
      createPostMutation.mutate(postData);
    }
  };

  const isPending = createPostMutation.isPending || updatePostMutation.isPending;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">
        {isEditMode ? "Edit Post" : "Create Post"}
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter a title for your post" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Brief summary of your post" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Write your post here..."
                    className="min-h-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <FormLabel>Cover Image (optional)</FormLabel>
            <ImageUpload
              currentImage={coverImage}
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              label="Upload cover image"
            />
          </div>

          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Publish
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    {field.value 
                      ? "Your post will be visible to others" 
                      : "Save as draft (only visible to you)"}
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Update" : "Publish"} Post
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}