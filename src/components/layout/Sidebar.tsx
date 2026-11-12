import React from 'react';
import { useHealth } from '../../context/HealthContext';
import { NavTab } from '../../types';
import {
  LayoutDashboard,
  UserCheck,
  FileText,
  Bot,
  Apple,
  Dumbbell,
  Pill,
  Droplets,
  Moon,
  Calendar,
  Users2,
  Stethoscope,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Home Dashboard', icon: LayoutDashboard },
  { id: 'profile', label: 'My Health Profile', icon: UserCheck },
  { id: 'reports', label: 'Health Reports', icon: FileText, badge: 'AI OCR' },
  { id: 'assistant', label: 'AI Health Assistant', icon: Bot },
  { id: 'nutrition', label: 'Food & Nutrition', icon: Apple },
  { id: 'exercise', label: 'Exercise & Fitness', icon: Dumbbell },
  { id: 'medications', label: 'Medicine Tracker', icon: Pill },
  { id: 'water', label: 'Water Tracker', icon: Droplets },
  { id: 'sleep', label: 'Sleep Tracker', icon: Moon },
  { id: 'calendar', label: 'Health Calendar', icon: Calendar },
  { id: 'family', label: 'Family Health', icon: Users2 },
  { id: 'doctor-prep', label: 'Doctor Visit Prep', icon: Stethoscope },
];

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeTab, setActiveTab, activeProfile } = useHealth();

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between p-4">
      <div className="space-y-6">
        {/* Active Profile Info Capsule */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-sm">
              {activeProfile.fullName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{activeProfile.fullName}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="capitalize">{activeProfile.ageCategory}</span>
                <span>·</span>
                <span className="tabular-nums">{activeProfile.age} yrs</span>
                <span>·</span>
                <span className="tabular-nums">{activeProfile.weightKg} kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Health Portal
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500/20 to-sky-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span className="text-[10px] font-mono text-teal-400 bg-teal-950/60 border border-teal-500/30 px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-3.5 h-3.5 text-teal-400" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-teal-400 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Educational Scope</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Does not replace clinical diagnosis. Consult your doctor for all medical decisions.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 glass-panel border-r border-slate-800/80 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] glass-panel h-full shadow-2xl z-10 overflow-y-auto border-r border-slate-700/80">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
