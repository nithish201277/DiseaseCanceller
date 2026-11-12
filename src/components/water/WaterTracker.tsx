import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import {
  Droplets,
  Plus,
  RotateCcw,
  Bell,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { CircularProgressRing, WeeklyBarChart } from '../common/ChartComponents';

export const WaterTracker: React.FC = () => {
  const { todayWaterMl, waterGoalMl, logWater, resetWater, activeProfile } = useHealth();
  const [customAmount, setCustomAmount] = useState('200');
  const [reminderInterval, setReminderInterval] = useState('2');
  const [reminderActive, setReminderActive] = useState(true);

  // 7-day demo history
  const historyData = [
    { label: 'Thu', value: 2400, goal: waterGoalMl },
    { label: 'Fri', value: 2600, goal: waterGoalMl },
    { label: 'Sat', value: 2200, goal: waterGoalMl },
    { label: 'Sun', value: 2800, goal: waterGoalMl },
    { label: 'Mon', value: 2500, goal: waterGoalMl },
    { label: 'Tue', value: 2750, goal: waterGoalMl },
    { label: 'Today', value: todayWaterMl, goal: waterGoalMl },
  ];

  const percent = Math.min(100, Math.round((todayWaterMl / waterGoalMl) * 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
            <Droplets className="w-4 h-4" />
            <span>Hydration & Fluid Balance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Water Intake Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Dynamic target ({waterGoalMl.toLocaleString()} ml) calculated for {activeProfile.fullName} ({activeProfile.weightKg} kg, {activeProfile.activityLevel})
          </p>
        </div>

        <button
          onClick={resetWater}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Today's Log</span>
        </button>
      </div>

      {/* Main Hydration Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Central Circular Gauge */}
        <div className="lg:col-span-1 p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col items-center justify-center space-y-4 text-center">
          <CircularProgressRing
            value={todayWaterMl}
            max={waterGoalMl}
            size={180}
            strokeWidth={14}
            label="Hydration Level"
            unit="ml"
            sublabel={`${percent}% of daily goal`}
            color="#38bdf8"
          />

          <div className="space-y-1">
            <p className="text-sm font-bold text-white">
              {todayWaterMl >= waterGoalMl ? 'Daily Target Achieved!' : `${(waterGoalMl - todayWaterMl).toLocaleString()} ml remaining`}
            </p>
            <span className="text-xs text-slate-400">
              Optimal cellular hydration & renal filtration
            </span>
          </div>
        </div>

        {/* Quick Log Buttons & Reminder Settings */}
        <div className="lg:col-span-2 space-y-5">
          {/* Quick Log Strip */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">Quick Add Water</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => logWater(250)}
                className="p-3.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold text-xs transition-all flex flex-col items-center gap-1 group"
              >
                <Droplets className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                <span>+250 ml</span>
                <span className="text-[10px] text-slate-400 font-normal">Standard Glass</span>
              </button>

              <button
                onClick={() => logWater(500)}
                className="p-3.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold text-xs transition-all flex flex-col items-center gap-1 group"
              >
                <Droplets className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
                <span>+500 ml</span>
                <span className="text-[10px] text-slate-400 font-normal">Sports Bottle</span>
              </button>

              <button
                onClick={() => logWater(750)}
                className="p-3.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold text-xs transition-all flex flex-col items-center gap-1 group"
              >
                <Droplets className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>+750 ml</span>
                <span className="text-[10px] text-slate-400 font-normal">Large Flask</span>
              </button>

              <div className="flex flex-col gap-1.5 justify-between">
                <input
                  type="number"
                  min={50}
                  step={50}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg glass-input text-xs text-center tabular-nums"
                  placeholder="Custom ml"
                />
                <button
                  onClick={() => logWater(parseInt(customAmount, 10) || 0)}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
                >
                  + Add Custom
                </button>
              </div>
            </div>
          </div>

          {/* Reminder Interval Settings */}
          <div className="p-4 rounded-xl glass-panel border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-teal-400" />
              <div>
                <span className="font-semibold text-white block">Hydration Reminders</span>
                <span className="text-slate-400 text-[11px]">
                  Periodic gentle prompts throughout your waking hours
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={reminderInterval}
                onChange={(e) => setReminderInterval(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg glass-input text-xs"
              >
                <option value="1">Every 1 Hour</option>
                <option value="2">Every 2 Hours (Standard)</option>
                <option value="3">Every 3 Hours</option>
              </select>

              <button
                onClick={() => setReminderActive(!reminderActive)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  reminderActive
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {reminderActive ? 'Active' : 'Paused'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day History Chart */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">7-Day Hydration Consistency</h3>
          <span className="text-xs text-slate-400 font-mono">Dashed line: {waterGoalMl} ml goal</span>
        </div>

        <WeeklyBarChart data={historyData} unit="ml" color="#38bdf8" />
      </div>
    </div>
  );
};
