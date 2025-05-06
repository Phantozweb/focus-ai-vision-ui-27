
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Copy, RefreshCw } from 'lucide-react';
import MagicWandMenu from '@/components/MagicWandMenu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import CaseMarkdown from '@/components/CaseMarkdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';

export interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  suggestions?: string[];
}

interface ChatMessageProps {
  message: ChatMessage;
  index: number;
  generateSummary: (index: number) => void;
  generatePracticeQuestions: (index: number) => void;
  addToNotes: (index: number) => void;
  handleMagicWandOption: (index: number, option: string) => void;
  handleCopyConversation: () => void;
  downloadAsMarkdown: () => void;
  refreshSuggestions: (index: number) => void;
  handleSuggestionClick: (suggestion: string) => void;
  followUpLoading: boolean;
}

const ChatMessageComponent: React.FC<ChatMessageProps> = ({
  message,
  index,
  generateSummary,
  generatePracticeQuestions,
  addToNotes,
  handleMagicWandOption,
  handleCopyConversation,
  downloadAsMarkdown,
  refreshSuggestions,
  handleSuggestionClick,
  followUpLoading
}) => {
  const isMobile = useIsMobile();

  // User messages styling
  if (message.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className={`rounded-2xl p-4 bg-blue-600 text-white ${isMobile ? 'max-w-[90%]' : 'max-w-[80%]'}`}>
          {message.content}
        </div>
      </div>
    );
  }

  // Bot messages styling - using the CaseMarkdown component
  return (
    <div className="flex justify-start">
      <div className={`rounded-2xl p-4 bg-gray-100 text-gray-800 border border-gray-200 ${isMobile ? 'w-full' : 'max-w-[80%]'}`}>
        <div className="markdown-content">
          <CaseMarkdown content={message.content} />
          
          {/* Follow-up suggestions */}
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Follow-up questions</h4>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-gray-500 hover:text-blue-500"
                      onClick={() => refreshSuggestions(index)}
                      disabled={followUpLoading}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Generate new suggestions</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex overflow-x-auto pb-2 gap-2">
                {message.suggestions.map((suggestion, idx) => (
                  <Button 
                    key={idx} 
                    variant="outline" 
                    size="sm"
                    className="text-xs whitespace-nowrap bg-white text-blue-600 hover:bg-blue-50 mb-2"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex flex-wrap justify-end gap-2 mt-3 pt-2 border-t border-gray-200">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="bg-white border-gray-300 text-blue-500 hover:bg-blue-50 h-8 w-8"
                  onClick={() => addToNotes(index)}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save to Notes</p>
              </TooltipContent>
            </Tooltip>
            
            <MagicWandMenu onOptionSelect={(option) => handleMagicWandOption(index, option)} />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="bg-white border-gray-300 text-blue-500 hover:bg-blue-50 h-8 w-8"
                  onClick={handleCopyConversation}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy Conversation</p>
              </TooltipContent>
            </Tooltip>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="bg-white border-gray-300 text-blue-500 hover:bg-blue-50 h-8 w-8"
                  onClick={downloadAsMarkdown}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem onClick={downloadAsMarkdown} className="cursor-pointer">
                  Download as Markdown
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageComponent;
