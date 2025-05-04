
import React from 'react';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="py-6 border-t border-slate-800">
      <div className="container mx-auto flex flex-col items-center">
        <Logo />
        <p className="text-slate-500 text-sm mt-2">Powered by Focus</p>
      </div>
    </footer>
  );
};

export default Footer;
