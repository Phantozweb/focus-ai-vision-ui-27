
import React from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2 text-white text-2xl font-bold">
      <div className="relative flex items-center">
        <Eye className="w-8 h-8 text-blue-400" />
        <div className="absolute right-0 bottom-0 bg-blue-500 text-xs text-white rounded-sm px-1 font-bold">
          AI
        </div>
      </div>
      <span>Focus.AI</span>
    </Link>
  );
};

export default Logo;
