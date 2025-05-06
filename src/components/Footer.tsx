
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex gap-4 md:gap-8">
            <Link to="/assistant" className="text-gray-600 hover:text-sky-600">AI Assistant</Link>
            <Link to="/notes" className="text-gray-600 hover:text-sky-600">Study Notes</Link>
            <Link to="/quizzes" className="text-gray-600 hover:text-sky-600">Practice Quizzes</Link>
            <Link to="/case-studies" className="text-gray-600 hover:text-sky-600">Case Studies</Link>
          </div>
          
          <div className="text-gray-500 text-xs mt-2 md:mt-0">
            Powered by <a href="https://focus-in.netlify.app" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Focus.AI</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
