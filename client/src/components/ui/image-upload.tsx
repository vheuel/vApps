import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageUpload: (base64Image: string) => void;
  onImageRemove: () => void;
  currentImage?: string;
  className?: string;
  maxSize?: number; // in MB
  label?: string;
}

export function ImageUpload({
  onImageUpload,
  onImageRemove,
  currentImage,
  className = '',
  maxSize = 2, // Default 2MB
  label = 'Upload image'
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (convert maxSize from MB to bytes)
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: `Image must be less than ${maxSize}MB.`,
        variant: 'destructive',
      });
      return;
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      onImageUpload(base64String);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove();
  };

  return (
    <div className={className}>
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
      />

      {preview ? (
        <div 
          className="relative rounded-md overflow-hidden"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <img src={preview} alt="Preview" className="w-full h-auto object-cover" />
          
          {isHovering && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={handleRemoveImage} 
                className="mr-2"
              >
                <X className="h-4 w-4 mr-1" /> Remove
              </Button>
              <Button 
                size="sm" 
                variant="default" 
                onClick={triggerFileInput}
              >
                <Upload className="h-4 w-4 mr-1" /> Change
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div 
          onClick={triggerFileInput}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
        >
          <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to {maxSize}MB</p>
        </div>
      )}
    </div>
  );
}