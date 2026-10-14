import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, ShieldAlert, BookOpen, Clock, Settings, Sparkles, Terminal } from 'lucide-react';
import { api } from '../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [dbHealthy, setDbHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    api.getHealth()
      .then(() => setDbHealthy(true))
      .catch(() => setDbHealthy(false));
  }, []);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: Terminal },
    { to: '/history', label: 'Case History', icon: Clock },
    { to: '/evidence', label: 'Evidence Vault', icon: BookOpen },
    { to: '/lab', label: 'Hallucination Lab', icon: Sparkles },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#232A36] bg-[#090B0E]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1C222C] to-[#12161E] border border-[#323C4D] flex items-center justify-center text-amber-400 group-hover:border-amber-500/50 transition-colors shadow-inner">
            <Scale className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-wider text-gray-100 font-mono-code">GHOSTNET</span>
              <span className="text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono-code">
                AI Courtroom
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">Put AI answers on trial</p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#1C222C] text-gray-100 border border-[#323C4D]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#151921]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action button & Status indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#12161E] border border-[#232A36] text-xs">
            <span className={`w-2 h-2 rounded-full ${dbHealthy ? 'bg-emerald-400 animate-pulse' : dbHealthy === false ? 'bg-rose-500' : 'bg-amber-400'}`} />
            <span className="text-gray-400 font-mono-code text-[11px]">
              {dbHealthy ? 'SYSTEM READY' : dbHealthy === false ? 'OFFLINE' : 'CHECKING'}
            </span>
          </div>

          <Link
            to="/investigate"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold text-sm transition-all shadow-md shadow-amber-500/10 active:scale-95"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>New Trial</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
