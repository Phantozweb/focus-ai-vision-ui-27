
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { enhanceNotes, EnhancementMode } from '@/utils/gemini/notesEnhancer';
import { toast } from 'sonner';
import { Save, WandSparkles, Pencil, X, RefreshCw } from 'lucide-react';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, content: string, folderId: string) => void;
  folders: Array<{ id: string; name: string }>;
  activeFolder: string | null;
}

const enhancementOptions = [
  { value: 'none', label: 'No Enhancement' },
  { value: 'grammar', label: 'Fix Grammar & Spelling' },
  { value: 'expand', label: 'Expand Content' },
  { value: 'simplify', label: 'Simplify Content' },
  { value: 'clinical', label: 'Add Clinical Perspectives' },
  { value: 'academic', label: 'Add Academic References' },
] as const;

type EnhancementOption = typeof enhancementOptions[number]['value'];

const CreateNoteModal: React.FC<CreateNoteModalProps> = ({ isOpen, onClose, onSave, folders, activeFolder }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>(activeFolder || 'default');
  const [enhancementMode, setEnhancementMode] = useState<EnhancementOption>('none');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for your note');
      return;
    }

    if (enhancementMode !== 'none' && content.trim()) {
      setIsEnhancing(true);
      try {
        // Only use enhancement modes that match the EnhancementMode type
        if (enhancementMode === 'grammar' || 
            enhancementMode === 'expand' || 
            enhancementMode === 'simplify' || 
            enhancementMode === 'clinical' || 
            enhancementMode === 'academic') {
          const enhancedContent = await enhanceNotes(content, enhancementMode);
          onSave(title, enhancedContent, selectedFolder);
        } else {
          // If it's 'none' or any other value, save the original content
          onSave(title, content, selectedFolder);
        }
        resetForm();
        toast.success('Note created with AI enhancement!');
      } catch (error) {
        console.error('Error enhancing note:', error);
        toast.error('Failed to enhance note. Saving original content instead.');
        onSave(title, content, selectedFolder);
        resetForm();
      } finally {
        setIsEnhancing(false);
      }
    } else {
      // Save without enhancement
      onSave(title, content, selectedFolder);
      resetForm();
      toast.success('Note created!');
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEnhancementMode('none');
    onClose();
  };

  const handleEnhancementChange = (value: string) => {
    // Validate the value to ensure it matches our EnhancementOption type
    if (value === 'none' || 
        value === 'grammar' || 
        value === 'expand' || 
        value === 'simplify' || 
        value === 'clinical' || 
        value === 'academic') {
      setEnhancementMode(value as EnhancementOption);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
          <DialogDescription>
            Create a new study note. You can optionally enhance it with AI.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <label htmlFor="note-title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <Input
              id="note-title"
              placeholder="Enter note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="note-content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <Textarea
              id="note-content"
              placeholder="Start typing your notes... You can use Markdown for formatting."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="note-folder" className="block text-sm font-medium text-gray-700 mb-1">
                Folder
              </label>
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="enhancement" className="block text-sm font-medium text-gray-700 mb-1">
                AI Enhancement
              </label>
              <Select value={enhancementMode} onValueChange={handleEnhancementChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select enhancement type" />
                </SelectTrigger>
                <SelectContent>
                  {enhancementOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSave} className="bg-sky-500 hover:bg-sky-600" disabled={isEnhancing || !title.trim()}>
              {isEnhancing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Enhancing...
                </>
              ) : (
                <>
                  {enhancementMode !== 'none' ? (
                    <>
                      <WandSparkles className="mr-2 h-4 w-4" /> Save with AI Enhancement
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Note
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNoteModal;
