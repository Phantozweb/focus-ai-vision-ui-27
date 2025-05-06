
import React from 'react';
import Logo from './Logo';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 whitespace-nowrap">
            <Logo size="sm" />
            <p className="text-gray-500 text-sm mt-2">Your AI companion for optometry education</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <Link to="/assistant" className="text-gray-600 hover:text-sky-600 text-sm">AI Assistant</Link>
            <Link to="/notes" className="text-gray-600 hover:text-sky-600 text-sm">Study Notes</Link>
            <Link to="/quizzes" className="text-gray-600 hover:text-sky-600 text-sm">Practice Quizzes</Link>
            <Link to="/case-studies" className="text-gray-600 hover:text-sky-600 text-sm">Case Studies</Link>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-6 pt-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Focus.AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
