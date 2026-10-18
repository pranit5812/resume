import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Target, Brain, TrendingUp } from 'lucide-react';
import api from '../services/api';

const DashboardHome = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/summary');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-8 text-[#ffffff]/60 animate-pulse">Loading analytics...</div>;
  if (!data) return <div className="p-8 text-[#ffffff]/60">Failed to load analytics</div>;

  const chartData = data.recent_interviews.map((int, idx) => ({
    name: `Int ${idx + 1}`,
    score: int.score
  })).reverse();

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      <h1 className="text-3xl font-bold mb-8 text-[#ffffff]">Performance Dashboard</h1>
      
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Avg ATS Score" value={`${data.avg_ats_score}%`} icon={<Target className="w-8 h-8 text-blue-300" />} />
        <MetricCard title="Resumes Analyzed" value={data.total_resumes_analyzed} icon={<Activity className="w-8 h-8 text-emerald-300" />} />
        <MetricCard title="Avg Interview Score" value={`${data.avg_interview_score}%`} icon={<Brain className="w-8 h-8 text-purple-300" />} />
        <MetricCard title="Total Interviews" value={data.total_interviews} icon={<TrendingUp className="w-8 h-8 text-amber-300" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold mb-6 text-[#ffffff]">Recent Interview Performance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.6)' }} />
                <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.6)' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.15)', 
                    borderRadius: '12px', 
                    color: '#ffffff',
                    backdropFilter: 'blur(10px)'
                  }}
                  itemStyle={{ color: 'rgba(255,255,255,0.8)' }}
                />
                <Bar dataKey="score" fill="rgba(255,255,255,0.7)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold mb-6 text-[#ffffff]">Recent Activity</h2>
          <div className="space-y-4">
            {data.recent_ats.slice(0,3).map((ats, idx) => (
              <div key={`ats-${idx}`} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/8 transition-colors">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-blue-300" />
                  <div>
                    <p className="font-medium text-[#ffffff]">ATS Scan: {ats.role}</p>
                    <p className="text-xs text-[#ffffff]/40">{new Date(ats.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-blue-300 font-bold">{ats.score}%</div>
              </div>
            ))}
            {data.recent_interviews.slice(0,2).map((int, idx) => (
              <div key={`int-${idx}`} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/8 transition-colors">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-purple-300" />
                  <div>
                    <p className="font-medium text-[#ffffff]">Mock Interview: {int.role}</p>
                    <p className="text-xs text-[#ffffff]/40">{new Date(int.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-purple-300 font-bold">{int.score}%</div>
              </div>
            ))}
            {data.recent_ats.length === 0 && data.recent_interviews.length === 0 && (
              <div className="text-[#ffffff]/40 text-center py-8">No recent activity found. Start exploring!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon }) => (
  <div className="glass-panel p-6 flex items-center justify-between">
    <div>
      <p className="text-[#ffffff]/50 text-sm mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-[#ffffff]">{value}</h3>
    </div>
    <div className="bg-white/5 p-3 rounded-xl border border-white/10">
      {icon}
    </div>
  </div>
);

export default DashboardHome;
