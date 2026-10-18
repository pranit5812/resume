import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Brain, 
  CheckCircle, 
  Compass, 
  User, 
  LogOut 
} from 'lucide-react';
import BackgroundVideo from '../components/BackgroundVideo';

import ResumeUpload from './ResumeUpload';
import MockInterview from './MockInterview';
import DashboardHome from './DashboardHome';
import SkillGap from './SkillGap';
import CareerRec from './CareerRec';
import Profile from './Profile';


const Dashboard = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: 'resume', label: 'ATS Analyzer', icon: <FileText className="w-5 h-5" /> },
    { path: 'interview', label: 'Mock Interview', icon: <Brain className="w-5 h-5" /> },
    { path: 'skills', label: 'Skill Gap', icon: <CheckCircle className="w-5 h-5" /> },
    { path: 'career', label: 'Career Paths', icon: <Compass className="w-5 h-5" /> },
    { path: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-black overflow-hidden relative">
      {/* Background Video — behind everything */}
      <BackgroundVideo />

      {/* Sidebar */}
      <aside className="glass-sidebar w-64 flex flex-col z-20 relative">
        <div className="h-16 flex items-center px-6 border-b border-white/[0.07]">
          <Link to="/" className="text-xl font-bold text-[#ffffff] tracking-tight">
            CareerPilot AI
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const fullPath = `/dashboard${item.path ? `/${item.path}` : ''}`;
              const isActive = location.pathname === fullPath || (item.path === '' && location.pathname === '/dashboard');
              
              return (
                <li key={item.path}>
                  <Link 
                    to={fullPath}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-white/15 text-[#ffffff] font-semibold border border-white/20' 
                        : 'text-[#ffffff]/60 hover:bg-white/8 hover:text-[#ffffff] font-medium'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-white/[0.07]">
          <button 
            onClick={logout}
            className="flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full px-3.5 py-3 rounded-xl transition-all duration-200 font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden z-10">
        {/* Header */}
        <header className="glass-header h-16 flex items-center px-8 z-10">
          <h2 className="text-xl font-bold text-[#ffffff] tracking-tight">
            {navItems.find(item => `/dashboard${item.path ? `/${item.path}` : ''}` === location.pathname || (item.path === '' && location.pathname === '/dashboard'))?.label || 'Dashboard'}
          </h2>
        </header>

        {/* Dynamic Route Content */}
        <div className="flex-1 overflow-y-auto p-8 relative z-0 custom-scrollbar">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="resume" element={<ResumeUpload />} />
            <Route path="interview" element={<MockInterview />} />
            <Route path="skills" element={<SkillGap />} />
            <Route path="career" element={<CareerRec />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
