
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ThinkingIndicatorProps {
  phase: string;
}

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ phase }) => {
  // Only render if there's an active phase
  if (!phase) return null;
  
  return (
    <div className="flex items-start p-4">
      <div className="mr-4 mt-0.5">
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
        </div>
      </div>
      <div>
        <div className="font-semibold text-xs mb-1">Focus.AI Assistant</div>
        <div className="flex items-center text-gray-600">
          <div className="text-sm">{phase}</div>
          <div className="flex space-x-1 ml-2">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-pulse" style={{ animationDelay: '300ms' }}></div>
            <div className="h-1.5 w-1.5 rounded-full bg-gray-500 animate-pulse" style={{ animationDelay: '600ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThinkingIndicator;
