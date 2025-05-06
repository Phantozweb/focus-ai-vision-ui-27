
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import MobileMenu from './MobileMenu';
import { Link } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Menu } from 'lucide-react';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-slate-200 bg-white shadow-nav">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Logo />
        
        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-1">
            <NavigationMenuItem>
              <Link to="/" className="text-gray-800 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
                Home
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/assistant" className="text-gray-800 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
                AI Assistant
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/case-studies" className="text-gray-800 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
                Case Studies
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/notes" className="text-gray-800 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
                Notes
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/quizzes" className="text-gray-800 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
                Practice Quizzes
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-gray-800 hover:bg-gray-100"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </header>
  );
};

export default Header;
