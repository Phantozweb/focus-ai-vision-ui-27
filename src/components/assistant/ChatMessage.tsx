
import React, { useState } from 'react';
import { Bot, Copy, BookmarkPlus, Download } from 'lucide-react';
import CaseMarkdown from '@/components/CaseMarkdown';
import MagicWandMenu from '@/components/MagicWandMenu';
import { Button } from '@/components/ui/button';
import { Repeat } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { downloadAsMarkdown } from '@/utils/downloadUtils';

export interface ChatMessageProps {
  type: 'user' | 'bot';
  content: string;
  imageData?: string | null;
  index: number;
  suggestions?: string[];
  onMagicWandOption: (index: number, option: string) => void;
  onSuggestionClick: (suggestion: string) => void;
  onRefreshSuggestions: (index: number) => void;
  generateSummary: (index: number) => void;
  generatePracticeQuestions: (index: number) => void;
  addToNotes: (index: number) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  type,
  content,
  imageData,
  index,
  suggestions,
  onMagicWandOption,
  onSuggestionClick,
  onRefreshSuggestions,
  generateSummary,
  generatePracticeQuestions,
  addToNotes,
}) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy'));
  };

  const handleDownload = () => {
    const filename = `focus-ai-response-${new Date().toISOString().slice(0, 10)}`;
    downloadAsMarkdown(content, filename);
    toast.success('Downloaded as Markdown');
  };

  return (
    <div className={`mb-4 ${type === 'bot' ? 'bg-white' : 'bg-sky-50'} rounded-lg border border-gray-200`}>
      <div className="flex items-start p-4">
        {type === 'bot' && (
          <div className="mr-4 mt-0.5">
            <div className="h-8 w-8 flex items-center justify-center text-blue-500">
              <Bot className="h-6 w-6" />
            </div>
          </div>
        )}
        
        <div className={`flex-1 min-w-0 ${type === 'user' ? 'ml-0' : ''}`}>
          <div className="font-semibold text-xs mb-1">
            {type === 'user' ? 'You' : 'Focus.AI'}
          </div>
          
          {imageData && (
            <div className="mb-3">
              <img 
                src={imageData} 
                alt="Attached" 
                className="max-h-60 rounded-md object-contain border border-gray-200" 
              />
            </div>
          )}
          
          {type === 'user' ? (
            <p className="text-gray-800 whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="markdown-content">
              <CaseMarkdown content={content} />
            </div>
          )}
          
          {type === 'bot' && (
            <>
              <div className="flex flex-wrap gap-2 mt-4">
                {suggestions && suggestions.length > 0 && (
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-500">Suggested follow-up questions</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => onRefreshSuggestions(index)}
                      >
                        <Repeat className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {suggestions.map((suggestion, i) => (
                        <Button 
                          key={i} 
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-1 px-2 bg-white"
                          onClick={() => onSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 mt-2">
                  {/* Format content button (Magic Wand) */}
                  <MagicWandMenu 
                    onOptionSelect={(option) => onMagicWandOption(index, option)}
                  />

                  {/* Save to Study Notes button */}
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-8 w-8 bg-white border-gray-300 text-blue-500 hover:bg-blue-50"
                    onClick={() => addToNotes(index)}
                    title="Save to Study Notes"
                  >
                    <BookmarkPlus className="h-4 w-4" />
                  </Button>

                  {/* Download Markdown button */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-white border-gray-300 text-blue-500 hover:bg-blue-50"
                    title="Download as Markdown"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  {/* Copy button */}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={copyToClipboard}
                    title="Copy to Clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
