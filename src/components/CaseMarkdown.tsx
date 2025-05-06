
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Table } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';

interface CaseMarkdownProps {
  content: string;
  className?: string;
}

const CaseMarkdown: React.FC<CaseMarkdownProps> = ({ content, className = '' }) => {
  // Process the content to enhance patient details formatting
  const enhancePatientDetails = (originalContent: string): string => {
    // First check if the content already contains tabulated patient details
    if (originalContent.includes('| Category | Information |')) {
      return originalContent;
    }

    // Split the content by sections to find and modify the patient demographics
    const sections = originalContent.split(/(?=#+\s)/);
    
    for (let i = 0; i < sections.length; i++) {
      // Look for patient demographics section
      if (sections[i].match(/^#+\s*Patient Demographics/i) || sections[i].match(/^#+\s*Patient Details/i)) {
        // Extract patient info from the section
        const lines = sections[i].split('\n');
        const headerLine = lines[0];
        const detailLines = lines.slice(1).filter(line => line.trim());
        
        // Extract key patient details
        const patientName = detailLines.find(line => /name:/i.test(line))?.replace(/.*name:/i, '').trim() || 'N/A';
        const patientAge = detailLines.find(line => /age:/i.test(line))?.replace(/.*age:/i, '').trim() || 'N/A';
        const patientGender = detailLines.find(line => /gender:/i.test(line))?.replace(/.*gender:/i, '').trim() || 'N/A';
        const patientOccupation = detailLines.find(line => /occupation:/i.test(line))?.replace(/.*occupation:/i, '').trim() || 'N/A';
        
        // Create a formatted patient details table
        sections[i] = `${headerLine}\n\n| Category | Information |\n| -------- | ----------- |\n| Name | ${patientName} |\n| Age | ${patientAge} |\n| Gender | ${patientGender} |\n| Occupation | ${patientOccupation} |\n\n`;
      }
      
      // Format history sections to be more readable
      if (sections[i].match(/^#+\s*(Past Ocular History|Medical History|Allergic History)/i)) {
        const lines = sections[i].split('\n');
        const headerLine = lines[0];
        let contentLines = lines.slice(1).filter(line => line.trim());
        
        // If content is a paragraph, split into bullet points for easier reading
        if (contentLines.length > 0 && !contentLines[0].startsWith('-') && !contentLines[0].startsWith('*')) {
          contentLines = contentLines.join(' ')
            .split(/\.\s+/)
            .filter(item => item.trim())
            .map(item => `- ${item.trim()}${!item.endsWith('.') ? '.' : ''}`);
        }
        
        sections[i] = `${headerLine}\n\n${contentLines.join('\n')}\n\n`;
      }
    }
    
    return sections.join('');
  };

  const enhancedContent = enhancePatientDetails(content);

  return (
    <div className={`${className} max-w-full`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ node, ...props }) => (
            <div className="my-4 sm:my-6 overflow-x-auto rounded-md border border-gray-200 shadow-sm">
              <Table {...props} className="min-w-full divide-y divide-gray-200" />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead {...props} className="bg-blue-50" />
          ),
          th: ({ node, ...props }) => (
            <th {...props} className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-blue-700" />
          ),
          td: ({ node, ...props }) => (
            <td {...props} className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border-t border-gray-200" />
          ),
          tr: ({ node, children, ...props }) => (
            <tr {...props} className="hover:bg-gray-50 transition-colors">{children}</tr>
          ),
          a: ({ node, ...props }) => (
            <a {...props} className="text-blue-500 hover:text-blue-700 hover:underline" target="_blank" rel="noreferrer" />
          ),
          code: ({ node, ...props }) => (
            <code {...props} className="bg-gray-100 px-1 py-0.5 rounded text-xs sm:text-sm font-mono break-words" />
          ),
          pre: ({ node, ...props }) => (
            <pre {...props} className="bg-gray-100 p-2 sm:p-4 rounded-md overflow-x-auto my-3 sm:my-4 text-xs sm:text-sm" />
          ),
          h1: ({ node, ...props }) => (
            <h1 {...props} className="text-xl sm:text-2xl font-bold text-blue-700 mt-6 sm:mt-8 mb-3 sm:mb-4 break-words" />
          ),
          h2: ({ node, ...props }) => (
            <>
              <h2 {...props} className="text-lg sm:text-xl font-bold text-blue-600 mt-5 sm:mt-7 mb-2 sm:mb-3 break-words" />
              <Separator className="mb-3 sm:mb-4 bg-gray-200" />
            </>
          ),
          h3: ({ node, ...props }) => (
            <h3 {...props} className="text-base sm:text-lg font-bold text-blue-500 mt-4 sm:mt-6 mb-2 break-words" />
          ),
          strong: ({ node, ...props }) => (
            <strong {...props} className="font-bold text-blue-700" />
          ),
          em: ({ node, ...props }) => (
            <em {...props} className="italic text-blue-600" />
          ),
          p: ({node, children, ...props}) => {
            // Check if this paragraph is likely a section header
            const textContent = children?.toString() || '';
            if (textContent.includes(':') && textContent.length < 30 && !textContent.includes(' ')) {
              return (
                <>
                  <p {...props} className="font-semibold text-blue-700 mt-4 mb-1 break-words">{children}</p>
                  <Separator className="mb-3 opacity-30" />
                </>
              );
            }
            return <p {...props} className="my-2 sm:my-3 break-words text-sm sm:text-base">{children}</p>;
          },
          section: ({ children, className }) => (
            <div className="p-3 sm:p-4 mb-3 sm:mb-4 shadow-sm border border-gray-200 rounded-md">
              {children}
            </div>
          ),
          img: ({ node, alt, src }) => (
            <img src={src} alt={alt || ''} className="max-w-full h-auto rounded my-3 sm:my-4" />
          ),
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 my-3 sm:my-4 text-sm sm:text-base" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal pl-4 sm:pl-6 space-y-1 sm:space-y-2 my-3 sm:my-4 text-sm sm:text-base" />
          ),
          li: ({ node, ...props }) => (
            <li {...props} className="mb-1 break-words" />
          ),
        }}
      >
        {enhancedContent}
      </ReactMarkdown>
    </div>
  );
};

export default CaseMarkdown;
