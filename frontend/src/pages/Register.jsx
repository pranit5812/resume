import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { Mail, Lock, User } from 'lucide-react';
import BackgroundVideo from '../components/BackgroundVideo';

const Globe = ({ className, size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d.msg || d).join(', ')
            : err.code === 'ECONNABORTED' || err.message === 'Network Error'
              ? 'Cannot reach server. Is the API running?'
              : null;
      setError(msg || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Background Video */}
      <BackgroundVideo />
      
      <div className="liquid-glass w-full max-w-md p-8 relative z-10 rounded-2xl animate-fade-in-up">
        <div className="flex justify-center mb-6">
          <Link to="/" className="liquid-glass p-4 rounded-full flex items-center justify-center hover:bg-[#ffffff]/5 transition-colors">
            <Globe className="w-8 h-8 text-[#ffffff]" />
          </Link>
        </div>
        <h2 className="text-3xl font-bold text-center mb-2 text-[#ffffff]">Create Account</h2>
        <p className="text-[#ffffff]/60 text-center mb-8">Start your AI-powered career prep</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#ffffff]/80 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-[#ffffff]/40" />
              <input 
                type="text" 
                className="liquid-glass w-full rounded-xl pl-10 pr-4 py-3 bg-transparent border-none text-[#ffffff] placeholder-[#ffffff]/40 focus:outline-none focus:ring-1 focus:ring-[#ffffff]/20 text-base" 
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#ffffff]/80 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-[#ffffff]/40" />
              <input 
                type="email" 
                className="liquid-glass w-full rounded-xl pl-10 pr-4 py-3 bg-transparent border-none text-[#ffffff] placeholder-[#ffffff]/40 focus:outline-none focus:ring-1 focus:ring-[#ffffff]/20 text-base" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#ffffff]/80 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-[#ffffff]/40" />
              <input 
                type="password" 
                className="liquid-glass w-full rounded-xl pl-10 pr-4 py-3 bg-transparent border-none text-[#ffffff] placeholder-[#ffffff]/40 focus:outline-none focus:ring-1 focus:ring-[#ffffff]/20 text-base" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 mt-4 rounded-full bg-[#ffffff] text-[#000000] hover:bg-[#ffffff]/90 transition-all font-semibold flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-[#ffffff]/60 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-[#ffffff] hover:text-[#ffffff]/80 transition-colors font-medium underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

