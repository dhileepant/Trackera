import React from 'react';
import { ExternalLink } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, bgColor, theme, isDarkMode }) => (
  <div className={`${theme.card} p-7 rounded-2xl border ${theme.border} ${theme.shadow} group hover:border-[#3B82F6]/50 hover:scale-[1.02] transition-all duration-300 ease-out`}>
    <div className="flex items-start justify-between">
      <div className={`p-4 rounded-xl ${bgColor} ${color} shadow-inner`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div className={`${theme.textMuted} group-hover:text-[#3B82F6] transition-colors duration-300`}>
        <ExternalLink size={18} />
      </div>
    </div>
    <div className="mt-6">
      <p className={`${theme.textMuted} text-xs font-bold uppercase tracking-widest`}>{title}</p>
      <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mt-2 tracking-tight`}>{value}</p>
    </div>
  </div>
);

export default StatCard;
