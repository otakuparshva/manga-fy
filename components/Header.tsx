import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-cyan-500/20 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              <span className="text-cyan-400">Manga</span>-fy
            </h1>
            <span className="ml-3 bg-cyan-400/20 text-cyan-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">AI</span>
          </div>
          <p className="hidden md:block text-gray-400">AI Manga Panel Colorizer & Converter</p>
        </div>
      </div>
    </header>
  );
};
