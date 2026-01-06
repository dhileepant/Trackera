import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const ExpandableStatCard = ({ title, value, icon: Icon, color, bgColor, theme, isDarkMode, stats, profileUrl }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`${theme.card} rounded-2xl border ${theme.border} ${theme.shadow} transition-all duration-300 ease-out overflow-hidden hover:border-[#3B82F6]/50 hover:scale-[1.02] group`}
    >
      <div className="p-7">
        <div className="flex items-start justify-between">
          <div className={`p-4 rounded-xl ${bgColor} ${color} shadow-inner`}>
            <Icon size={24} strokeWidth={2.5} />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (profileUrl) window.open(profileUrl, "_blank");
              }}
              title={profileUrl ? "Open Profile" : "Not Connected"}
              disabled={!profileUrl}
              className={`${theme.textMuted} transition-colors duration-300 p-1.5 rounded-lg ${profileUrl ? 'cursor-pointer hover:text-[#3B82F6] hover:bg-white/5' : 'cursor-not-allowed opacity-40'}`}
            >
              <ExternalLink size={18} />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title="Expand Stats"
              className={`${theme.textMuted} cursor-pointer hover:text-[#E5E7EB] transition-colors duration-300 p-1.5 rounded-lg hover:bg-white/5`}
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>
        <div className="mt-6">
          <p className={`${theme.textMuted} text-xs font-bold uppercase tracking-widest`}>{title}</p>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mt-2 tracking-tight`}>{value}</p>
        </div>
      </div>

      <div 
        className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} bg-white/5 border-t ${theme.border}`}
      >
        <div className="p-7 grid grid-cols-2 gap-5">
          {Object.entries(stats).map(([label, val]) => (
            <div key={label} className="space-y-1">
              <p className={`${theme.textMuted} text-[10px] uppercase font-black tracking-[0.1em]`}>{label.replace(/([A-Z])/g, ' $1').trim()}</p>
              <p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpandableStatCard;
