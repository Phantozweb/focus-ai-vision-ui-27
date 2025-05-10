
import React, { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

interface ImageUploadButtonProps {
  onImageSelected: (imageData: string | null) => void;
  isDisabled?: boolean;
}

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({ 
  onImageSelected,
  isDisabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP image formats are supported');
      return;
    }

    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      onImageSelected(imageData);
      setIsLoading(false);
      toast.success('Image attached successfully');
    };
    
    reader.onerror = () => {
      toast.error('Failed to read image');
      setIsLoading(false);
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleImageUpload}
        className="hidden"
        id="image-upload"
        disabled={isDisabled || isLoading}
      />
      <label htmlFor="image-upload">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={isDisabled || isLoading}
          asChild
        >
          <span>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </span>
        </Button>
      </label>
    </div>
  );
};

export default ImageUploadButton;
