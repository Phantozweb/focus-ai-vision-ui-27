
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Table } from '@/components/ui/table';

interface CaseMarkdownProps {
  content: string;
  className?: string;
}

const CaseMarkdown: React.FC<CaseMarkdownProps> = ({ content, className = '' }) => {
  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      className={`markdown-content ${className}`}
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
          <th {...props} className="px-4 py-3 text-left text-sm font-semibold text-blue-700" />
        ),
        td: ({ node, ...props }) => (
          <td {...props} className="px-4 py-3 text-sm border-t border-gray-200" />
        ),
        tr: ({ node, children, ...props }) => (
          <tr {...props} className="hover:bg-gray-50 transition-colors">{children}</tr>
        ),
        a: ({ node, ...props }) => (
          <a {...props} className="text-blue-500 hover:text-blue-700 hover:underline" target="_blank" rel="noreferrer" />
        ),
        code: ({ node, ...props }) => (
          <code {...props} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" />
        ),
        pre: ({ node, ...props }) => (
          <pre {...props} className="bg-gray-100 p-4 rounded-md overflow-x-auto my-4" />
        ),
        h1: ({ node, ...props }) => (
          <h1 {...props} className="text-2xl font-bold text-blue-700 mt-6 mb-4" />
        ),
        h2: ({ node, ...props }) => (
          <h2 {...props} className="text-xl font-bold text-blue-600 mt-5 mb-3 pb-1 border-b border-gray-200" />
        ),
        h3: ({ node, ...props }) => (
          <h3 {...props} className="text-lg font-bold text-blue-500 mt-4 mb-2" />
        ),
        strong: ({ node, ...props }) => (
          <strong {...props} className="font-bold text-blue-700" />
        ),
        em: ({ node, ...props }) => (
          <em {...props} className="italic text-blue-600" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default CaseMarkdown;
