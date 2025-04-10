import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onClear: () => void;
  maxSizeMB?: number;
  label?: string;
}

export function ImageUpload({ 
  value, 
  onChange, 
  onClear, 
  maxSizeMB = 1, 
  label = "Upload image" 
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert to bytes
    
    if (file.size > maxSizeBytes) {
      toast({
        title: "Error",
        description: `File size exceeds ${maxSizeMB}MB limit`,
        variant: "destructive",
      });
      return;
    }
    
    // Basic validation for image types
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Only image files are allowed",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Convert file to base64 string for storage
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onChange(reader.result);
        }
        setLoading(false);
      };
      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to read file",
          variant: "destructive",
        });
        setLoading(false);
      };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative border border-dashed rounded-md p-1 w-full">
          <img 
            src={value} 
            alt="Uploaded image" 
            className="max-h-[200px] mx-auto object-contain rounded" 
          />
          <Button 
            type="button" 
            size="icon" 
            variant="destructive" 
            className="absolute top-2 right-2 h-6 w-6" 
            onClick={onClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 text-center">
          <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{label}</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleUpload}
              disabled={loading}
            />
            {loading && (
              <div className="mt-2">
                <div className="h-5 w-5 mx-auto animate-spin rounded-full border-2 border-current border-opacity-50 border-t-transparent"></div>
              </div>
            )}
          </label>
        </div>
      )}
    </div>
  );
}