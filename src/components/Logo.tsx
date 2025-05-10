
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  asLink?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'export';
}

const Logo = ({ asLink = true, size = 'md', variant = 'default' }: LogoProps) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'h-7',
          text: 'text-lg'
        };
      case 'lg':
        return {
          container: 'h-12',
          text: 'text-3xl'
        };
      default:
        return {
          container: 'h-10',
          text: 'text-2xl'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  
  const logoContent = (
    <div className="flex items-center gap-2">
      <img 
        src="/lovable-uploads/3cb83ec4-c9f0-46b3-93da-c315227199cb.png" 
        alt="Focus AI Optometry Logo" 
        className={`${sizeClasses.container} w-auto`}
      />
      <span className={`bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-400 ${sizeClasses.text} font-bold whitespace-nowrap`}>Focus.AI</span>
    </div>
  );
  
  if (asLink) {
    return (
      <Link to="/" className="flex items-center text-gray-800 font-bold whitespace-nowrap">
        {logoContent}
      </Link>
    );
  }
  
  return logoContent;
};

export default Logo;
