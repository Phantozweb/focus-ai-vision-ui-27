
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const MobileMenu = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-darkBg z-50 flex flex-col animate-fade-in">
      <div className="flex justify-between items-center p-4 border-b border-slate-800">
        <Link to="/" className="flex items-center gap-2 text-white text-2xl font-bold">
          <svg className="w-8 h-8 text-focusBlue" viewBox="0 0 36 36" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 3C9.7125 3 3 9.7125 3 18C3 26.2875 9.7125 33 18 33C26.2875 33 33 26.2875 33 18C33 9.7125 26.2875 3 18 3ZM18 30C11.3625 30 6 24.6375 6 18C6 11.3625 11.3625 6 18 6C24.6375 6 30 11.3625 30 18C30 24.6375 24.6375 30 18 30Z" />
            <path d="M19.5 10.5C19.5 11.3284 18.8284 12 18 12C17.1716 12 16.5 11.3284 16.5 10.5C16.5 9.67157 17.1716 9 18 9C18.8284 9 19.5 9.67157 19.5 10.5Z" />
            <path d="M18 15C16.3425 15 15 16.3425 15 18C15 19.6575 16.3425 21 18 21C19.6575 21 21 19.6575 21 18C21 16.3425 19.6575 15 18 15ZM18 18C18 18.8175 17.3175 19.5 16.5 19.5C15.6825 19.5 15 18.8175 15 18C15 17.1825 15.6825 16.5 16.5 16.5C17.3175 16.5 18 17.1825 18 18Z" />
            <path d="M18 24C19.6575 24 21 25.3425 21 27C21 28.6575 19.6575 30 18 30C16.3425 30 15 28.6575 15 27C15 25.3425 16.3425 24 18 24Z" />
          </svg>
          <span>Focus.AI</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex flex-col p-6 space-y-6">
        <NavItem icon="home" href="/" label="Dashboard" />
        <NavItem icon="message-circle" href="/assistant" label="AI Assistant" />
        <NavItem icon="flask" href="/case-studies" label="Case Studies" />
        <NavItem icon="file-text" href="/notes" label="Notes" />
        <NavItem icon="book" href="/quizzes" label="Practice Quizzes" />
        <NavItem icon="graduation-cap" href="/academics" label="Academics" />
        <div className="border-t border-slate-800 my-4"></div>
        <NavItem icon="user" href="/account" label="Account" />
      </div>
    </div>
  );
};

const NavItem = ({ icon, href, label }: { icon: string; href: string; label: string }) => {
  return (
    <Link to={href} className="flex items-center gap-3 text-blue-400 hover:text-blue-300 py-2">
      <div className={`w-6 h-6 flex items-center justify-center`}>
        {icon === "home" && <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
        {icon === "message-circle" && <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
        {icon === "file-text" && <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        {icon === "flask" && <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
        {icon === "book" && <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
        {icon === "graduation-cap" && <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>}
        {icon === "user" && <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
      </div>
      <span className="text-lg">{label}</span>
    </Link>
  );
};

export default MobileMenu;
