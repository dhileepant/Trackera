import React from 'react';
import { TrendingUp } from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const mockChartData = [
  { name: 'Mon', solved: 2 },
  { name: 'Tue', solved: 5 },
  { name: 'Wed', solved: 3 },
  { name: 'Thu', solved: 8 },
  { name: 'Fri', solved: 6 },
  { name: 'Sat', solved: 10 },
  { name: 'Sun', solved: 4 },
];

const CodingProgressChart = ({ theme, isDarkMode }) => {
  return (
    <div className={`${theme.card} rounded-2xl p-6 border ${theme.border} shadow-sm min-h-[400px] transition-colors duration-300`}>
      <div className="flex items-center justify-between mb-8">
        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
          <TrendingUp className="text-primary-600" size={20} /> Coding Progress
        </h3>
        <div className={`flex items-center gap-2 text-xs ${theme.textMuted}`}>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-600"></span> Problems Solved</span>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockChartData}>
            <defs>
              <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#e2e8f0"} vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', 
                border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`, 
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              itemStyle={{ color: '#2563eb' }}
            />
            <Area type="monotone" dataKey="solved" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSolved)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CodingProgressChart;
