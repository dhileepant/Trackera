import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  Calendar, 
  ChevronRight, 
  ShieldAlert, 
  Loader2 
} from 'lucide-react';
import resumeService from '../services/resumeService';

const ScoreGauge = ({ score }) => {
  let statusText = 'Needs Improvement';
  let colorClass = 'text-red-500 border-red-500/20 bg-red-500/5';
  let strokeColor = '#EF4444';
  
  if (score >= 90) {
    statusText = 'Excellent';
    colorClass = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    strokeColor = '#10B981';
  } else if (score >= 75) {
    statusText = 'Good';
    colorClass = 'text-blue-400 border-blue-500/20 bg-blue-500/5';
    strokeColor = '#3B82F6';
  } else if (score >= 60) {
    statusText = 'Average';
    colorClass = 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    strokeColor = '#F59E0B';
  }

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/40 rounded-2xl border border-white/5 shadow-inner">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tracking-tight text-white">{score}</span>
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">ATS Score</span>
        </div>
      </div>
      <div className={`mt-4 text-xs font-bold tracking-wide px-3 py-1 rounded-full border ${colorClass}`}>
        {statusText}
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="h-56 bg-slate-800/40 rounded-2xl border border-white/5"></div>
      <div className="lg:col-span-2 h-56 bg-slate-800/40 rounded-2xl border border-white/5"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-44 bg-slate-800/40 rounded-2xl border border-white/5"></div>
      <div className="h-44 bg-slate-800/40 rounded-2xl border border-white/5"></div>
    </div>
    <div className="h-40 bg-slate-800/40 rounded-2xl border border-white/5"></div>
  </div>
);

