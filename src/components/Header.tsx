
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import MobileMenu from './MobileMenu';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-slate-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Logo />
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setMenuOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>
        
        <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </header>
  );
};

export default Header;
