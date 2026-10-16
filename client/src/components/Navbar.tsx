import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, ShieldAlert, BookOpen, Clock, Settings, Sparkles, Terminal, Menu, X, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [dbHealthy, setDbHealthy] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.getHealth()
      .then(() => setDbHealthy(true))
      .catch(() => setDbHealthy(false));
  }, []);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: Terminal },
    { to: '/history', label: 'History', icon: Clock },
    { to: '/evidence', label: 'Evidence', icon: BookOpen },
    { to: '/lab', label: 'Hallucination Lab', icon: Sparkles },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 pt-3 pb-2 transition-transform duration-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Main Pill Nav Bar */}
        <div className="flex-1 min-w-0 flex items-center h-14 bg-[#f8eedc] border-[2.5px] border-[#1d1b18] rounded-full px-3 shadow-[2px_2px_0px_#1d1b18] transition-shadow duration-200 hover:shadow-[3px_3px_0px_#1d1b18]">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 pr-4 border-r-2 border-[#1d1b18] group focus-visible:outline-2 focus-visible:outline-[#1d1b18]"
          >
            <div className="w-8 h-8 rounded-full bg-[#1d1b18] border border-[#1d1b18] flex items-center justify-center text-[#f8eedc] transition-transform duration-250 ease-out group-hover:rotate-[-10deg] group-hover:scale-105">
              <Scale className="w-4 h-4 text-[#f8c33c] transition-transform duration-200 group-hover:scale-110" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-brand font-black text-2xl tracking-wider text-[#1d1b18] uppercase">
                GHOSTNET
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#f8c33c] text-[#1d1b18] border border-[#1d1b18] font-brand font-bold text-[11px] tracking-wide uppercase transition-colors duration-200 group-hover:bg-[#f47a22] group-hover:text-white">
                TRIAL BETA
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 px-5 flex-1 justify-center" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-link-animated text-[13px] font-bold tracking-wider uppercase whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d1b18] rounded-sm ${
                    isActive
                      ? 'is-active text-[#1d1b18]'
                      : 'text-[#6e665b] hover:text-[#1d1b18]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Status Indicator & CTA */}
          <div className="flex items-center gap-3 ml-auto">
            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#f1e4cf] border-2 border-[#1d1b18] text-xs transition-all duration-200 hover:bg-[#eae0cd] hover:border-[#1d1b18] cursor-default">
              <span
                className={`w-2.5 h-2.5 rounded-full border border-[#1d1b18] transition-transform duration-300 ${
                  dbHealthy ? 'bg-[#56b29e] animate-pulse' : 'bg-[#f47a22]'
                }`}
              />
              <span className="font-brand font-black text-[13px] tracking-wider text-[#1d1b18] uppercase select-none">
                {dbHealthy ? 'SYSTEM READY' : 'OFFLINE'}
              </span>
            </div>

            {/* Golden Trial Button with Arrow slide micro-interaction */}
            <Link
              to="/investigate"
              className="btn sm group flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#1d1b18] transition-transform duration-180 hover:-translate-y-0.5 active:translate-y-0.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#1d1b18] transition-transform duration-200 group-hover:scale-110" />
              <span>EMPANEL TRIAL</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#1d1b18] transition-transform duration-200 ease-out group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Mobile / Quick Action Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden w-14 h-14 rounded-full bg-[#f47a22] border-[2.5px] border-[#1d1b18] shadow-[2px_2px_0px_#1d1b18] flex items-center justify-center transition-transform duration-200 hover:rotate-[-8deg] hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-[#1d1b18]"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-[#1d1b18] transition-transform duration-150 rotate-90 animate-in" />
          ) : (
            <Menu className="w-6 h-6 text-[#1d1b18]" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-w-6xl mx-auto mt-2 p-3 bg-[#f8eedc] border-[2.5px] border-[#1d1b18] rounded-2xl shadow-[3px_3px_0px_#1d1b18] grid gap-1.5 animate-in fade-in slide-in-from-top-2 duration-180">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl font-brand font-bold text-base tracking-wide uppercase transition-colors duration-150 ${
                  isActive ? 'bg-[#f8c33c] text-[#1d1b18]' : 'hover:bg-[#f1e4cf] text-[#1d1b18]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[#1d1b18]" />
                  <span>{item.label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#1d1b18]" />
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
