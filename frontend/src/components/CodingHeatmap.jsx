import React, { useState } from 'react';
import { Flame, Trophy, Calendar } from 'lucide-react';

const CodingHeatmap = ({ activities = [], theme, isDarkMode, overrideStreak = null }) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Helper to generate the last 90 days
  const getHeatmapData = () => {
    const today = new Date();
    const result = [];
    const dateMap = new Map(activities.map(a => [a.date, a.problemsSolved]));

    for (let i = 89; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayStr = date.toISOString().split('T')[0];
        const count = dateMap.get(dayStr) || 0;
        result.push({ date: dayStr, count, dayOfWeek: date.getDay() });
    }
    return result;
  };

  const heatmapData = getHeatmapData();

  // Streak logic
  const calculateStreaks = () => {
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    // Need all historical data for max streak ideally, but we'll use ninety days for now
    // If the data was only for 90 days, we'd only see the streak within that window
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Sort activities by date just in case
    const sortedData = [...heatmapData].sort((a,b) => b.date.localeCompare(a.date));

    // Calculate current streak (backward from today)
    for (let i = 0; i < sortedData.length; i++) {
        if (sortedData[i].count > 0) {
            currentStreak++;
        } else if (sortedData[i].date < todayStr) {
            // If it's a past day and zero activity, current streak ends
            break;
        }
    }

    // Calculate max streak (forward)
    const forwardData = [...heatmapData].sort((a,b) => a.date.localeCompare(b.date));
    for (let i = 0; i < forwardData.length; i++) {
        if (forwardData[i].count > 0) {
            tempStreak++;
            maxStreak = Math.max(maxStreak, tempStreak);
        } else {
            tempStreak = 0;
        }
    }

    return { currentStreak, maxStreak };
  };

  const { currentStreak, maxStreak } = overrideStreak || calculateStreaks();

  const getColor = (count) => {
    if (count === 0) return 'bg-[#161b22]'; // GitHub base scale for darkest mode
    if (count <= 2) return 'bg-[#0e4429]';
    if (count <= 5) return 'bg-[#006d32]';
    if (count <= 8) return 'bg-[#26a641]';
    return 'bg-[#39d353]';
  };

  // Group into weeks for the grid
  const columns = [];
  let currentWeek = [];
  
  // To align weeks properly, we might need some padding for the first week
  const firstDayOfWeek = new Date(heatmapData[0].date).getDay();
  for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
  }

  heatmapData.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
          columns.push(currentWeek);
          currentWeek = [];
      }
  });
  if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      columns.push(currentWeek);
  }

  return (
    <div className={`${theme.card} rounded-2xl p-8 border ${theme.border} ${theme.shadow} transition-all duration-300`}>
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div className="flex gap-8">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                    <Flame size={24} />
                </div>
                <div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${theme.textMuted}`}>Current Streak</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{currentStreak} days</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                    <Trophy size={24} />
                </div>
                <div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${theme.textMuted}`}>Max Streak</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{maxStreak} days</p>
                </div>
            </div>
        </div>
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="text-center">
                <p className={`text-[10px] font-bold uppercase tracking-tighter ${theme.textMuted}`}>This Week</p>
                <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {heatmapData.slice(-7).reduce((a, b) => a + b.count, 0)} Solved
                </p>
            </div>
            <div className="h-8 w-[1px] bg-white/10"></div>
            <div className="text-center">
                <p className={`text-[10px] font-bold uppercase tracking-tighter ${theme.textMuted}`}>Active Days</p>
                <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {heatmapData.slice(-7).filter(d => d.count > 0).length} / 7
                </p>
            </div>
        </div>
      </div>

      {/* Grid Labels */}
      <div className="flex gap-1 mb-2">
          {['Mar', 'Apr', 'May'].map(m => ( // Static month labels for demo but we'll try to align them
            <span key={m} className={`text-[10px] font-bold text-[#9CA3AF] w-24 text-center`}>{m}</span>
          ))}
      </div>

      {/* Heatmap Grid */}
      <div className="flex gap-2 relative">
          {/* Day of week labels */}
          <div className="flex flex-col gap-[7px] pr-2 pt-1">
              {['Mon', '', 'Wed', '', 'Fri', '', ''].map((d, i) => (
                  <span key={i} className="text-[10px] text-[#9CA3AF] h-[10px] flex items-center">{d}</span>
              ))}
          </div>

          <div className="flex-1 flex gap-1.5 overflow-x-auto pb-4 custom-scrollbar">
            {columns.map((week, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-1.5 shrink-0">
                    {week.map((day, rowIndex) => (
                        <div 
                            key={rowIndex}
                            onMouseEnter={() => day && setHoveredDay(day)}
                            onMouseLeave={() => setHoveredDay(null)}
                            className={`w-3.5 h-3.5 rounded-[2px] ${day ? getColor(day.count) : 'bg-transparent'} transition-all duration-200 cursor-pointer hover:ring-2 hover:ring-blue-500/50 relative`}
                        >
                            {/* Simple inline tooltip on hover */}
                            {hoveredDay && hoveredDay.date === day?.date && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 bg-[#111827] border border-white/10 p-2 rounded-lg shadow-2xl whitespace-nowrap pointer-events-none">
                                    <p className="text-[10px] font-bold text-white">{day.date}</p>
                                    <p className="text-[10px] text-blue-400">{day.count} Problems Solved</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ))}
          </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4">
          <span className={`text-[10px] ${theme.textMuted}`}>Less</span>
          <div className="flex gap-1">
              <div className="w-3 h-3 rounded-[2px] bg-[#161b22]"></div>
              <div className="w-3 h-3 rounded-[2px] bg-[#0e4429]"></div>
              <div className="w-3 h-3 rounded-[2px] bg-[#006d32]"></div>
              <div className="w-3 h-3 rounded-[2px] bg-[#26a641]"></div>
              <div className="w-3 h-3 rounded-[2px] bg-[#39d353]"></div>
          </div>
          <span className={`text-[10px] ${theme.textMuted}`}>More</span>
      </div>
    </div>
  );
};

export default CodingHeatmap;
