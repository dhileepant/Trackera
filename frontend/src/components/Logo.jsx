import React from 'react';
import { Terminal, Code2 } from 'lucide-react';

const Logo = ({ className = "", isDarkMode = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
        <div className="relative w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all duration-300">
          <Code2 className="text-white w-6 h-6" strokeWidth={2.5} />
        </div>
      </div>
      <span className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        Track<span className="text-[#3B82F6]">era</span>
      </span>
    </div>
  );
};

export default Logo;
