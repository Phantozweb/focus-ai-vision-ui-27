
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { List, FileText, Save, Download } from 'lucide-react';
import { Copy, RefreshCw } from 'lucide-react';
import MagicWandMenu from '@/components/MagicWandMenu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  downloadAsPDF: () => void;
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
  downloadAsPDF,
  refreshSuggestions,
  handleSuggestionClick,
  followUpLoading
}) => {
  if (message.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl p-4 bg-blue-600 text-white">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl p-4 bg-gray-100 text-gray-800 border border-gray-200">
        <div className="markdown-content">
          <ReactMarkdown>{message.content}</ReactMarkdown>
          
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
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="bg-white border-gray-300 text-blue-500 hover:bg-blue-50 text-xs flex items-center gap-1"
              onClick={() => generateSummary(index)}
            >
              <List className="h-3 w-3" />
              Summary
            </Button>
            
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="bg-white border-gray-300 text-blue-500 hover:bg-blue-50 text-xs flex items-center gap-1"
              onClick={() => generatePracticeQuestions(index)}
            >
              <FileText className="h-3 w-3" />
              MCQs
            </Button>
            
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="bg-white border-gray-300 text-blue-500 hover:bg-blue-50 text-xs flex items-center gap-1"
              onClick={() => addToNotes(index)}
            >
              <Save className="h-3 w-3" />
              To Notes
            </Button>
            
            <MagicWandMenu onOptionSelect={(option) => handleMagicWandOption(index, option)} />
            
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="bg-white border-gray-300 text-blue-500 hover:bg-blue-50 h-6 w-6"
              onClick={handleCopyConversation}
              title="Copy Conversation"
            >
              <Copy className="h-3 w-3" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="bg-white border-gray-300 text-blue-500 hover:bg-blue-50 h-6 w-6"
                  title="Download"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem onClick={downloadAsMarkdown} className="cursor-pointer">
                  Download as Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadAsPDF} className="cursor-pointer">
                  Download as PDF
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
