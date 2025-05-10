
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, X } from 'lucide-react';
import ImageUploadButton from './ImageUploadButton';

interface ChatInputProps {
  question: string;
  setQuestion: (question: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onImageAttach?: (imageData: string | null) => void;
}

const ChatInput = ({
  question,
  setQuestion,
  handleSubmit,
  isLoading,
  onImageAttach
}: ChatInputProps) => {
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  const handleImageSelected = (imageData: string | null) => {
    setAttachedImage(imageData);
    if (onImageAttach) {
      onImageAttach(imageData);
    }
  };

  const removeImage = () => {
    setAttachedImage(null);
    if (onImageAttach) {
      onImageAttach(null);
    }
  };

  return (
    <div className="p-4 border-t border-gray-200">
      {attachedImage && (
        <div className="mb-2 relative inline-block">
          <img 
            src={attachedImage} 
            alt="Attached" 
            className="h-20 rounded-md object-cover border border-gray-300"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-6 w-6 absolute -top-2 -right-2 rounded-full bg-gray-100"
            onClick={removeImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          type="text"
          placeholder={isLoading ? "Generating response..." : "Ask me about optometry topics..."}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isLoading}
          className="flex-grow"
        />
        
        {onImageAttach && (
          <ImageUploadButton 
            onImageSelected={handleImageSelected}
            isDisabled={isLoading}
          />
        )}
        
        <Button 
          type="submit" 
          disabled={isLoading || (!question.trim() && !attachedImage)}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
