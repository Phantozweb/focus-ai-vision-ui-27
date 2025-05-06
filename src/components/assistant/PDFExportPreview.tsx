
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './ChatMessage';
import { Download, ExternalLink, FileText, X, Edit, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Textarea } from '@/components/ui/textarea';

interface PDFExportPreviewProps {
  chatHistory: ChatMessage[];
  onClose: () => void;
  onExport: (filename: string) => void;
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
  const [filename, setFilename] = useState('');
  const [customTitle, setCustomTitle] = useState(title);
  const [editingContent, setEditingContent] = useState<{[key: number]: boolean}>({});
  const [editedContent, setEditedContent] = useState<{[key: number]: string}>({});
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Initialize edited content with original responses
  useEffect(() => {
    const initialContent: {[key: number]: string} = {};
    botResponses.forEach((response, index) => {
      initialContent[index] = response.content;
    });
    setEditedContent(initialContent);
  }, [botResponses]);

  const toggleEdit = (index: number) => {
    setEditingContent(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleContentChange = (index: number, content: string) => {
    setEditedContent(prev => ({
      ...prev,
      [index]: content
    }));
  };

  const handleExport = () => {
    onExport(filename || 'untitled');
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white rounded-lg max-w-4xl w-full h-[90vh] flex flex-col shadow-xl">
        {/* Header with title */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <FileText className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-800">Export Preview</h2>
            </div>
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
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose} 
              className="text-gray-500 hover:bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center"
              aria-label="Close"
              id="export-close-button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Export options */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex flex-col space-y-3">
            <div className="flex-1">
              <label htmlFor="custom-title" className="block text-sm font-medium text-gray-700 mb-1">
                Document Title
              </label>
              <Input
                id="custom-title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="h-9 bg-white"
                placeholder="Enter a descriptive title for this document"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="filename" className="block text-sm font-medium text-gray-700 mb-1">
                File Name
              </label>
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="h-9 bg-white"
                placeholder="Enter filename (will export as 'untitled' if blank)"
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleExport}
                className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1 h-9"
              >
                <Download className="h-4 w-4" /> Export PDF
              </Button>
            </div>
          </div>
        </div>
        
        {/* Preview content - this mirrors the PDF output exactly */}
        <div className="flex-1 overflow-y-auto p-6 bg-white print-container" id="pdf-export-content" ref={contentRef}>
          {/* Header for PDF first page */}
          <div className="premium-pdf-header mb-6 bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border border-blue-100">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-blue-700">{customTitle}</h1>
                <p className="text-gray-500 text-sm">
                  Generated on {new Date().toLocaleDateString()}
                </p>
              </div>
              <FileText className="h-10 w-10 text-blue-300" />
            </div>
          </div>
          
          <div className="space-y-4">
            {botResponses.map((response, index) => (
              <div key={index} className="pb-4 mb-4 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-end mb-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => toggleEdit(index)}
                  >
                    {editingContent[index] ? (
                      <><Check className="h-4 w-4 mr-1" /> Done</>
                    ) : (
                      <><Edit className="h-4 w-4 mr-1" /> Edit</>
                    )}
                  </Button>
                </div>
                
                {editingContent[index] ? (
                  <Textarea
                    value={editedContent[index]}
                    onChange={(e) => handleContentChange(index, e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                ) : (
                  <div className="prose max-w-none markdown-content pdf-section">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ node, ...props }) => (
                          <div className="pdf-table-wrapper my-4 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                            <table {...props} className="min-w-full divide-y divide-gray-200 pdf-table" />
                          </div>
                        ),
                        thead: ({ node, ...props }) => (
                          <thead {...props} className="bg-blue-50 pdf-thead" />
                        ),
                        th: ({ node, ...props }) => (
                          <th {...props} className="px-3 py-2 text-left text-xs font-semibold text-blue-700 border-b pdf-th" />
                        ),
                        td: ({ node, ...props }) => (
                          <td {...props} className="px-3 py-2 text-xs border-t border-gray-200 pdf-td" />
                        ),
                        tr: ({ node, children, ...props }) => (
                          <tr {...props} className="hover:bg-gray-50 transition-colors pdf-tr">{children}</tr>
                        ),
                        a: ({ node, ...props }) => (
                          <a {...props} className="text-blue-500 hover:text-blue-700 hover:underline text-sm pdf-link" target="_blank" rel="noreferrer" />
                        ),
                        code: ({ node, ...props }) => (
                          <code {...props} className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono pdf-code" />
                        ),
                        pre: ({ node, ...props }) => (
                          <pre {...props} className="bg-gray-100 p-3 rounded-md overflow-x-auto my-3 text-xs pdf-pre" />
                        ),
                        h1: ({ node, ...props }) => (
                          <h1 {...props} className="text-lg font-bold text-blue-700 mt-4 mb-2 pdf-h1" />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 {...props} className="text-base font-bold text-blue-600 mt-4 mb-2 pb-1 border-b border-gray-200 pdf-h2" />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 {...props} className="text-sm font-bold text-blue-500 mt-3 mb-2 pdf-h3" />
                        ),
                        p: ({ node, ...props }) => (
                          <p {...props} className="my-2 text-sm leading-relaxed text-gray-800 pdf-p" />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul {...props} className="list-disc pl-5 my-2 space-y-1 text-sm pdf-ul" />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol {...props} className="list-decimal pl-5 my-2 space-y-1 text-sm pdf-ol" />
                        ),
                        li: ({ node, ...props }) => (
                          <li {...props} className="mb-1 text-sm pdf-li" />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong {...props} className="font-bold text-black pdf-strong" />
                        ),
                        em: ({ node, ...props }) => (
                          <em {...props} className="italic text-gray-600 text-sm pdf-em" />
                        ),
                      }}
                    >
                      {editedContent[index]}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Footer with logo instead of watermark */}
          <div className="mt-6 pt-3 border-t border-gray-200 text-center pdf-footer flex flex-col items-center">
            <div className="h-10 w-10 mx-auto mb-2">
              <div className="flex items-center justify-center">
                <Eye className="h-6 w-6 text-sky-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Generated by Focus.AI - An intelligent assistant for optometry students
            </p>
          </div>
        </div>
        
        {/* Footer with actions */}
        <div className="border-t border-gray-200 p-4 flex justify-end gap-3 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PDFExportPreview;
