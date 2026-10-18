import React from 'react';
import { Link } from 'react-router-dom';
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

const ArrowRight = ({ className, size = 20, ...props }) => (
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
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const Instagram = ({ className, size = 20, ...props }) => (
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
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Twitter = ({ className, size = 20, ...props }) => (
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
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-black overflow-hidden relative flex flex-col">
      {/* Background Video */}
      <BackgroundVideo />

      {/* Navigation bar (relative z-20, padding pl-6 pr-6 py-6) */}
      <nav className="relative z-20 pl-6 pr-6 py-6">
        <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
          {/* Left side: Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-[#ffffff] font-semibold text-lg">
              <Globe className="w-6 h-6 text-[#ffffff]" />
              <span>CareerPilot AI</span>
            </Link>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center gap-4">
            <Link to="/register" className="text-[#ffffff] hover:text-[#ffffff]/80 transition-colors text-sm font-medium">
              Sign Up
            </Link>
            <Link to="/login" className="liquid-glass rounded-full px-6 py-2 text-[#ffffff] hover:bg-[#ffffff]/5 transition-colors text-sm font-medium">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero content area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[20%]">
        <h1
          className="text-5xl md:text-6xl lg:text-7xl text-[#ffffff] mb-8 tracking-tight whitespace-nowrap"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Resume intelligence, redefined.
        </h1>

        <div className="max-w-xl w-full space-y-4">
          {/* Email CTA bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = '/register';
            }}
            className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3"
          >
            <input
              type="email"
              placeholder="Enter your work email"
              required
              className="bg-transparent border-none outline-none text-[#ffffff] placeholder-[#ffffff]/40 text-base flex-1"
            />
            <button
              type="submit"
              className="bg-[#ffffff] rounded-full px-5 py-2.5 text-[#000000] hover:bg-[#ffffff]/90 transition-colors flex items-center gap-2 text-sm font-semibold cursor-pointer whitespace-nowrap"
            >
              Get Started Free
            </button>
          </form>

          {/* Subtitle text */}
          <p className="text-[#ffffff] text-sm leading-relaxed px-4">
            Get AI-powered resume analysis, real-time ATS scoring, and personalized career insights — all in one place.
          </p>

          {/* CTA button */}
          <Link to="/register" className="liquid-glass rounded-full px-8 py-3 text-[#ffffff] text-sm font-medium hover:bg-[#ffffff]/5 transition-colors inline-block mx-auto cursor-pointer">
            Start Building Your Resume →
          </Link>
        </div>
      </main>

      {/* Social icons footer */}
      <footer className="relative z-10 flex justify-center gap-4 pb-12">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="liquid-glass rounded-full p-4 text-[#ffffff]/80 hover:text-[#ffffff] hover:bg-[#ffffff]/5 transition-all"
        >
          <Instagram className="w-5 h-5" />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
          className="liquid-glass rounded-full p-4 text-[#ffffff]/80 hover:text-[#ffffff] hover:bg-[#ffffff]/5 transition-all"
        >
          <Twitter className="w-5 h-5" />
        </a>
        <a
          href="https://asme.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Globe"
          className="liquid-glass rounded-full p-4 text-[#ffffff]/80 hover:text-[#ffffff] hover:bg-[#ffffff]/5 transition-all"
        >
          <Globe className="w-5 h-5" />
        </a>
      </footer>
    </div>
  );
};


export default Landing;

