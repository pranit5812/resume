import React, { useState, useEffect } from 'react';
import { UploadCloud, File, CheckCircle, AlertCircle, History, Sparkles, TrendingUp, Calendar, BarChart2, ArrowRight } from 'lucide-react';
import api from '../services/api';

const ResumeUpload = () => {
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'history'
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // History state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Please upload a valid PDF file.');
    }
  };

  const handleAnalyze = async () => {
    if (!file || !jobDescription) {
      setError('Please provide both a resume and a job description.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Upload Resume
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const resumeId = uploadRes.data.resume_id;
      
      // 2. Analyze ATS Score
      const analyzeRes = await api.post('/ats/analyze', {
        resume_id: resumeId,
        job_description: jobDescription
      });
      
      setResult(analyzeRes.data.analysis);
      fetchHistory(); // Refresh history
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/ats/history');
      setHistory(res.data.history || []);
    } catch (err) {
      console.error("Failed to fetch ATS history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const renderResult = (data) => {
    if (!data) return null;
    return (
      <div className="space-y-8 animate-fade-in-up">
        {/* Score Circle & Strength Badge */}
        <div className="flex flex-col items-center justify-center py-6 bg-white/5 rounded-2xl border border-white/10 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
              data.score >= 80 ? 'bg-green-500/10 text-green-400 border-green-500/30' :
              data.score >= 60 ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
              data.score >= 40 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
              'bg-red-500/10 text-red-400 border-red-500/30'
            }`}>
              Strength: {data.insights?.strength || (data.score >= 80 ? 'Excellent' : data.score >= 50 ? 'Good' : 'Weak')}
            </span>
          </div>

          <div className="relative w-44 h-44 flex items-center justify-center rounded-full bg-white/5 border-[8px] border-white/10 my-2">
            <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="46%" fill="transparent" stroke="#1e293b" strokeWidth="8%" />
              <circle 
                cx="50%" cy="50%" r="46%" fill="transparent" 
                stroke={data.score >= 80 ? '#10b981' : data.score >= 50 ? '#3b82f6' : '#ef4444'} 
                strokeWidth="8%" 
                strokeDasharray="289" 
                strokeDashoffset={289 - (289 * data.score) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="text-center z-10">
              <span className="text-5xl font-extrabold text-white">{Math.round(data.score)}</span>
              <span className="text-xl text-[#ffffff]/60">%</span>
              <p className="text-xs text-[#ffffff]/60 mt-1 uppercase font-semibold">Match Score</p>
            </div>
          </div>
          
          <div className="text-center mt-4 max-w-md">
            <p className="text-sm text-[#ffffff]/50 italic">
              "{data.insights?.improvement_suggestions || 'Review your matched and missing keywords below to optimize your resume.'}"
            </p>
          </div>
        </div>

        {/* Breakdown scores if available */}
        {(data.semantic_score !== undefined && data.tfidf_score !== undefined) && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center">
              <span className="text-xs font-semibold text-[#ffffff]/50 uppercase">Semantic Match (60%)</span>
              <span className="text-2xl font-bold text-[#ffffff] mt-1">{Math.round(data.semantic_score)}%</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col items-center">
              <span className="text-xs font-semibold text-[#ffffff]/50 uppercase">Keyword Match (40%)</span>
              <span className="text-2xl font-bold text-[#ffffff] mt-1">{Math.round(data.tfidf_score)}%</span>
            </div>
          </div>
        )}

        {/* Keyword Optimization Insights */}
        {data.insights?.keyword_optimization && (
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-start gap-4">
            <div className="bg-white/10 p-2.5 rounded-xl text-[#ffffff] border border-white/15">
              <Sparkles className="w-6 h-6 flex-shrink-0" />
            </div>
            <div>
              <h3 className="font-semibold text-[#ffffff] mb-1">AI Keyword Optimization Tip</h3>
              <p className="text-sm text-[#ffffff]/60 leading-relaxed">{data.insights.keyword_optimization}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matched Keywords */}
          <div className="bg-white/5 p-5 rounded-xl border border-green-500/20 flex flex-col">
            <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Matched Keywords ({data.matched_keywords?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2 mt-auto">
              {(data.matched_keywords && data.matched_keywords.length > 0) ? data.matched_keywords.map((kw, i) => (
                <span key={i} className="px-2.5 py-1 bg-green-500/15 text-green-300 text-xs rounded-lg border border-green-500/20 font-medium">
                  {kw}
                </span>
              )) : <span className="text-sm text-[#ffffff]/30 italic">None found</span>}
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="bg-white/5 p-5 rounded-xl border border-red-500/20 flex flex-col">
            <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Missing Keywords ({data.missing_keywords?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2 mt-auto">
              {(data.missing_keywords && data.missing_keywords.length > 0) ? data.missing_keywords.map((kw, i) => (
                <span key={i} className="px-2.5 py-1 bg-red-500/15 text-red-300 text-xs rounded-lg border border-red-500/20 font-medium">
                  {kw}
                </span>
              )) : <span className="text-sm text-[#ffffff]/30 italic">None found</span>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-[#ffffff]">
            ATS Resume Analyzer <span className="text-xs bg-white/10 border border-white/15 text-[#ffffff]/70 px-3 py-1 rounded-full font-semibold uppercase tracking-wider">AI Powered</span>
          </h1>
          <p className="text-[#ffffff]/50 mt-1">Check your ATS compatibility and get keyword optimization insights.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
          <button 
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'scan' ? 'bg-white/20 text-[#ffffff]' : 'text-[#ffffff]/50 hover:text-[#ffffff]'
            }`}
            onClick={() => { setActiveTab('scan'); setSelectedHistoryItem(null); }}
          >
            <BarChart2 className="w-4 h-4" /> New ATS Scan
          </button>
          <button 
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'history' ? 'bg-white/20 text-[#ffffff]' : 'text-[#ffffff]/50 hover:text-[#ffffff]'
            }`}
            onClick={() => setActiveTab('history')}
          >
            <History className="w-4 h-4" /> Report History
          </button>
        </div>
      </div>
      
      {/* Tab Content: Scan */}
      {activeTab === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Inputs */}
          <div className="space-y-6">
            <div className="glass-panel p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#ffffff]">
                <span className="w-6 h-6 rounded-full bg-white/15 text-[#ffffff] text-sm flex items-center justify-center font-bold">1</span> 
                Upload Resume (PDF)
              </h2>
              <div className="border-2 border-dashed border-white/15 rounded-xl p-8 text-center hover:border-white/30 transition-colors bg-white/5 group">
                <input 
                  type="file" 
                  id="resume-upload" 
                  className="hidden" 
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                  {file ? (
                    <>
                      <div className="p-4 rounded-full bg-white/10 border border-white/15 mb-4 group-hover:scale-105 transition-transform">
                        <File className="w-10 h-10 text-[#ffffff]" />
                      </div>
                      <span className="text-lg font-medium text-[#ffffff]">{file.name}</span>
                      <span className="text-xs text-[#ffffff]/50 mt-2 font-semibold tracking-wider uppercase">Click to replace</span>
                    </>
                  ) : (
                    <>
                      <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-4 group-hover:border-white/25 transition-all">
                        <UploadCloud className="w-10 h-10 text-[#ffffff]/40 group-hover:text-[#ffffff]/70 transition-colors" />
                      </div>
                      <span className="text-lg font-medium text-[#ffffff]">Drag &amp; drop or click to upload</span>
                      <span className="text-xs text-[#ffffff]/40 mt-2">PDF documents only (Max 5MB)</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="glass-panel p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#ffffff]">
                <span className="w-6 h-6 rounded-full bg-white/15 text-[#ffffff] text-sm flex items-center justify-center font-bold">2</span> 
                Paste Target Job Description
              </h2>
              <textarea 
                className="input-field min-h-[220px] resize-none text-sm leading-relaxed"
                placeholder="Paste the job requirements or description here to test compatibility..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              ></textarea>
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg shadow-red-500/5 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" /> <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <button 
              className="btn-primary w-full py-4 text-lg font-bold flex justify-center items-center gap-3 group"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Running AI ATS Scan...</span>
                </>
              ) : (
                <>
                  <span>Analyze ATS Compatibility</span> 
                  <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Right Column: Results */}
          <div className="glass-panel p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#ffffff] border-b border-white/10 pb-3">
              <Sparkles className="w-5 h-5 text-[#ffffff]/60" /> ATS Compatibility Report
            </h2>
            
            {!result && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-[#ffffff]/30 h-full min-h-[450px] text-center p-6">
                <div className="p-6 rounded-full bg-white/5 border border-white/10 mb-4">
                  <BarChart2 className="w-16 h-16 opacity-30" />
                </div>
                <h3 className="text-lg font-semibold text-[#ffffff]/70 mb-1">No scan results yet</h3>
                <p className="text-sm text-[#ffffff]/40 max-w-sm">Upload your resume and provide a job description on the left to see your AI-analyzed ATS score and suggestions.</p>
              </div>
            )}
            
            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[450px] text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 border-4 border-white/10 rounded-full"></div>
                  <div className="w-20 h-20 border-4 border-white/60 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                  <Sparkles className="w-6 h-6 text-[#ffffff]/50 absolute top-7 left-7 animate-pulse" />
                </div>
                <h3 className="font-bold text-lg text-[#ffffff] mb-1 animate-pulse">Analyzing Keywords &amp; Structure...</h3>
                <p className="text-sm text-[#ffffff]/40 max-w-xs">Comparing semantic similarity and checking against industry standards.</p>
              </div>
            )}

            {result && !loading && renderResult(result)}
          </div>
        </div>
      )}

      {/* Tab Content: History Dashboard */}
      {activeTab === 'history' && (
        <div className="glass-panel p-6 min-h-[500px] flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-[#ffffff]">
              <History className="w-5 h-5 text-[#ffffff]/60" /> Previous ATS Reports
            </h2>
            <span className="text-xs bg-white/5 text-[#ffffff]/40 px-3 py-1 rounded-full border border-white/10">
              Showing past scans
            </span>
          </div>

          {historyLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center h-[350px]">
              <div className="w-10 h-10 border-3 border-white/20 border-t-white/70 rounded-full animate-spin mb-3"></div>
              <p className="text-sm text-[#ffffff]/60 animate-pulse">Loading report history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 h-[350px]">
              <div className="p-5 rounded-full bg-white/5 border border-white/10 mb-4">
                <History className="w-12 h-12 text-[#ffffff]/20" />
              </div>
              <h3 className="font-semibold text-[#ffffff]/60 mb-1">No history found</h3>
              <p className="text-sm text-[#ffffff]/40 max-w-xs">You haven't run any ATS scans yet. Switch to the 'New ATS Scan' tab to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* History List */}
              <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedHistoryItem(item)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      selectedHistoryItem?.id === item.id ? 'bg-white/10 border-white/25' : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#ffffff]/60 truncate max-w-[160px]">📄 {item.filename}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        item.score >= 80 ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        item.score >= 50 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>{Math.round(item.score)}% Match</span>
                    </div>
                    
                    <p className="text-xs text-[#ffffff]/50 line-clamp-2 italic bg-white/5 p-2 rounded border border-white/10">
                      "{item.job_description_snippet}"
                    </p>

                    <div className="flex items-center justify-between mt-1 text-[11px] text-[#ffffff]/30">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.created_at ? item.created_at.substring(0, 10) : ''}</span>
                      <span className="flex items-center gap-1 font-semibold text-[#ffffff]/50">View report <ArrowRight className="w-3 h-3" /></span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed View */}
              <div className="lg:col-span-2 bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col justify-center">
                {selectedHistoryItem ? (
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                      <div>
                        <span className="text-xs font-semibold text-[#ffffff]/40 uppercase tracking-wide">Historical Scan Report #{selectedHistoryItem.id}</span>
                        <h3 className="text-xl font-bold mt-1 text-[#ffffff]">Analyzed on {selectedHistoryItem.created_at}</h3>
                      </div>
                      <button 
                        onClick={() => {
                          setResult({
                            score: selectedHistoryItem.score,
                            matched_keywords: selectedHistoryItem.matched_keywords,
                            missing_keywords: selectedHistoryItem.missing_keywords,
                            insights: selectedHistoryItem.insights
                          });
                          setActiveTab('scan');
                        }}
                        className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5"
                      >
                        Load into Analyzer <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {renderResult({
                      score: selectedHistoryItem.score,
                      matched_keywords: selectedHistoryItem.matched_keywords,
                      missing_keywords: selectedHistoryItem.missing_keywords,
                      insights: selectedHistoryItem.insights
                    })}
                  </div>
                ) : (
                  <div className="text-center p-8 text-[#ffffff]/30">
                    <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-20 text-[#ffffff]" />
                    <p className="text-sm font-medium">Select a historical scan from the list on the left to inspect its detailed breakdown and insights.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
