import React, { useState } from 'react';
import { Target, Search, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import api from '../services/api';

const SkillGap = () => {
  const [role, setRole] = useState('Frontend Developer');
  const [skillsInput, setSkillsInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const currentSkills = skillsInput.split(',').map(s => s.trim()).filter(s => s);
      const res = await api.post('/recommendation/skill-gap', {
        current_skills: currentSkills,
        target_role: role
      });
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-white/10 p-3 rounded-xl border border-white/15">
          <Target className="w-8 h-8 text-blue-300" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#ffffff]">Skill Gap Analyzer</h1>
          <p className="text-[#ffffff]/50">Compare your current skills against industry requirements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#ffffff]/70 mb-2">Target Role</label>
            <select 
              className="input-field cursor-pointer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option>Frontend Developer</option>
              <option>Backend Developer</option>
              <option>Data Scientist</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#ffffff]/70 mb-2">Your Current Skills (comma separated)</label>
            <textarea 
              className="input-field min-h-[120px]"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. python, sql, react"
            ></textarea>
          </div>
          <button 
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? 'Analyzing...' : <><Search className="w-5 h-5" /> Analyze Skills</>}
          </button>
        </div>

        <div className="glass-panel p-6">
          {!results && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-[#ffffff]/30 h-full min-h-[300px]">
              <TrendingUp className="w-16 h-16 mb-4 opacity-40" />
              <p>Run an analysis to see your skill gaps.</p>
            </div>
          )}
          
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[300px]">
               <div className="w-12 h-12 border-4 border-white/20 border-t-white/70 rounded-full animate-spin"></div>
            </div>
          )}

          {results && (
            <div className="space-y-6 animate-fade-in-up">
              <h2 className="text-xl font-bold text-[#ffffff] border-b border-white/10 pb-3">Analysis for {results.target_role}</h2>
              
              <div>
                <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Matched Skills ({results.matched_skills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {results.matched_skills.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-green-500/15 text-green-300 rounded-full text-sm border border-green-500/25">{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Missing Skills ({results.missing_skills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {results.missing_skills.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-red-500/15 text-red-300 rounded-full text-sm border border-red-500/25">{s}</span>
                  ))}
                </div>
              </div>

              <div className="mt-6 bg-white/5 p-4 rounded-xl border border-white/10">
                <h3 className="text-[#ffffff]/80 font-semibold mb-3">Suggested Learning Roadmap</h3>
                <ul className="space-y-2 text-sm text-[#ffffff]/60 list-disc pl-5">
                  {results.roadmap.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillGap;
