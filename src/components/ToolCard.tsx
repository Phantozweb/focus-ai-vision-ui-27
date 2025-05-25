
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Book, BookOpen, FileQuestion, Mic } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  icon: "chat" | "notes" | "quiz" | "academics" | "audio";
  iconBg: string;
  path: string;
}

const ToolCard = ({ title, description, icon, iconBg, path }: ToolCardProps) => {
  return (
    <div className="tool-card shadow-button">
      <div className="flex items-center gap-3 mb-4">
        <div className={`feature-icon ${iconBg}`}>
          {icon === "chat" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
          {icon === "notes" && (
            <FileText className="h-6 w-6" />
          )}
          {icon === "audio" && (
            <Mic className="h-6 w-6" />
          )}
          {icon === "quiz" && (
            <FileQuestion className="h-6 w-6" />
          )}
          {icon === "academics" && (
            <BookOpen className="h-6 w-6" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-black">{title}</h2>
      </div>
      <p className="text-gray-800 mb-6">{description}</p>
      <Link 
        to={path}
        className="block w-full text-center py-3 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium border border-sky-600 shadow-button transition-all duration-300"
      >
        Open {title}
      </Link>
    </div>
  );
};

export default ToolCard;
