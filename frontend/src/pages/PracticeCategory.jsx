import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProblemsByCategory } from '../services/practiceService';
import { ArrowLeft, CheckCircle, Circle, PlayCircle } from 'lucide-react';

const PracticeCategory = () => {
    const { category } = useParams();
    const navigate = useNavigate();
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const res = await getProblemsByCategory(decodeURIComponent(category));
                setProblems(res.data.problems);
            } catch (err) {
                console.error("Failed to fetch problems", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, [category]);

    const getDifficultyColor = (diff) => {
        if (diff === 'Easy') return 'text-green-500 bg-green-500/10';
        if (diff === 'Medium') return 'text-orange-500 bg-orange-500/10';
        return 'text-red-500 bg-red-500/10';
    };

    if (loading) return <div className="min-h-screen bg-[#0B0F14] text-white p-8">Loading...</div>;

    const solvedCount = problems.filter(p => p.status === 'Solved').length;

    return (
        <div className="min-h-screen bg-[#0B0F14] text-[#E5E7EB] p-8">
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button 
                    onClick={() => navigate('/student-dashboard', { state: { activeTab: 'Practice' } })} 
                    className="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                <div className="bg-[#111827] rounded-2xl p-8 border border-white/5 shadow-xl">
                    <h1 className="text-3xl font-bold text-white mb-2">{decodeURIComponent(category)}</h1>
                    <div className="flex items-center gap-4 text-sm text-[#9CA3AF]">
                        <span>{problems.length} Problems</span>
                        <span>•</span>
                        <span className="text-blue-500">{solvedCount} Solved</span>
                    </div>
                </div>

                <div className="bg-[#111827] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-[#9CA3AF] text-sm uppercase tracking-wider">
                                <th className="p-4 pl-6 font-medium w-16 text-center">Status</th>
                                <th className="p-4 font-medium">Title</th>
                                <th className="p-4 font-medium w-32">Difficulty</th>
                                <th className="p-4 font-medium w-24">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {problems.map((problem, i) => (
                                <tr key={problem._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4 pl-6 text-center text-lg">
                                        {problem.status === 'Solved' ? (
                                            <CheckCircle className="inline text-green-500" size={20} />
                                        ) : problem.status === 'Attempted' ? (
                                            <PlayCircle className="inline text-orange-500" size={20} />
                                        ) : (
                                            <Circle className="inline text-slate-600" size={20} />
                                        )}
                                    </td>
                                    <td className="p-4 font-medium text-white group-hover:text-blue-400 transition-colors">
                                        {i + 1}. {problem.title}
                                    </td>
                                    <td className="p-4">
                                        <span className={"px-3 py-1 rounded-full text-xs font-bold " + getDifficultyColor(problem.difficulty)}>
                                            {problem.difficulty}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => navigate('/practice/problem/' + problem._id)}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
                                        >
                                            Solve
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PracticeCategory;
