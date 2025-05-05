
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from './ChatMessage';
import { ExternalLink } from 'lucide-react';
import { Table } from '@/components/ui/table';
import Logo from '@/components/Logo';

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
  const previewRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-xl">
        {/* Enhanced header with branding */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-2">
            <Logo variant="export" />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 text-blue-500 hover:bg-blue-50" 
              onClick={() => window.open("https://focusai.netlify.app", "_blank")}
            >
              Visit Focus.AI <ExternalLink className="h-3 w-3" />
            </Button>
            <Button variant="ghost" onClick={onClose} className="text-gray-500">
              &times;
            </Button>
          </div>
        </div>
        
        {/* Preview content with premium styling */}
        <div className="flex-1 overflow-y-auto p-6 bg-white" id="pdf-export-content" ref={previewRef}>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
            <p className="text-gray-500 text-sm">
              Generated on {new Date().toLocaleDateString()} by Focus.AI
            </p>
          </div>
          
          <div className="space-y-6">
            {botResponses.map((response, index) => (
              <div key={index} className="pb-4 border-b border-gray-200 last:border-b-0">
                <div className="prose max-w-none markdown-content">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ node, ...props }) => (
                        <div className="my-4 overflow-x-auto rounded-md border border-gray-200 shadow-sm">
                          <Table {...props} className="min-w-full divide-y divide-gray-200" />
                        </div>
                      ),
                      thead: ({ node, ...props }) => (
                        <thead {...props} className="bg-blue-50" />
                      ),
                      th: ({ node, ...props }) => (
                        <th {...props} className="px-3 py-2 text-left text-xs font-semibold text-blue-700" />
                      ),
                      td: ({ node, ...props }) => (
                        <td {...props} className="px-3 py-2 text-xs border-t border-gray-200" />
                      ),
                      tr: ({ node, children, ...props }) => (
                        <tr {...props} className="hover:bg-gray-50 transition-colors">{children}</tr>
                      ),
                      a: ({ node, ...props }) => (
                        <a {...props} className="text-blue-500 hover:text-blue-700 hover:underline text-sm" target="_blank" rel="noreferrer" />
                      ),
                      code: ({ node, ...props }) => (
                        <code {...props} className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono" />
                      ),
                      pre: ({ node, ...props }) => (
                        <pre {...props} className="bg-gray-100 p-3 rounded-md overflow-x-auto my-3 text-xs" />
                      ),
                      h1: ({ node, ...props }) => (
                        <h1 {...props} className="text-lg font-bold text-blue-700 mt-4 mb-3" />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 {...props} className="text-base font-bold text-blue-600 mt-4 mb-2 pb-1 border-b border-gray-200" />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 {...props} className="text-sm font-bold text-blue-500 mt-3 mb-2" />
                      ),
                      p: ({ node, ...props }) => (
                        <p {...props} className="my-2 text-sm leading-relaxed text-gray-800" />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul {...props} className="list-disc pl-5 my-2 space-y-1 text-sm" />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol {...props} className="list-decimal pl-5 my-2 space-y-1 text-sm" />
                      ),
                      li: ({ node, ...props }) => (
                        <li {...props} className="mb-1 text-sm" />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong {...props} className="font-bold text-black" />
                      ),
                      em: ({ node, ...props }) => (
                        <em {...props} className="italic text-blue-600 text-sm" />
                      ),
                    }}
                  >
                    {response.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-3 border-t border-gray-200 text-center">
            <div className="flex justify-center items-center mb-2">
              <Logo variant="export" size="sm" asLink={false} />
            </div>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              This is AI-generated content. While we strive for accuracy, please verify any critical information.
            </p>
            <Button 
              variant="link" 
              size="sm" 
              className="mt-1 text-blue-500 hover:text-blue-700 text-xs" 
              onClick={() => window.open("https://focusai.netlify.app", "_blank")}
            >
              Visit Focus.AI <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
        
        {/* Footer with actions */}
        <div className="border-t border-gray-200 p-4 flex justify-end gap-3 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onExport} className="bg-blue-500 hover:bg-blue-600 text-white">
            Export as PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PDFExportPreview;
