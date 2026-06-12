import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { getProblemDetails, runCode, submitCode } from '../services/practiceService';
import { ArrowLeft, Play, Check, X, Loader2, Code2, AlertTriangle } from 'lucide-react';

const ProblemWorkspace = () => {
    const { problemId } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [testCases, setTestCases] = useState([]);
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Execution State
    const [executing, setExecuting] = useState(false);
    const [executionResult, setExecutionResult] = useState(null); // format: { type: 'run' | 'submit', passed: bool, output: string, status: string, runtime: number }

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const res = await getProblemDetails(problemId);
                setProblem(res.data.problem);
                setTestCases(res.data.testCases);
                if (res.data.problem.starterCode && res.data.problem.starterCode.javascript) {
                    setCode(res.data.problem.starterCode.javascript);
                }
            } catch (err) {
                console.error("Failed to fetch problem", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, [problemId]);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        if (problem.starterCode && problem.starterCode[newLang]) {
            setCode(problem.starterCode[newLang]);
        } else {
            setCode('// Write your code here');
        }
    };

    const handleRun = async () => {
        if (!testCases.length) return;
        setExecuting(true);
        setExecutionResult(null);
        try {
            // Run against the first test case for simplicity
            const activeTest = testCases[0];
            const res = await runCode({ code, language, input: activeTest.input, problemId });
            
            setExecutionResult({
                type: 'run',
                passed: res.data.allPassed,
                results: res.data.results
            });
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
            setExecutionResult({ type: 'error', status: 'Error', output: errorMsg });
        } finally {
            setExecuting(false);
        }
    };

    const handleSubmit = async () => {
        setExecuting(true);
        setExecutionResult(null);
        try {
            const res = await submitCode({ code, language, problemId });
            setExecutionResult({
                type: 'submit',
                passed: res.data.passed,
                status: res.data.status,
                runtime: res.data.runtime,
                results: res.data.results
            });
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
            setExecutionResult({ type: 'error', status: 'Error', output: errorMsg });
        } finally {
            setExecuting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0B0F14] text-white flex items-center justify-center">Loading Workspace...</div>;
    if (!problem) return <div className="min-h-screen bg-[#0B0F14] text-white p-8">Problem not found.</div>;

    return (
        <div className="flex h-screen bg-[#0B0F14] text-[#E5E7EB] overflow-hidden">
            {/* Left Pane - Problem Description */}
            <div className="w-1/2 flex flex-col border-r border-white/5 bg-[#0B0F14]">
                <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-[#111827]">
                    <button onClick={() => navigate('/student/practice/' + encodeURIComponent(problem.category))} className="text-[#9CA3AF] hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold font-mono tracking-tight text-white flex-1">{problem.title}</h1>
                    <span className={"px-3 py-1 rounded-md text-xs font-bold " + (
                        problem.difficulty === 'Easy' ? 'text-green-500 bg-green-500/10' : 
                        problem.difficulty === 'Medium' ? 'text-orange-500 bg-orange-500/10' : 'text-red-500 bg-red-500/10'
                    )}>
                        {problem.difficulty}
                    </span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar problem-description text-sm leading-relaxed text-[#9ca3af]">
                    <h2 className="text-white text-lg font-bold mb-4">Description</h2>
                    <div dangerouslySetInnerHTML={{ __html: problem.description }} className="mb-8 prose prose-invert max-w-none" />
                    
                    {problem.examples && problem.examples.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-white font-bold text-base">Examples</h3>
                            {problem.examples.map((ex, i) => (
                                <div key={i} className="bg-[#111827] border border-white/5 rounded-xl p-4 space-y-2">
                                    <p><strong className="text-white font-semibold">Input:</strong> <code className="text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">{ex.input}</code></p>
                                    <p><strong className="text-white font-semibold">Output:</strong> <code className="text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">{ex.output}</code></p>
                                    {ex.explanation && <p className="text-[#64748B]"><strong className="text-[#9ca3af]">Explanation:</strong> {ex.explanation}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {problem.constraints && problem.constraints.length > 0 && (
                         <div className="mt-8">
                             <h3 className="text-white font-bold text-base mb-4">Constraints</h3>
                             <ul className="list-disc pl-5 space-y-1">
                                 {problem.constraints.map((c, i) => (
                                     <li key={i}><code className="text-amber-400/90 bg-amber-400/10 px-1.5 py-0.5 rounded text-xs">{c}</code></li>
                                 ))}
                             </ul>
                         </div>
                    )}
                </div>
            </div>

            {/* Right Pane - Editor & Console */}
            <div className="w-1/2 flex flex-col bg-[#111827]">
                
                {/* Editor Header */}
                <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#0B0F14]">
                    <div className="flex items-center gap-2 text-sm">
                        <Code2 size={16} className="text-blue-500" />
                        <select 
                            value={language}
                            onChange={handleLanguageChange}
                            className="bg-transparent text-white border-none outline-none focus:ring-0 cursor-pointer p-1"
                        >
                            <option value="javascript" className="bg-slate-800">JavaScript (Node.js)</option>
                            <option value="python3" className="bg-slate-800">Python 3</option>
                            <option value="cpp" className="bg-slate-800">C++</option>
                            <option value="java" className="bg-slate-800">Java</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleRun}
                            disabled={executing}
                            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {executing ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} 
                            Run
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={executing}
                            className="px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium text-sm transition-all shadow-lg hover:shadow-green-500/20 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                        >
                            Submit
                        </button>
                    </div>
                </div>

                {/* Monaco Editor */}
                <div className="flex-1 pt-2">
                    <Editor
                        height="100%"
                        language={language === 'python3' ? 'python' : language}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value)}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            padding: { top: 16 },
                            scrollBeyondLastLine: false,
                            smoothScrolling: true,
                            cursorBlinking: "smooth",
                            fontFamily: "JetBrains Mono, Fira Code, monospace"
                        }}
                    />
                </div>

                {/* Test Results Console */}
                <div className="h-64 border-t border-white/5 bg-[#0B0F14] flex flex-col">
                    <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2 text-sm font-semibold tracking-wide text-[#9CA3AF]">
                        <Terminal size={14} /> Test Results
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed">
                        {!executionResult && !executing && (
                            <div className="text-slate-500 h-full flex items-center justify-center">
                                Run code to see test results.
                            </div>
                        )}
                        {executing && (
                            <div className="text-blue-400 h-full flex items-center justify-center gap-3">
                                <Loader2 className="animate-spin" /> Executing code...
                            </div>
                        )}
                        {executionResult && !executing && (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="flex items-center gap-2 text-lg font-bold">
                                    {executionResult.passed ? (
                                        <><Check className="text-green-500" /> <span className="text-green-500">Accepted</span></>
                                    ) : (
                                        <><X className="text-red-500" /> <span className="text-red-500">{executionResult.status}</span></>
                                    )}
                                </div>
                                
                                {executionResult.results && executionResult.results.length > 0 ? (
                                    <div className="space-y-4 mt-4 text-sm">
                                        {executionResult.results.map((r, i) => (
                                            <div key={i} className={`p-4 rounded border ${r.passed ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                                                <div className="flex items-center gap-2 font-bold mb-3">
                                                    {r.passed ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}
                                                    <span className={r.passed ? "text-green-500" : "text-red-500"}>Testcase {r.testCaseIndex}: {r.passed ? 'Passed' : 'Failed'}</span>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <div className="p-3 rounded bg-[#0B0F14] border border-white/5">
                                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Input</span>
                                                        <span className="text-white whitespace-pre-wrap">{r.input}</span>
                                                    </div>
                                                    <div className="p-3 rounded bg-[#0B0F14] border border-white/5">
                                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Output</span>
                                                        <span className={r.passed ? 'text-white whitespace-pre-wrap' : 'text-red-400 whitespace-pre-wrap'}>{r.output}</span>
                                                    </div>
                                                    {!r.passed && (
                                                        <div className="p-3 rounded bg-[#0B0F14] border border-white/5">
                                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Expected</span>
                                                            <span className="text-green-400 whitespace-pre-wrap">{r.expected}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    executionResult.output && (
                                        <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/5 text-red-400 mt-4 text-sm leading-relaxed whitespace-pre-wrap">
                                            <div className="font-bold flex items-center gap-2 mb-1">
                                                <AlertTriangle size={16} className="text-red-500" /> Details:
                                            </div>
                                            {executionResult.output}
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
};

// Quick helper
const Terminal = ({ size }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>;

export default ProblemWorkspace;
