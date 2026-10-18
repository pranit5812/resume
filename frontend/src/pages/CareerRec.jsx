import React, { useState, useEffect } from 'react';
import { Compass, Briefcase, Award, GraduationCap, ExternalLink } from 'lucide-react';
import api from '../services/api';

const CareerRec = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await api.get('/recommendation/career-paths');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  if (loading) return <div className="p-8 font-bold text-[#ffffff]/40 animate-pulse">Loading AI holistic career maps...</div>;
  if (!data) return <div className="p-8 font-bold text-red-400">Failed to load recommendations</div>;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
        <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15">
          <Compass className="w-9 h-9 text-[#ffffff]" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-[#ffffff] tracking-tight">Career Recommendation Engine</h1>
          <p className="text-[#ffffff]/50 font-medium mt-1">Holistic AI-suggested roles and premium certifications tailored to your skills.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2.5 text-[#ffffff] border-b border-white/10 pb-3">
            <Briefcase className="w-6 h-6 text-blue-300" /> Top {data.recommended_roles?.length || 0} Suggested Roles
          </h2>
          <div className="space-y-6">
            {data.recommended_roles?.map((role, idx) => (
              <div key={idx} className="glass-panel p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-white/15 backdrop-blur text-[#ffffff] font-bold px-4 py-1.5 rounded-bl-2xl text-xs border-b border-l border-white/15">
                  {role.match_percentage}% Match
                </div>
                <span className="text-xs font-bold text-[#ffffff]/40 uppercase tracking-wider block mb-1">Rank #{idx + 1}</span>
                <h3 className="text-2xl font-black text-[#ffffff] mb-2 group-hover:text-white/80 transition-colors">{role.title}</h3>
                <p className="text-[#ffffff]/50 mb-6 leading-relaxed font-medium">"{role.reason}"</p>
                
                {role.roadmap && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <span className="text-xs font-bold uppercase text-[#ffffff]/40 tracking-wider mb-2 block">Quick Action Steps</span>
                    <ul className="space-y-1.5 text-xs text-[#ffffff]/50 pl-4 list-disc">
                      {role.roadmap.map((step, sIdx) => (
                        <li key={sIdx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2.5 text-[#ffffff] border-b border-white/10 pb-3">
              <Award className="w-6 h-6 text-amber-300" /> Recommended Certifications
            </h2>
            <div className="glass-panel p-6 space-y-3.5">
              <p className="text-xs text-[#ffffff]/40 font-medium mb-4">Top industry credentials recognized globally:</p>
              {data.suggested_certifications?.map((cert, idx) => (
                <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 group flex items-start gap-3">
                  <div className="bg-amber-400/15 p-2 rounded-xl text-amber-300 group-hover:scale-110 transition-transform flex-shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-sm text-[#ffffff]/80 group-hover:text-[#ffffff] transition-colors leading-snug">{cert}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2.5 text-[#ffffff] border-b border-white/10 pb-3">
              <GraduationCap className="w-6 h-6 text-purple-300" /> Recommended Online Courses
            </h2>
            <div className="glass-panel p-6 space-y-4">
              <p className="text-xs text-[#ffffff]/40 font-medium mb-4">Curated top-tier learning paths tailored to your goals:</p>
              {data.suggested_courses?.map((course, idx) => (
                <a 
                  key={idx} 
                  href={course.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-200 group flex flex-col gap-2 block"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="px-2.5 py-1 bg-white/10 border border-white/15 text-[#ffffff]/70 rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
                      {course.level}
                    </span>
                    <span className="text-xs font-bold text-[#ffffff]/40 group-hover:text-[#ffffff]/70 transition-colors flex items-center gap-1">
                      {course.provider} <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#ffffff] group-hover:text-white/80 transition-colors leading-snug mt-1">{course.title}</h3>
                  <p className="text-xs text-[#ffffff]/40 line-clamp-2 leading-relaxed">{course.description}</p>
                  <div className="mt-2 pt-2 border-t border-white/10 text-[11px] font-medium text-[#ffffff]/40 flex items-center gap-1.5">
                    <span>💡 {course.rationale}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerRec;
