import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import {
  Moon,
  Clock,
  Sparkles,
  Star,
  CheckCircle2,
  ShieldAlert,
  Plus,
  Zap,
} from 'lucide-react';
import { WeeklyBarChart } from '../common/ChartComponents';

export const SleepTracker: React.FC = () => {
  const { sleepLogs, logSleep, activeProfile } = useHealth();

  const [bedTime, setBedTime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [qualityRating, setQualityRating] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [notes, setNotes] = useState('');
  const [loggedNotice, setLoggedNotice] = useState(false);

  // Calculate duration between bedTime and wakeTime
  const computeDurationHours = (bed: string, wake: string) => {
    const [bH, bM] = bed.split(':').map(Number);
    const [wH, wM] = wake.split(':').map(Number);
    let diffMinutes = wH * 60 + wM - (bH * 60 + bM);
    if (diffMinutes <= 0) diffMinutes += 24 * 60; // Crosses midnight
    return Math.round((diffMinutes / 60) * 10) / 10;
  };

  const currentDuration = computeDurationHours(bedTime, wakeTime);

  const handleSaveSleep = (e: React.FormEvent) => {
    e.preventDefault();
    logSleep({
      date: new Date().toISOString().split('T')[0],
      bedTime,
      wakeTime,
      durationHours: currentDuration,
      qualityRating,
      notes,
    });
    setLoggedNotice(true);
    setTimeout(() => setLoggedNotice(false), 2000);
  };

  const sleepGoalHours = 8.0;

  const weeklyChartData = sleepLogs.slice(-7).map((log) => ({
    label: new Date(log.date).toLocaleDateString(undefined, { weekday: 'short' }),
    value: log.durationHours,
    goal: sleepGoalHours,
  }));

  const avgDuration =
    sleepLogs.length > 0
      ? (
          sleepLogs.reduce((acc, l) => acc + l.durationHours, 0) / sleepLogs.length
        ).toFixed(1)
      : '7.5';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <Moon className="w-4 h-4" />
            <span>Circadian Rhythm & Restorative Sleep</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Sleep Tracker & Hygiene
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor restorative recovery cycles for {activeProfile.fullName} ({activeProfile.ageCategory})
          </p>
        </div>
      </div>

      {loggedNotice && (
        <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-500/30 text-xs text-teal-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>Sleep entry recorded successfully. Weekly sleep trends have been updated.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">7-Day Average Duration</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-white tabular-nums">{avgDuration}</span>
              <span className="text-xs text-slate-400">hrs/night</span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Moon className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Sleep Regularity</span>
            <p className="text-sm font-semibold text-teal-300 mt-1">Consistent Circadian Window</p>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Recommended Window</span>
            <p className="text-sm font-semibold text-white mt-1">7.0 - 9.0 Hours Nightly</p>
          </div>
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sleep Log Form & Weekly Chart Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Log Form */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Log Last Night's Sleep</h3>

          <form onSubmit={handleSaveSleep} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Bedtime</label>
                <input
                  type="time"
                  required
                  value={bedTime}
                  onChange={(e) => setBedTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Wake-up Time</label>
                <input
                  type="time"
                  required
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>
            </div>

            {/* Computed Duration Notice */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Calculated Duration:</span>
              <span className="text-sm font-bold text-white tabular-nums">
                {currentDuration} Hours
              </span>
            </div>

            {/* Quality Stars */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300">Subjective Rest Quality</label>
              <div className="flex items-center gap-2">
                {([1, 2, 3, 4, 5] as const).map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setQualityRating(star)}
                    className={`p-2 rounded-lg border transition-all ${
                      qualityRating >= star
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-600'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                ))}
                <span className="text-xs text-slate-400 ml-2">
                  {qualityRating === 5
                    ? 'Deeply Restorative'
                    : qualityRating === 4
                    ? 'Good Quality'
                    : qualityRating === 3
                    ? 'Moderate / Interrupted'
                    : 'Restless / Poor'}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Avoided late caffeine, dark room..."
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-teal-500/20"
            >
              Save Sleep Entry
            </button>
          </form>
        </div>

        {/* 7-Day Sleep Duration Chart */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">7-Day Sleep Duration</h3>
            <span className="text-xs text-slate-400 font-mono">Dashed line: 8.0 hr target</span>
          </div>

          <WeeklyBarChart data={weeklyChartData} unit="hrs" color="#818cf8" />
        </div>
      </div>

      {/* Evidence-Based Sleep Hygiene Section */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">Clinical Sleep Hygiene Protocols</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-white">Consistent Wake Time</h4>
            <p className="text-slate-400 leading-relaxed">
              Anchor your circadian clock by getting out of bed at the exact same hour seven days a week.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-white">Screen Blue Light Curfew</h4>
            <p className="text-slate-400 leading-relaxed">
              Shut down bright mobile and tablet screens 60 minutes prior to sleep to preserve melatonin secretion.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-white">Thermal Environment</h4>
            <p className="text-slate-400 leading-relaxed">
              Maintain bedroom temperature between 18°C–20°C (65°F–68°F) to trigger core temperature drop.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-white">Caffeine Timing Buffer</h4>
            <p className="text-slate-400 leading-relaxed">
              Avoid coffee and high-caffeine tea within 8 to 10 hours before your scheduled bedtime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
