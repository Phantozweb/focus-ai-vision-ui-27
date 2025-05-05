
import React from 'react';
import { Bot } from 'lucide-react';

const EmptyChatState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center">
      <div className="mb-6 text-blue-500">
        <Bot className="mx-auto h-12 w-12 text-blue-500/70" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">How can I help with your optometry studies today?</h2>
      <p className="text-gray-600 max-w-md">Ask questions about any optometry topic to enhance your learning.</p>
    </div>
  );
};

export default EmptyChatState;
