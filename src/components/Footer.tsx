
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center text-sm">
          <div className="text-gray-500 text-xs">
            Powered by <a href="https://focus-in.netlify.app" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">Focus</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
