import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../services/practiceService';
import { Folder, CheckCircle } from 'lucide-react';

const PracticeDashboard = ({ theme, isDarkMode }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data.categories);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <div className="p-8 text-center text-white">Loading practice data...</div>;

  const totalProblems = 100; // Expected 10 problems * 10 categories
  const totalSolved = categories.reduce((sum, c) => sum + c.solved, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Section */}
      <div className={`${theme.card} p-8 rounded-2xl border ${theme.border} ${theme.shadow}`}>
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>DSA Challenge 100</h2>
        <p className={`${theme.textMuted} mb-6`}>Master standard algorithmic patterns by solving 100 curated problems.</p>
        
        <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
                <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-blue-500">Overall Progress</span>
                    <span className="font-bold text-white">{totalSolved} / {totalProblems}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div className="bg-blue-500 h-3 rounded-full transition-all duration-1000" style={{ width: ((totalSolved/totalProblems)*100) + '%' }}></div>
                </div>
            </div>
        </div>
      </div>

      {/* Grid of Categories */}
      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Patterns & Topics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, index) => (
          <div 
            key={index} 
            onClick={() => navigate('/student/practice/' + encodeURIComponent(cat.name))}
            className={`${theme.card} p-6 rounded-2xl border ${theme.border} ${theme.shadow} hover:border-blue-500/50 hover:scale-[1.02] cursor-pointer transition-all duration-200 group`}
          >
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Folder size={24} />
                </div>
                {cat.total > 0 && cat.solved === cat.total && (
                    <span className="text-green-500"><CheckCircle size={24} /></span>
                )}
            </div>
            <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>{cat.name}</h4>
            
            <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                    <span className={`${theme.textMuted}`}>Progress</span>
                    <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{cat.solved} / {cat.total || 10}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: ((cat.solved / Math.max(cat.total, 1)) * 100) + '%' }}></div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PracticeDashboard;