const ResumeAnalyzer = ({ theme, isDarkMode }) => {
  const [history, setHistory] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await resumeService.getHistory();
      setHistory(res.data.history || []);
    } catch (err) {
      console.error('Failed to fetch resume analysis history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    setError('');
    setSuccess('');
    
    if (!file) return false;

    // Check size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Max size allowed is 5 MB.');
      return false;
    }

    // Check extension and type
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (fileExt !== '.pdf' && file.type !== 'application/pdf') {
      setError('Invalid file type. Only PDF files (.pdf) are allowed.');
      return false;
    }

    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        uploadAndAnalyze(file);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        uploadAndAnalyze(file);
      }
    }
  };

  const uploadAndAnalyze = async (file) => {
    setLoading(true);
    setError('');
    setUploadProgress(0);
    
    try {
      const res = await resumeService.analyzeResume(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      
      setCurrentReport(res.data.analysis);
      setSuccess('Resume analyzed successfully!');
      fetchHistory(); // Refresh history listing
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSelectReport = async (id) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await resumeService.getAnalysisById(id);
      setCurrentReport(res.data.analysis);
    } catch (err) {
      setError('Failed to fetch analysis details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (e, id) => {
    e.stopPropagation(); // Prevent opening the report
    if (!window.confirm('Are you sure you want to delete this analysis report?')) return;
    
    setError('');
    setSuccess('');
    try {
      await resumeService.deleteAnalysis(id);
      setSuccess('Report deleted successfully.');
      if (currentReport && currentReport._id === id) {
        setCurrentReport(null);
      }
      fetchHistory();
    } catch (err) {
      setError('Failed to delete report.');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-blue-500" size={24} /> AI Resume Analyzer
          </h2>
          <p className={`${theme.textMuted} text-sm mt-1`}>
            Evaluate your resume against software engineering industry standards and ATS algorithms.
          </p>
        </div>
        {currentReport && (
          <button 
            onClick={() => {
              setCurrentReport(null);
              setError('');
              setSuccess('');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95 w-fit"
          >
            <Plus size={16} /> Analyze New Resume
          </button>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 flex items-center gap-3 animate-in fade-in duration-300">
          <AlertCircle size={20} className="shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 flex items-center gap-3 animate-in fade-in duration-300">
          <CheckCircle2 size={20} className="shrink-0" />
          <span className="text-sm font-medium">{success}</span>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main interactive area (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="space-y-6">
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className={`${theme.card} p-8 rounded-2xl border ${theme.border} text-center space-y-4`}>
                  <Loader2 className="animate-spin text-blue-500 mx-auto" size={36} />
                  <p className="font-semibold text-lg">Uploading Resume...</p>
                  <div className="w-full bg-slate-800 rounded-full h-3 max-w-md mx-auto overflow-hidden">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-slate-400">{uploadProgress}% uploaded</span>
                </div>
              )}
              {uploadProgress >= 100 || uploadProgress === 0 ? (
                <div className={`${theme.card} p-8 rounded-2xl border ${theme.border} text-center space-y-4`}>
                  <Loader2 className="animate-spin text-blue-500 mx-auto" size={36} />
                  <p className="font-semibold text-lg">Running Gemini AI Analysis...</p>
                  <p className="text-sm text-slate-400 max-w-sm mx-auto">
                    We are extracting text and evaluating skills, formatting, weaknesses, and placement readiness. This may take up to 10-15 seconds.
                  </p>
                </div>
              ) : null}
              <LoadingSkeleton />
            </div>
          ) : currentReport ? (
            /* Results Panel */
            <div className="space-y-6 animate-in fade-in duration-500">
              
              {/* ATS & Summary Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <ScoreGauge score={currentReport.atsScore} />
                </div>
                <div className="md:col-span-2 flex flex-col justify-between p-6 bg-slate-900/40 rounded-2xl border border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-1.5">
                      <FileText size={18} className="text-blue-400" /> Executive Summary
                    </h3>
                    <p className={`text-sm leading-relaxed ${theme.textMuted}`}>
                      {currentReport.summary}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap justify-between items-center gap-3">
                    <span className="text-xs text-slate-500 font-medium">File name: {currentReport.fileName}</span>
                    <span className="text-xs text-slate-400 bg-slate-800/80 border border-white/5 px-2.5 py-1 rounded-md font-semibold">
                      Readiness: {currentReport.placementReadiness}
                    </span>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5">
                  <h3 className="text-base font-bold text-emerald-400 mb-3 flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {currentReport.strengths && currentReport.strengths.map((str, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-500 mt-1 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                    {(!currentReport.strengths || currentReport.strengths.length === 0) && (
                      <span className="text-sm text-slate-500">No major strengths highlighted.</span>
                    )}
                  </ul>
                </div>

                <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5">
                  <h3 className="text-base font-bold text-red-400 mb-3 flex items-center gap-1.5">
                    <ShieldAlert size={16} /> Areas of Improvement
                  </h3>
                  <ul className="space-y-2">
                    {currentReport.weaknesses && currentReport.weaknesses.map((weak, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-red-500 mt-1 font-bold">•</span>
                        <span>{weak}</span>
                      </li>
                    ))}
                    {(!currentReport.weaknesses || currentReport.weaknesses.length === 0) && (
                      <span className="text-sm text-slate-500">No major weaknesses identified.</span>
                    )}
                  </ul>
                </div>
              </div>

              {/* Missing Skills Card */}
              <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5">
                <h3 className="text-base font-bold text-amber-400 mb-3 flex items-center gap-1.5">
                  <Sparkles size={16} /> Missing Key Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentReport.missingSkills && currentReport.missingSkills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs font-semibold px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                  {(!currentReport.missingSkills || currentReport.missingSkills.length === 0) && (
                    <span className="text-sm text-slate-500">No critical missing skills found. Great!</span>
                  )}
                </div>
              </div>

              {/* Actionable Improvement Steps */}
              <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5">
                <h3 className="text-base font-bold text-blue-400 mb-3">
                  Actionable Recommendations
                </h3>
                <ol className="space-y-3">
                  {currentReport.improvements && currentReport.improvements.map((imp, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xs shrink-0 font-bold">
                        {idx + 1}
                      </span>
                      <span className="mt-0.5">{imp}</span>
                    </li>
                  ))}
                  {(!currentReport.improvements || currentReport.improvements.length === 0) && (
                    <span className="text-sm text-slate-500">No feedback needed.</span>
                  )}
                </ol>
              </div>

            </div>
          ) : (
            /* Upload Resume Box */
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer h-[360px] text-center ${
                dragActive 
                  ? 'border-blue-500 bg-blue-500/5 scale-[1.01]' 
                  : 'border-white/10 hover:border-blue-500/50 hover:bg-white/5'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept=".pdf"
                onChange={handleFileChange}
              />
              <div className="p-4 bg-slate-800/50 border border-white/5 rounded-2xl text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud size={32} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Drag and drop your resume</h3>
              <p className="text-slate-400 text-sm max-w-xs mb-4">
                Support only PDF (.pdf) format files. Maximum file size allowed is 5 MB.
              </p>
              <button 
                type="button"
                className="px-5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                Browse File
              </button>
            </div>
          )}
        </div>

        {/* History column (Right 1 column) */}
        <div className="space-y-6">
          <div className={`${theme.card} p-6 rounded-2xl border ${theme.border} shadow-sm`}>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              Analysis History
            </h3>
            
            {historyLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-blue-500" size={24} />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border border-white/5 rounded-xl border-dashed">
                <FileText className="mx-auto mb-2 text-slate-600" size={28} />
                <p className="text-sm">No analyses run yet.</p>
                <p className="text-xs mt-1 opacity-70">Upload a PDF resume to get started.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                {history.map((report) => (
                  <div
                    key={report._id}
                    onClick={() => handleSelectReport(report._id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden ${
                      currentReport && currentReport._id === report._id
                        ? 'border-blue-500/40 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                        : 'border-white/5 bg-slate-900/20 hover:bg-slate-900/40 hover:border-white/10'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-bold text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                        {report.fileName}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(report.createdAt).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                        <span className={`font-semibold ${
                          report.atsScore >= 90 ? 'text-emerald-400' :
                          report.atsScore >= 75 ? 'text-blue-400' :
                          report.atsScore >= 60 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          Score: {report.atsScore}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleDeleteReport(e, report._id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 size={14} />
                      </button>
                      <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResumeAnalyzer;
