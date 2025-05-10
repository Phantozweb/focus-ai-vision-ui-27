
import React from 'react';
import { Loader } from 'lucide-react';

interface ThinkingIndicatorProps {
  phase: string;
}

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ phase }) => {
  if (!phase) return null;
  
  return (
    <div className="flex items-center gap-2 p-3 bg-sky-50 rounded-md text-sky-700 mb-2 animate-pulse">
      <Loader className="h-4 w-4 animate-spin" />
      <span className="text-sm font-medium">{phase}</span>
    </div>
  );
};

export default ThinkingIndicator;
