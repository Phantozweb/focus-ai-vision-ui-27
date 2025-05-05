
import React from 'react';
import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';

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
          container: 'h-7 w-7',
          icon: 'w-4 h-4',
          badge: 'text-[8px] -right-1 -bottom-1 px-0.5',
          text: 'text-lg'
        };
      case 'lg':
        return {
          container: 'h-12 w-12',
          icon: 'w-7 h-7',
          badge: 'text-sm -right-2 -bottom-2 px-1.5',
          text: 'text-3xl'
        };
      default:
        return {
          container: 'h-10 w-10',
          icon: 'w-6 h-6',
          badge: 'text-xs -right-1 -bottom-1 px-1',
          text: 'text-2xl'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  
  const getVariantClasses = () => {
    if (variant === 'export') {
      return {
        containerBg: 'bg-gradient-to-br from-blue-600 to-blue-400',
        badgeBg: 'bg-blue-700',
        textGradient: 'bg-gradient-to-r from-blue-700 to-blue-500',
        badge: 'font-bold'
      };
    }
    
    return {
      containerBg: 'bg-blue-500',
      badgeBg: 'bg-blue-600',
      textGradient: 'from-blue-600 to-blue-400',
      badge: ''
    };
  };
  
  const variantClasses = getVariantClasses();
  
  const logoContent = (
    <>
      <div className={`relative flex ${sizeClasses.container} items-center justify-center rounded-md ${variantClasses.containerBg} text-white shadow-sm`}>
        <Bot className={sizeClasses.icon} />
        <div className={`absolute ${sizeClasses.badge} ${variantClasses.badgeBg} text-white rounded-sm ${variantClasses.badge}`}>
          AI
        </div>
      </div>
      <span className={`bg-clip-text text-transparent bg-gradient-to-r ${variantClasses.textGradient} ${sizeClasses.text} font-bold`}>Focus.AI</span>
    </>
  );
  
  if (asLink) {
    return (
      <Link to="/" className={`flex items-center gap-2 text-gray-800 font-bold ${sizeClasses.text}`}>
        {logoContent}
      </Link>
    );
  }
  
  return (
    <div className={`flex items-center gap-2 text-gray-800 font-bold ${sizeClasses.text}`}>
      {logoContent}
    </div>
  );
};

export default Logo;
