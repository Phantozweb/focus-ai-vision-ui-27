
import React from 'react';
import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2 text-gray-800 text-2xl font-bold">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-md bg-blue-500 text-white shadow-sm">
        <Bot className="w-6 h-6" />
        <div className="absolute -right-1 -bottom-1 bg-blue-600 text-xs text-white rounded-sm px-1 font-bold">
          AI
        </div>
      </div>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">Focus.AI</span>
    </Link>
  );
};

export default Logo;
