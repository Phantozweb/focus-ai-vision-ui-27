
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './ChatMessage';
import { Bot, ExternalLink } from 'lucide-react';

interface PDFExportPreviewProps {
  chatHistory: ChatMessage[];
  onClose: () => void;
  onExport: () => void;
  title?: string;
}

const PDFExportPreview: React.FC<PDFExportPreviewProps> = ({ 
  chatHistory, 
  onClose, 
  onExport,
  title = "AI Assistant Conversation"
}) => {
  // Filter to only include bot responses (answers)
  const botResponses = chatHistory.filter(msg => msg.type === 'bot');
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-lg">
        {/* Header with branding */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <Bot className="w-8 h-8 text-blue-400" />
              <div className="absolute right-0 bottom-0 bg-blue-500 text-xs text-white rounded-sm px-1 font-bold">
                AI
              </div>
            </div>
            <span className="font-bold text-xl text-gray-800">Focus.AI</span>
          </div>
          
          <div className="flex items-center gap-2">
            <a 
              href="https://focusai.netlify.app" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 text-sm flex items-center hover:underline"
            >
              Visit Focus.AI <ExternalLink className="h-3 w-3 ml-1" />
            </a>
            <Button variant="ghost" onClick={onClose} className="text-gray-500">
              &times;
            </Button>
          </div>
        </div>
        
        {/* Preview content */}
        <div className="flex-1 overflow-y-auto p-6" id="pdf-export-content">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
            <p className="text-gray-500 text-sm">
              Generated on {new Date().toLocaleDateString()} by Focus.AI
            </p>
          </div>
          
          <div className="space-y-6">
            {botResponses.map((response, index) => (
              <div key={index} className="pb-4 border-b border-gray-200 last:border-b-0">
                <div className="prose max-w-none markdown-content">
                  {response.content}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer with actions */}
        <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onExport}>
            Export as PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PDFExportPreview;
