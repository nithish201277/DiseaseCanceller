import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { ExerciseItem } from '../../types';
import {
  Dumbbell,
  Footprints,
  CheckCircle,
  Play,
  Clock,
  ShieldAlert,
  Flame,
  Award,
  Filter,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { CircularProgressRing, SafetyDisclaimerBanner } from '../common/ChartComponents';

export const ExerciseView: React.FC = () => {
  const { exercises, toggleExerciseCompleted, dailySteps, stepGoal, addSteps, activeProfile } =
    useHealth();
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);

  const completedCount = exercises.filter((e) => e.completedToday).length;

  const filteredExercises = exercises.filter((e) => {
    if (filterCategory === 'All') return true;
    return e.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <Dumbbell className="w-4 h-4" />
            <span>Cardio, Mobility & Strength</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Exercise & Physical Fitness
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Gentle, age-appropriate physical routines for {activeProfile.fullName} ({activeProfile.ageCategory} · {activeProfile.activityLevel})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Award className="w-4 h-4 text-teal-400" />
            <span className="text-slate-300">
              Completed Today: <strong className="text-white tabular-nums">{completedCount}</strong> / {exercises.length}
            </span>
          </div>
        </div>
      </div>

      <SafetyDisclaimerBanner />

      {/* Walking Tracker Hero Widget */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 z-10">
          <CircularProgressRing
            value={dailySteps}
            max={stepGoal}
            size={120}
            strokeWidth={9}
            label="Daily Steps"
            unit="steps"
            color="#2dd4bf"
          />

          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
              <Footprints className="w-4 h-4" />
              <span>Zone-2 Aerobic Walking Tracker</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              {dailySteps.toLocaleString()} <span className="text-sm font-normal text-slate-400">/ {stepGoal.toLocaleString()} steps</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed">
              Walking at a brisk cadence supports vascular elasticity, insulin receptor sensitivity, and steady cardiac conditioning.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                onClick={() => addSteps(500)}
                className="px-3 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-semibold border border-teal-500/40 transition-colors"
              >
                +500 steps
              </button>
              <button
                onClick={() => addSteps(1000)}
                className="px-3 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-semibold border border-teal-500/40 transition-colors"
              >
                +1,000 steps
              </button>
              <button
                onClick={() => addSteps(2500)}
                className="px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-semibold border border-sky-500/40 transition-colors"
              >
                +2,500 brisk walk
              </button>
            </div>
          </div>
        </div>

        <div className="z-10 bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5 max-w-xs">
          <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Estimated Burn</span>
          </div>
          <p className="text-slate-300 font-mono text-sm font-bold tabular-nums">
            ~{Math.round(dailySteps * 0.04)} kcal
          </p>
          <span className="text-[11px] text-slate-400">
            Based on {activeProfile.weightKg} kg body mass and steady walking cadence.
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {['All', 'Walking', 'Stretching', 'Strength', 'Breathing & Relaxation'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterCategory === cat
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Exercise Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
              exercise.completedToday
                ? 'glass-panel border-teal-500/40 bg-teal-950/15'
                : 'glass-panel border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-teal-400 font-semibold">{exercise.category}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">{exercise.difficulty}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400 tabular-nums">{exercise.durationMinutes} mins</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{exercise.name}</h3>
                </div>

                <button
                  onClick={() => toggleExerciseCompleted(exercise.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    exercise.completedToday
                      ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{exercise.completedToday ? 'Completed' : 'Mark Done'}</span>
                </button>
              </div>

              {/* Muscles Involved */}
              <div className="flex flex-wrap gap-1.5">
                {exercise.targetMuscles.map((m, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                  >
                    {m}
                  </span>
                ))}
              </div>

              {/* Step instructions */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400">Technique Instructions:</span>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                  {exercise.instructions.slice(0, 2).map((inst, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {inst}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Safety Precaution */}
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Safety Note:</strong> {exercise.safetyPrecautions[0]}
                </span>
              </div>
            </div>

            {/* Video tutorial & detail button */}
            {exercise.youtubeId && (
              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                <a
                  href={`https://www.youtube.com/watch?v=${exercise.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />
                  <span className="truncate max-w-[220px]">
                    Video Guide: {exercise.youtubeTitle || 'Watch Tutorial'}
                  </span>
                  <ExternalLink className="w-3 h-3 ml-0.5 shrink-0" />
                </a>
                <span className="text-[10px] text-slate-500 font-mono">
                  {exercise.youtubeChannel}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
