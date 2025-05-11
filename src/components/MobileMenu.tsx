
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, Home, MessageCircle, FileText, BookText, FlaskConical, Settings, Clock } from 'lucide-react';
import Logo from './Logo';

const MobileMenu = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <Logo size="md" />
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-800">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex flex-col p-6 space-y-6">
        <NavItem icon={<Home className="w-5 h-5" />} href="/" label="Home" />
        <NavItem icon={<MessageCircle className="w-5 h-5" />} href="/assistant" label="AI Assistant" />
        <NavItem icon={<FlaskConical className="w-5 h-5" />} href="/case-studies" label="Case Studies" />
        <NavItem icon={<FileText className="w-5 h-5" />} href="/notes" label="Notes" />
        <NavItem icon={<BookText className="w-5 h-5" />} href="/quizzes" label="Practice Quizzes" />
        <NavItem icon={<Clock className="w-5 h-5" />} href="/updates" label="Updates" />
        <NavItem icon={<Settings className="w-5 h-5" />} href="/support" label="Support" />
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
