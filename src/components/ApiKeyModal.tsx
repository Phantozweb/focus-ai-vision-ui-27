
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setApiKey, checkApiKey } from '@/utils/geminiApi';
import { toast } from '@/components/ui/sonner';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKeyValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }
    
    setIsLoading(true);
    
    try {
      setApiKey(apiKey);
      const isValid = await checkApiKey();
      
      if (isValid) {
        toast.success('API key validated and saved successfully');
        onClose();
      } else {
        toast.error('Invalid API key. Please check and try again.');
        setApiKey(''); // Clear the invalid key from storage
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      toast.error('Failed to validate API key');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Gemini API Key</DialogTitle>
          <DialogDescription>
            To use the AI features, you'll need to provide a Gemini API key from Google AI Studio.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKeyValue(e.target.value)}
              className="col-span-3"
              autoComplete="off"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500">
              You can get an API key from{' '}
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Validating...' : 'Save API Key'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
