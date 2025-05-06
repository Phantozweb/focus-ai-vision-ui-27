
import React from 'react';
import { Bot } from 'lucide-react';

const EmptyChatState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center">
      <div className="mb-6 text-blue-500">
        <Bot className="mx-auto h-12 w-12 text-blue-500/70" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Optometry Learning Assistant</h2>
      <p className="text-gray-600 max-w-md">How can I help with your studies today?</p>
    </div>
  );
};

export default EmptyChatState;
