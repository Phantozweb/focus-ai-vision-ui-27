
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setApiKey, checkApiKey, getApiKey } from '@/utils/geminiApi';
import { toast } from '@/components/ui/sonner';
import { config } from '@/config/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKeyValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUsingDefaultKey, setIsUsingDefaultKey] = useState(getApiKey() === config.geminiApiKey);

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
        setIsUsingDefaultKey(false);
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

  const useDefaultKey = async () => {
    setIsLoading(true);
    
    try {
      setApiKey(config.geminiApiKey);
      const isValid = await checkApiKey();
      
      if (isValid) {
        setIsUsingDefaultKey(true);
        toast.success('Using default API key');
        onClose();
      } else {
        toast.error('Default API key is invalid. Please enter your own key.');
      }
    } catch (error) {
      console.error('Error validating default API key:', error);
      toast.error('Failed to use default API key');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gemini API Key Settings</DialogTitle>
          <DialogDescription>
            A default API key is already provided. You can use your own key for higher rate limits or if the default key stops working.
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
              Using {isUsingDefaultKey ? 'default' : 'custom'} API key. You can get your own key from{' '}
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
          
          <DialogFooter className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={useDefaultKey} 
              disabled={isLoading || isUsingDefaultKey}
              className="w-full sm:w-auto"
            >
              Use Default Key
            </Button>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? 'Validating...' : 'Save API Key'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
