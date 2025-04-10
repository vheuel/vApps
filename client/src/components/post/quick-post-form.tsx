import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon } from "lucide-react";

// Simple schema for quick post entries
const quickPostSchema = z.object({
  content: z.string().min(1, "Post content cannot be empty"),
  coverImage: z.string().optional(),
});

type QuickPostFormValues = z.infer<typeof quickPostSchema>;

export function QuickPostForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);

  const form = useForm<QuickPostFormValues>({
    resolver: zodResolver(quickPostSchema),
    defaultValues: {
      content: "",
      coverImage: "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: QuickPostFormValues) => {
      // Create a simple post with auto-generated title from first 5 words
      const content = data.content.trim();
      const titleWords = content.split(" ").slice(0, 5).join(" ");
      const title = titleWords + (content.split(" ").length > 5 ? "..." : "");
      
      const postData = {
        title: title,
        content: content,
        coverImage: data.coverImage,
        published: true,
      };
      
      const response = await apiRequest("POST", "/api/journals", postData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/journals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/journals/featured"] });
      
      // Reset the form
      form.reset();
      setCoverImage(undefined);
      
      toast({
        title: "Post published",
        description: "Your post has been published successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to publish post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (base64Image: string) => {
    setCoverImage(base64Image);
    form.setValue("coverImage", base64Image);
  };

  const handleImageRemove = () => {
    setCoverImage(undefined);
    form.setValue("coverImage", "");
  };

  const onSubmit = (values: QuickPostFormValues) => {
    createPostMutation.mutate(values);
  };

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6">
      <div className="flex items-start space-x-3">
        <Avatar className="h-10 w-10 bg-sky-200 flex-shrink-0">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.username} />
          ) : (
            <AvatarFallback><UserIcon className="h-5 w-5" /></AvatarFallback>
          )}
        </Avatar>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow space-y-4 w-full">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="What happened?" 
                      className="min-h-[100px] w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {coverImage && (
              <div className="relative rounded-md overflow-hidden">
                <img src={coverImage} alt="Post cover" className="w-full h-auto max-h-[200px] object-cover rounded-md" />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={handleImageRemove}
                >
                  <ImageIcon className="h-4 w-4 mr-1" /> Remove
                </Button>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                {!coverImage && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-500 hover:text-gray-600"
                    onClick={() => {
                      const imageUploadEl = document.getElementById('image-upload-trigger');
                      if (imageUploadEl) {
                        imageUploadEl.click();
                      }
                    }}
                  >
                    <ImageIcon className="h-5 w-5 mr-1" />
                    <span>Image</span>
                  </Button>
                )}
                
                {/* Hidden image upload - triggered by the button above */}
                <div className="hidden">
                  <div id="image-upload-trigger">
                    <ImageUpload
                      onImageUpload={handleImageUpload}
                      onImageRemove={handleImageRemove}
                      currentImage={coverImage}
                    />
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit"
                className="ml-auto"
                disabled={createPostMutation.isPending}
              >
                {createPostMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}