
import React from 'react';
import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';

interface LogoProps {
  asLink?: boolean;
}

const Logo = ({ asLink = true }: LogoProps) => {
  const logoContent = (
    <>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-md bg-blue-500 text-white shadow-sm">
        <Bot className="w-6 h-6" />
        <div className="absolute -right-1 -bottom-1 bg-blue-600 text-xs text-white rounded-sm px-1 font-bold">
          AI
        </div>
      </div>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">Focus.AI</span>
    </>
  );
  
  if (asLink) {
    return (
      <Link to="/" className="flex items-center gap-2 text-gray-800 text-2xl font-bold">
        {logoContent}
      </Link>
    );
  }
  
  return (
    <div className="flex items-center gap-2 text-gray-800 text-2xl font-bold">
      {logoContent}
    </div>
  );
};

export default Logo;
