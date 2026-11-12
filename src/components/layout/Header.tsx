import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { HeartPulse, Plus, Users, Menu, X, Bell, ShieldCheck } from 'lucide-react';
import { NavTab } from '../../types';

interface HeaderProps {
  onOpenLogVitals: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLogVitals,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { activeProfile, familyProfiles, switchProfile, setActiveTab, activeTab } = useHealth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 w-full glass-panel border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Zone 1: Brand Wordmark (Single text element) */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-5 h-5 text-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
              Disease Canceller <span className="text-teal-400">AI</span>
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: Fast Navigation Shortcuts (Desktop) */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`hover:text-teal-300 transition-colors whitespace-nowrap shrink-0 ${activeTab === 'dashboard' ? 'text-teal-400 font-semibold' : ''}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`hover:text-teal-300 transition-colors whitespace-nowrap shrink-0 ${activeTab === 'reports' ? 'text-teal-400 font-semibold' : ''}`}
        >
          Lab Reports
        </button>
        <button
          onClick={() => setActiveTab('assistant')}
          className={`hover:text-teal-300 transition-colors whitespace-nowrap shrink-0 ${activeTab === 'assistant' ? 'text-teal-400 font-semibold' : ''}`}
        >
          AI Assistant
        </button>
        <button
          onClick={() => setActiveTab('medications')}
          className={`hover:text-teal-300 transition-colors whitespace-nowrap shrink-0 ${activeTab === 'medications' ? 'text-teal-400 font-semibold' : ''}`}
        >
          Medications
        </button>
        <button
          onClick={() => setActiveTab('nutrition')}
          className={`hover:text-teal-300 transition-colors whitespace-nowrap shrink-0 ${activeTab === 'nutrition' ? 'text-teal-400 font-semibold' : ''}`}
        >
          Nutrition
        </button>
      </nav>

      {/* Zone 3: Actions & Profile Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Family Member Switcher */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 hover:border-teal-500/50 transition-colors text-xs font-medium text-slate-200"
            aria-label="Switch active health profile"
          >
            <Users className="w-3.5 h-3.5 text-teal-400" />
            <span className="max-w-[100px] truncate">{activeProfile.fullName}</span>
            <span className="text-[10px] text-teal-400 uppercase tracking-wider font-mono">
              ({activeProfile.relation || activeProfile.ageCategory})
            </span>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl glass-panel shadow-2xl p-1.5 z-50 border border-slate-700/80">
              <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                Switch Family Member
              </div>
              <div className="py-1">
                {familyProfiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchProfile(p.id);
                      setProfileDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      p.id === activeProfile.id
                        ? 'bg-teal-500/20 text-teal-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{p.fullName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {p.relation || p.ageCategory} · {p.age}y
                    </span>
                  </button>
                ))}
              </div>
              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    setActiveTab('family');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full text-center px-3 py-1.5 text-xs text-teal-400 hover:text-teal-300 transition-colors"
                >
                  Manage & Remove Profiles →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onOpenLogVitals}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-teal-500/20 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Record Vitals</span>
        </button>
      </div>
    </header>
  );
};
