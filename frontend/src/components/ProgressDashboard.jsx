import React, { useState, useEffect } from 'react';
import { getProgressAnalytics } from '../services/progressService';
import CodingHeatmap from './CodingHeatmap';
import { Target, Activity, Code2, BrainCircuit, Github as GithubIcon, Trophy, BarChart3, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';

const COLORS = ['#10B981', '#F59E0B', '#EF4444']; // Easy, Medium, Hard

const ProgressDashboard = ({ activities, theme, isDarkMode }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await getProgressAnalytics();
                setAnalytics(res.data);
            } catch (err) {
                console.error("Failed to load analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-white"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div></div>;
    }

    if (!analytics) return null;

    const { streak, weeklyStats, monthlyStats, difficultyStats, topicStats, platformStats, performanceData, insights } = analytics;

    // Format difficulty for pie chart
    const pieData = Object.entries(difficultyStats)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({ name, value }));

    const dailyGoal = 5;
    const todaySolved = performanceData.length > 0 ? performanceData[performanceData.length - 1].solved : 0;
    const goalPercentage = Math.min((todaySolved / dailyGoal) * 100, 100);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            
            {/* Header / Smart Insights Section */}
            <div className={`p-6 rounded-2xl border ${theme.border} bg-gradient-to-br from-blue-900/20 to-indigo-900/20 shadow-lg relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <BrainCircuit size={120} />
                </div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4 flex items-center gap-2`}>
                    <BrainCircuit className="text-blue-400" /> AI Insights
                </h3>
                <div className="space-y-3">
                    {insights.length > 0 ? insights.map((insight, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                            <p className="text-blue-100 font-medium">{insight}</p>
                        </div>
                    )) : (
                        <p className="text-slate-400">Keep solving problems to generate insights!</p>
                    )}
                </div>
            </div>

            {/* Top Grid: Goals, Weekly, Monthly */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`${theme.card} p-6 rounded-2xl border ${theme.border} hover:-translate-y-1 transition-transform`}>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className={`${theme.textMuted} font-semibold uppercase tracking-wider text-xs`}>Daily Goal</h4>
                        <Target className="text-blue-500" size={20} />
                    </div>
                    <div className="flex items-end gap-2 mb-3">
                        <span className="text-3xl font-bold text-white">{todaySolved}</span>
                        <span className="text-slate-400 mb-1">/ {dailyGoal}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${goalPercentage}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">{todaySolved >= dailyGoal ? 'Goal reached! 🎉' : `${dailyGoal - todaySolved} more to go!`}</p>
                </div>

                <div className={`${theme.card} p-6 rounded-2xl border ${theme.border} hover:-translate-y-1 transition-transform`}>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className={`${theme.textMuted} font-semibold uppercase tracking-wider text-xs`}>This Week</h4>
                        <Activity className="text-green-500" size={20} />
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <span className="text-3xl font-bold text-white block">{weeklyStats.solved}</span>
                            <span className="text-xs text-slate-400">Problems Solved</span>
                        </div>
                        <div className="text-right">
                            <span className="text-xl font-bold text-white block">{weeklyStats.activeDays}/7</span>
                            <span className="text-xs text-slate-400">Active Days</span>
                        </div>
                    </div>
                </div>

                <div className={`${theme.card} p-6 rounded-2xl border ${theme.border} hover:-translate-y-1 transition-transform`}>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className={`${theme.textMuted} font-semibold uppercase tracking-wider text-xs`}>This Month</h4>
                        <TrendingUp className="text-purple-500" size={20} />
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <span className="text-3xl font-bold text-white block">{monthlyStats.solved}</span>
                            <span className="text-xs text-slate-400">Total Solved</span>
                        </div>
                        <div className="text-right">
                            <span className="text-xl font-bold text-white block">{monthlyStats.avgPerDay}</span>
                            <span className="text-xs text-slate-400">Avg / Day</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Heatmap & Streaks */}
            <CodingHeatmap activities={activities} theme={theme} isDarkMode={isDarkMode} overrideStreak={streak} />

            {/* Middle Grid: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Performance Graph */}
                <div className={`${theme.card} p-6 rounded-2xl border ${theme.border}`}>
                    <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-6`}>Performance (Last 14 Days)</h4>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#3B82F6' }}
                                />
                                <Line type="monotone" dataKey="solved" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#0B0F14' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Difficulty & Topics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Difficulty */}
                    <div className={`${theme.card} p-6 rounded-2xl border ${theme.border} flex flex-col items-center justify-center`}>
                        <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2 self-start w-full`}>Difficulty Distribution</h4>
                        {pieData.length > 0 ? (
                            <div className="relative w-full h-40 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={45}
                                            outerRadius={65}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={
                                                    entry.name === 'Easy' ? '#10B981' : 
                                                    entry.name === 'Medium' ? '#F59E0B' : '#EF4444'
                                                } />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                    <span className="text-2xl font-bold text-white">{pieData.reduce((a, b) => a + b.value, 0)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-40 flex items-center justify-center text-slate-500">No data yet</div>
                        )}
                        <div className="w-full flex justify-between mt-4 text-xs font-semibold">
                            <span className="text-emerald-500">Eas: {difficultyStats.Easy || 0}</span>
                            <span className="text-amber-500">Med: {difficultyStats.Medium || 0}</span>
                            <span className="text-red-500">Hrd: {difficultyStats.Hard || 0}</span>
                        </div>
                    </div>

                    {/* Topics */}
                    <div className={`${theme.card} p-6 rounded-2xl border ${theme.border} flex flex-col`}>
                        <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4`}>Strongest Topics</h4>
                        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                            {Object.entries(topicStats).length > 0 ? Object.entries(topicStats).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([topic, count]) => (
                                <div key={topic}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-300 truncate pr-2">{topic}</span>
                                        <span className="font-bold text-blue-400">{count}</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                                        {/* Since we don't know the exact "total" per topic easily here, we scale by the max solved topic */}
                                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(count / Math.max(...Object.values(topicStats))) * 100}%` }}></div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-slate-500 text-sm text-center mt-8">No topics solved yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Analytics */}
            <div className={`${theme.card} rounded-2xl p-6 border ${theme.border} shadow-sm`}>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-6`}>Platform Analysis</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* LeetCode */}
                    <div className="p-4 rounded-xl bg-[#1e293b] border border-white/5 relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Code2 size={100} />
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <Code2 className="text-orange-500" />
                            <h4 className="font-bold text-white">LeetCode</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-400">Total Solved</span><span className="font-bold text-white">{platformStats.leetcode?.totalSolved || 0}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Contest Rating</span><span className="font-bold text-orange-400">{platformStats.leetcode?.contestRating || 0}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Platform Streak</span><span className="font-bold text-white">{platformStats.leetcode?.streak || 0} 🔥</span></div>
                        </div>
                    </div>

                    {/* Codeforces */}
                    <div className="p-4 rounded-xl bg-[#1e293b] border border-white/5 relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <BarChart3 size={100} />
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="text-indigo-500" />
                            <h4 className="font-bold text-white">Codeforces</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-400">Rating</span><span className="font-bold text-indigo-400">{platformStats.codeforces?.rating || 0}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Rank</span><span className="font-bold capitalize text-white">{platformStats.codeforces?.rank || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Contests</span><span className="font-bold text-white">{platformStats.codeforces?.contests || 0}</span></div>
                        </div>
                    </div>

                    {/* GitHub */}
                    <div className="p-4 rounded-xl bg-[#1e293b] border border-white/5 relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <GithubIcon size={100} />
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <GithubIcon className="text-slate-300" />
                            <h4 className="font-bold text-white">GitHub</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-400">Contributions</span><span className="font-bold text-emerald-400">{platformStats.github?.contributions || 0}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Public Repos</span><span className="font-bold text-white">{platformStats.github?.publicRepos || 0}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Top Language</span><span className="font-bold text-white">{platformStats.github?.language || 'N/A'}</span></div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ProgressDashboard;
