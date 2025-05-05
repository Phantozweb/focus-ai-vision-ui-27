
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { config } from '@/config/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const handleConfirm = () => {
    toast.success('Using the default API key');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gemini API Key Information</DialogTitle>
          <DialogDescription>
            This application uses a default API key for accessing the Gemini AI model. If you encounter any issues with responses,
            please try again later or contact support.
          </DialogDescription>
        </DialogHeader>
        
        <div className="pt-4 text-sm text-gray-500">
          <p>
            The application is using a shared API key which may have usage limits. 
            If you experience any issues with the AI responses, it might be due to rate limiting.
          </p>
        </div>
        
        <DialogFooter className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-end">
          <Button onClick={handleConfirm} className="w-full sm:w-auto">
            I Understand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
