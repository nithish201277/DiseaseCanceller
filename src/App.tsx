import React, { useState, useEffect } from 'react';
import { HealthProvider, useHealth } from './context/HealthContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { ProfileView } from './components/profile/ProfileView';
import { ReportExplainer } from './components/reports/ReportExplainer';
import { AssistantView } from './components/assistant/AssistantView';
import { NutritionView } from './components/nutrition/NutritionView';
import { ExerciseView } from './components/exercise/ExerciseView';
import { MedicationTracker } from './components/medications/MedicationTracker';
import { WaterTracker } from './components/water/WaterTracker';
import { SleepTracker } from './components/sleep/SleepTracker';
import { HealthCalendar } from './components/calendar/HealthCalendar';
import { FamilyProfiles } from './components/family/FamilyProfiles';
import { DoctorVisitPrep } from './components/doctor/DoctorVisitPrep';
import { LogVitalsModal } from './components/dashboard/LogVitalsModal';
import { HeartPulse, ShieldCheck, ArrowRight, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, activeProfile } = useHealth();
  const [logVitalsOpen, setLogVitalsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [welcomeBannerDismissed, setWelcomeBannerDismissed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') return true;
      return localStorage.getItem('dc_ai_welcome_seen') === 'true';
    }
    return false;
  });

  const handleDismissWelcome = () => {
    setWelcomeBannerDismissed(true);
    localStorage.setItem('dc_ai_welcome_seen', 'true');
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <HomeDashboard onOpenLogVitals={() => setLogVitalsOpen(true)} />;
      case 'profile':
        return <ProfileView />;
      case 'reports':
        return <ReportExplainer />;
      case 'assistant':
        return <AssistantView />;
      case 'nutrition':
        return <NutritionView />;
      case 'exercise':
        return <ExerciseView />;
      case 'medications':
        return <MedicationTracker />;
      case 'water':
        return <WaterTracker />;
      case 'sleep':
        return <SleepTracker />;
      case 'calendar':
        return <HealthCalendar />;
      case 'family':
        return <FamilyProfiles />;
      case 'doctor-prep':
        return <DoctorVisitPrep />;
      default:
        return <HomeDashboard onOpenLogVitals={() => setLogVitalsOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* Top Bar Contract (3 zones) */}
      <Header
        onOpenLogVitals={() => setLogVitalsOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Welcome Banner Modal for First-Time Visitors (Skippable via autostart or Dismiss) */}
      {!welcomeBannerDismissed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl glass-panel border border-slate-700/80 p-6 sm:p-8 space-y-5 shadow-2xl">
            <button
              onClick={handleDismissWelcome}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
              aria-label="Dismiss welcome modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-sky-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20">
              <HeartPulse className="w-6 h-6 text-slate-950" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Personal Health Companion</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Welcome to Disease Canceller AI
              </h2>
              <p className="text-sm font-medium text-teal-200">
                "Understand Your Health. Build a Healthier Tomorrow."
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                Your intelligent health monitoring companion designed to help you track vital measurements, decode laboratory reports, organize doctor-prescribed medications, and adopt wholesome nutrition and physical wellness routines.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-semibold text-teal-300 block">Important Scope Boundary:</span>
              <p className="leading-relaxed">
                Disease Canceller AI provides educational health literacy and personal tracking support. It does not diagnose, treat, or replace professional medical consultations.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">Preloaded demo data ready</span>
              <button
                onClick={handleDismissWelcome}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-teal-500/20"
              >
                <span>Enter Health Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Canvas: Sidebar + Viewport */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Log Vitals Modal */}
      <LogVitalsModal
        isOpen={logVitalsOpen}
        onClose={() => setLogVitalsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <HealthProvider>
      <AppContent />
    </HealthProvider>
  );
}
