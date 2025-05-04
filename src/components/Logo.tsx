
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2 text-sky-600 text-2xl font-bold">
      <img 
        src="/lovable-uploads/2f6458cf-833d-421d-b902-c93264f61485.png" 
        alt="Focus.AI Robot" 
        className="w-10 h-10 object-contain" 
      />
      <span>Focus.AI</span>
    </Link>
  );
};

export default Logo;
