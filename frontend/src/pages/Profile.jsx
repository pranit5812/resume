import React, { useState, useEffect } from 'react';
import { User, GraduationCap, Briefcase, Sparkles, Heart, Target, Plus, X, CheckCircle, AlertCircle, Compass, Award, ArrowRight, Save, Activity } from 'lucide-react';
import api from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState({
    full_name: '',
    education: '',
    experience_years: '',
    skills: [],
    hobbies: '',
    passions: '',
    career_goals: '',
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionTab, setActiveSuggestionTab] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        if (res.data) {
          setProfile({
            full_name: res.data.full_name || '',
            education: res.data.education || '',
            experience_years: res.data.experience_years === 0 ? '' : res.data.experience_years || '',
            skills: res.data.skills || [],
            hobbies: res.data.hobbies || '',
            passions: res.data.passions || '',
            career_goals: res.data.career_goals || '',
          });
          setSuggestions(res.data.suggested_career_paths || []);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const payload = {
        ...profile,
        experience_years: profile.experience_years === '' || isNaN(profile.experience_years) ? 0 : parseInt(profile.experience_years, 10)
      };
      const res = await api.post('/profile', payload);
      setMessage('Profile updated successfully! AI has analyzed your career match.');
      setSuggestions(res.data.profile.suggested_career_paths || []);
      setActiveSuggestionTab(0);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save profile and generate recommendations.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px]">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white/70 rounded-full animate-spin mb-4"></div>
        <p className="text-[#ffffff]/60 font-medium animate-pulse">Loading AI Holistic Career Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-[#ffffff]">
            Holistic Career Navigator 
            <span className="text-xs bg-white/10 border border-white/15 text-[#ffffff]/70 px-3 py-1 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Advisor
            </span>
          </h1>
          <p className="text-[#ffffff]/50 mt-1">Share your skills, hobbies, and personal passions to unlock custom AI career roadmaps.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Grid: Profile Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveProfile} className="glass-panel p-6 space-y-6">
            <h2 className="text-xl font-bold border-b border-white/10 pb-3 flex items-center gap-2 text-[#ffffff]">
              <User className="w-5 h-5 text-blue-300" /> Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#ffffff]/60 mb-2">Full Name</label>
                <input 
                  type="text" 
                  className="input-field text-sm" 
                  placeholder="Alex Johnson"
                  value={profile.full_name} 
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#ffffff]/60 mb-2">Highest Education / Major</label>
                <input 
                  type="text" 
                  className="input-field text-sm" 
                  placeholder="B.S. in Computer Science"
                  value={profile.education} 
                  onChange={(e) => setProfile({...profile, education: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#ffffff]/60 mb-2">Years of Professional Experience</label>
              <input 
                type="number" 
                min="0"
                max="50"
                placeholder="e.g. 3"
                className="input-field text-sm max-w-[200px]" 
                value={profile.experience_years} 
                onChange={(e) => setProfile({...profile, experience_years: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0)})}
              />
            </div>

            <div className="border-t border-white/10 pt-6">
              <h2 className="text-xl font-bold border-b border-white/10 pb-3 flex items-center gap-2 mb-4 text-[#ffffff]">
                <Briefcase className="w-5 h-5 text-emerald-300" /> Technical Skills
              </h2>
              <div className="flex gap-2 mb-3">
                <input 
                  type="text" 
                  className="input-field text-sm flex-1" 
                  placeholder="Add a skill (e.g., React, Python, Docker, Figma)..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddSkill(e); }}
                />
                <button 
                  type="button" 
                  onClick={handleAddSkill}
                  className="btn-secondary flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-xl bg-white/5 border border-white/10">
                {profile.skills.length === 0 ? (
                  <span className="text-sm text-[#ffffff]/40 italic">No skills added yet. Add tags above to enhance AI accuracy.</span>
                ) : (
                  profile.skills.map((s, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/10 border border-white/15 text-[#ffffff] rounded-lg text-xs font-medium flex items-center gap-2 group">
                      {s}
                      <button type="button" onClick={() => handleRemoveSkill(s)} className="hover:bg-red-500/20 hover:text-red-300 rounded p-0.5 transition-colors cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 space-y-6">
              <h2 className="text-xl font-bold border-b border-white/10 pb-3 flex items-center gap-2 text-[#ffffff]">
                <Heart className="w-5 h-5 text-red-400" /> Passions & Personal Hobbies
              </h2>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#ffffff]/80 mb-1 flex items-center justify-between">
                  <span>Hobbies & Casual Interests</span>
                  <span className="text-[10px] text-[#ffffff]/40 font-normal normal-case">e.g., Gaming, chess, photography, sci-fi books</span>
                </label>
                <textarea 
                  className="input-field min-h-[100px] text-sm leading-relaxed resize-none"
                  placeholder="What do you enjoy doing outside of work? AI maps your hobbies to unexpected career crossovers (like gaming -> Unity developer or board games -> Data analytics)."
                  value={profile.hobbies}
                  onChange={(e) => setProfile({...profile, hobbies: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#ffffff]/80 mb-1 flex items-center justify-between">
                  <span>Core Passions & Motivations</span>
                  <span className="text-[10px] text-[#ffffff]/40 font-normal normal-case">e.g., Designing beautiful UI, solving complex puzzles, mentoring</span>
                </label>
                <textarea 
                  className="input-field min-h-[100px] text-sm leading-relaxed resize-none"
                  placeholder="What drives you? Describe what makes work meaningful for you."
                  value={profile.passions}
                  onChange={(e) => setProfile({...profile, passions: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#ffffff]/80 mb-1 flex items-center justify-between">
                  <span>Professional Career Goals</span>
                  <span className="text-[10px] text-[#ffffff]/40 font-normal normal-case">e.g., Becoming a Tech Lead, remote work flexibility, building AI apps</span>
                </label>
                <textarea 
                  className="input-field min-h-[100px] text-sm leading-relaxed resize-none"
                  placeholder="Where do you see yourself in 3-5 years? What kind of role or impact are you striving for?"
                  value={profile.career_goals}
                  onChange={(e) => setProfile({...profile, career_goals: e.target.value})}
                ></textarea>
              </div>
            </div>

            {message && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-300 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg shadow-green-500/5 animate-fade-in">
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400" />
                <span className="text-sm font-medium">{message}</span>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg shadow-red-500/5 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving & Analyzing Career Synergy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Save & Generate AI Career Map</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Grid: AI Career Advisor Recommendations (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 flex flex-col min-h-[600px]">
            <h2 className="text-xl font-bold border-b border-white/10 pb-3 flex items-center gap-2 mb-6 text-[#ffffff]">
              <Compass className="w-5 h-5 text-purple-300" /> AI Career Path Suggestions
            </h2>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="relative mb-6">
                  <div className="w-20 h-20 border-4 border-white/10 rounded-full"></div>
                  <div className="w-20 h-20 border-4 border-white/60 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                  <Sparkles className="w-6 h-6 text-[#ffffff]/60 absolute top-7 left-7 animate-pulse" />
                </div>
                <h3 className="font-bold text-lg text-[#ffffff] mb-1 animate-pulse">Computing Holistic Career Matches...</h3>
                <p className="text-sm text-[#ffffff]/60 max-w-xs">Cross-referencing your technical skills and personal passions against industry career archetypes.</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="p-6 rounded-full bg-white/5 border border-white/10 mb-4">
                  <Compass className="w-16 h-16 text-[#ffffff]/30 animate-pulse" />
                </div>
                <h3 className="font-bold text-lg text-[#ffffff] mb-1">No career analysis generated</h3>
                <p className="text-sm text-[#ffffff]/60 max-w-sm leading-relaxed mb-6">
                  Fill out your skills, hobbies, and passions on the left and click 'Save & Generate AI Career Map' to receive personalized role matches.
                </p>
                <div className="flex items-center gap-2 text-xs text-blue-300 font-medium bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  <Activity className="w-4 h-4 animate-spin" /> Unlocks roadmap and recommended certifications
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-6 animate-fade-in">
                {/* Switcher tabs for the suggestions */}
                <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto custom-scrollbar">
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSuggestionTab(idx)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 cursor-pointer ${
                        activeSuggestionTab === idx 
                          ? 'bg-white/20 text-[#ffffff] border-white/30' 
                          : 'bg-white/5 text-[#ffffff]/50 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span>{sug.title.split(' ')[0]}...</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        sug.match_percentage >= 80 ? 'bg-green-500/25 text-green-300 border border-green-500/30' : 'bg-blue-500/25 text-blue-300 border border-blue-500/30'
                      }`}>{sug.match_percentage}%</span>
                    </button>
                  ))}
                </div>

                {/* Display Active Suggestion */}
                {suggestions[activeSuggestionTab] && (
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Top Recommendation #{activeSuggestionTab + 1}</span>
                          <h3 className="text-2xl font-extrabold text-[#ffffff] mt-1">{suggestions[activeSuggestionTab].title}</h3>
                        </div>
                        <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 px-3.5 py-2 rounded-xl text-center">
                          <span className="block text-2xl font-black text-green-400">{suggestions[activeSuggestionTab].match_percentage}%</span>
                          <span className="text-[10px] uppercase font-bold text-[#ffffff]/60 tracking-wider">Synergy Score</span>
                        </div>
                      </div>

                      {/* Rationale */}
                      <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-sm text-[#ffffff]/80 leading-relaxed mb-6">
                        <p className="font-semibold text-blue-300 mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" /> AI Synergy Rationale:
                        </p>
                        <p className="italic text-[#ffffff]/70">"{suggestions[activeSuggestionTab].reason}"</p>
                      </div>

                      {/* Certifications */}
                      <div className="space-y-3 mb-6">
                        <h4 className="text-xs font-bold uppercase text-[#ffffff]/60 tracking-wider flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-yellow-500" /> Recommended Certifications
                        </h4>
                        <div className="space-y-2">
                          {suggestions[activeSuggestionTab].certifications.map((cert, cIdx) => (
                            <div key={cIdx} className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-[#ffffff]/80 flex items-center gap-2.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                              <span>{cert}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Roadmap */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-[#ffffff]/60 tracking-wider flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-blue-300" /> Roadmap Next Steps
                        </h4>
                        <div className="space-y-3 relative pl-4 border-l-2 border-white/15 ml-2">
                          {suggestions[activeSuggestionTab].roadmap.map((step, sIdx) => (
                            <div key={sIdx} className="relative">
                              <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-300"></div>
                              <p className="text-xs text-[#ffffff]/70 leading-relaxed font-medium">
                                <span className="font-bold text-[#ffffff] mr-1">Step {sIdx + 1}:</span> {step}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 text-center">
                      <p className="text-xs text-[#ffffff]/40">
                        Update your profile anytime to recalculate your synergy metrics and discover new paths.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
