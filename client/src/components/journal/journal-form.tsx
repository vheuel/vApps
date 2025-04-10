import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Journal, InsertJournal } from "@shared/schema";
import { ImageUpload } from "@/components/ui/image-upload";

interface JournalFormProps {
  initialData?: Journal;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function JournalForm({ initialData, onSuccess, onCancel }: JournalFormProps) {
  const { toast } = useToast();
  const isEdit = !!initialData;
  
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [published, setPublished] = useState(initialData?.published ?? true);

  const mutation = useMutation({
    mutationFn: async (data: InsertJournal) => {
      if (isEdit && initialData) {
        const res = await apiRequest("PUT", `/api/journals/${initialData.id}`, data);
        return res.json();
      } else {
        const res = await apiRequest("POST", `/api/journals`, data);
        return res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: isEdit ? "Journal updated" : "Journal created",
        description: isEdit
          ? "Your journal has been updated successfully"
          : "Your journal has been published successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/journals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/journals"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: isEdit ? "Failed to update journal" : "Failed to create journal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Validation error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Validation error",
        description: "Content is required",
        variant: "destructive",
      });
      return;
    }
    
    const journalData: InsertJournal = {
      title,
      content,
      excerpt: excerpt || content.substring(0, Math.min(content.length, 200)),
      coverImage,
      published,
    };
    
    mutation.mutate(journalData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Journal Entry" : "Create Journal Entry"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image</Label>
            <ImageUpload
              value={coverImage}
              onChange={(url) => setCoverImage(url)}
              onClear={() => setCoverImage("")}
              maxSizeMB={2}
              label="Upload cover image (max 2MB)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter journal title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your journal entry here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt (Optional)</Label>
            <Textarea
              id="excerpt"
              placeholder="A short summary of your journal entry (max 300 characters)"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="min-h-[100px]"
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">
              {excerpt.length}/300 characters. If left empty, an excerpt will be generated from your content.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={published}
              onCheckedChange={setPublished}
            />
            <Label htmlFor="published">Publish immediately</Label>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-1">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-opacity-50 border-t-transparent"></span>
                {isEdit ? "Updating..." : "Publishing..."}
              </span>
            ) : (
              isEdit ? "Update Journal" : "Publish Journal"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}