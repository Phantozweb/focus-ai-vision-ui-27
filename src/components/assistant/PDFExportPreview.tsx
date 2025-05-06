
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './ChatMessage';
import { Download, ExternalLink, FileText, X, Edit, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Textarea } from '@/components/ui/textarea';
import { exportMarkdownReportAsPdf } from '@/utils/pdfExport';

interface PDFExportPreviewProps {
  chatHistory: ChatMessage[];
  onClose: () => void;
  onExport: (filename: string) => void;
  title?: string;
}

const PDFExportPreview: React.FC<PDFExportPreviewProps> = ({ 
  chatHistory, 
  onClose, 
  onExport 
}) => {
  // Filter to only include bot responses (answers)
  const botResponses = chatHistory.filter(msg => msg.type === 'bot');
  const [filename, setFilename] = useState('');
  const [editingContent, setEditingContent] = useState<{[key: number]: boolean}>({});
  const [editedContent, setEditedContent] = useState<{[key: number]: string}>({});
  
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
    // Combine all edited content into one markdown string
    const combinedMarkdown = Object.values(editedContent).join('\n\n---\n\n');
    
    // Export directly using our improved utility for better markdown handling
    exportMarkdownReportAsPdf(
      'exportContainer',
      combinedMarkdown,
      '',
      filename || 'optometry-notes'
    );
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
              <label htmlFor="filename" className="block text-sm font-medium text-gray-700 mb-1">
                File Name
              </label>
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="h-9 bg-white"
                placeholder="Enter filename (will export as 'optometry-notes' if blank)"
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
        
        {/* Preview content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white print-container" id="pdf-export-content">
          <div className="space-y-3">
            {botResponses.map((response, index) => (
              <div key={index} className="pb-3 mb-3 border-b border-gray-200 last:border-b-0">
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
                    >
                      {editedContent[index]}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
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
