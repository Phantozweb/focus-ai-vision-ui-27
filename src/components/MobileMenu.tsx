
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, Home, MessageCircle, FileText, BookText, User, FlaskConical, Bot } from 'lucide-react';

const MobileMenu = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <Link to="/" className="flex items-center gap-2 text-gray-800 text-2xl font-bold">
          <div className="relative flex items-center">
            <Bot className="w-8 h-8 text-blue-400" />
            <div className="absolute right-0 bottom-0 bg-blue-500 text-xs text-white rounded-sm px-1 font-bold">
              AI
            </div>
          </div>
          <span>Focus.AI</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-800">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex flex-col p-6 space-y-6">
        <NavItem icon={<Home className="w-5 h-5" />} href="/" label="Dashboard" />
        <NavItem icon={<MessageCircle className="w-5 h-5" />} href="/assistant" label="AI Assistant" />
        <NavItem icon={<FlaskConical className="w-5 h-5" />} href="/case-studies" label="Case Studies" />
        <NavItem icon={<FileText className="w-5 h-5" />} href="/notes" label="Notes" />
        <NavItem icon={<BookText className="w-5 h-5" />} href="/quizzes" label="Practice Quizzes" />
        <div className="border-t border-gray-200 my-4"></div>
        <NavItem icon={<User className="w-5 h-5" />} href="/account" label="Account" />
      </div>
    </div>
  );
};

const NavItem = ({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) => {
  return (
    <Link to={href} className="flex items-center gap-3 text-gray-800 hover:text-blue-500 py-2">
      <div className="w-6 h-6 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-lg">{label}</span>
    </Link>
  );
};

export default MobileMenu;
