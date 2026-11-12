import React from 'react';
import { useHealth } from '../../context/HealthContext';
import {
  Activity,
  Heart,
  Droplets,
  Moon,
  Footprints,
  Pill,
  Apple,
  Calendar,
  Flame,
  Plus,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { calculateBMI, classifyBloodPressure, classifyBloodGlucose } from '../../utils/healthMath';
import { VitalsTrendChart, CircularProgressRing, SafetyDisclaimerBanner } from '../common/ChartComponents';

interface HomeDashboardProps {
  onOpenLogVitals: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onOpenLogVitals }) => {
  const {
    activeProfile,
    vitalsHistory,
    todayVitals,
    medications,
    updateMedicationStatus,
    dailySteps,
    stepGoal,
    addSteps,
    todayWaterMl,
    waterGoalMl,
    logWater,
    dailyNutritionSummary,
    exercises,
    toggleExerciseCompleted,
    calendarEvents,
    setActiveTab,
    sleepLogs,
  } = useHealth();

  const bmiResult = calculateBMI(activeProfile.weightKg, activeProfile.heightCm);
  const currentBP = todayVitals
    ? { systolic: todayVitals.systolicBP, diastolic: todayVitals.diastolicBP }
    : { systolic: 120, diastolic: 80 };
  const bpClassification = classifyBloodPressure(currentBP.systolic, currentBP.diastolic);

  const currentGlucose = todayVitals?.fastingGlucoseMgDl || 98;
  const glucoseClassification = classifyBloodGlucose(currentGlucose);

  const latestSleep = sleepLogs[sleepLogs.length - 1] || { durationHours: 7.5, qualityRating: 4 };

  const todayDateString = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome Header & Safety Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Intelligent Health Monitoring</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {activeProfile.fullName.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {todayDateString} · Monitoring {activeProfile.ageCategory} health profile
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('assistant')}
            className="px-3.5 py-2 rounded-xl glass-panel-subtle hover:bg-slate-800 text-xs font-medium text-teal-300 border border-teal-500/20 transition-all flex items-center gap-1.5"
          >
            <span>Ask Health AI</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-teal-400" />
          </button>
          <button
            onClick={onOpenLogVitals}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record Today's Vitals</span>
          </button>
        </div>
      </div>

      <SafetyDisclaimerBanner />

      {/* Hero Visual Spotlight */}
      <div className="relative rounded-2xl overflow-hidden glass-panel border border-slate-800 min-h-[160px] sm:min-h-[180px] flex items-center">
        <img
          src="/src/assets/images/hero_health_banner_1794477239004.jpg"
          alt="Disease Canceller Health Hub"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

        <div className="relative p-6 sm:p-8 max-w-2xl space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400">
            Wellness Routine Progress
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Understand Your Health. Build a Healthier Tomorrow.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Consistently tracking prescribed medications, daily hydration, sleep patterns, and laboratory reports empowers proactive conversations with your personal healthcare team.
          </p>
        </div>
      </div>

      {/* Primary KPI Grid (Single elevation) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Blood Pressure Card */}
        <div className="p-4 rounded-xl glass-panel border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Blood Pressure</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white tabular-nums">
                {currentBP.systolic}/{currentBP.diastolic}
              </span>
              <span className="text-xs text-slate-400">mmHg</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className={`font-semibold ${bpClassification.color}`}>{bpClassification.status}</span>
              <span className="text-[10px] text-slate-400">Goal &lt; 120/80</span>
            </div>
          </div>
        </div>

        {/* Fasting Glucose Card */}
        <div className="p-4 rounded-xl glass-panel border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Fasting Glucose</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white tabular-nums">
                {currentGlucose}
              </span>
              <span className="text-xs text-slate-400">mg/dL</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className={`font-semibold ${glucoseClassification.color}`}>
                {glucoseClassification.status.split(' ')[0]}
              </span>
              <span className="text-[10px] text-slate-400">Target 70-99</span>
            </div>
          </div>
        </div>

        {/* BMI & Weight Card */}
        <div className="p-4 rounded-xl glass-panel border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">BMI & Weight</span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white tabular-nums">
                {bmiResult.bmi}
              </span>
              <span className="text-xs text-slate-400 font-mono">BMI</span>
              <span className="text-xs text-slate-400 ml-1.5 tabular-nums">
                ({activeProfile.weightKg} kg)
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-teal-300">{bmiResult.category}</span>
              <span className="text-[10px] text-slate-400">{activeProfile.heightCm} cm</span>
            </div>
          </div>
        </div>

        {/* Heart Rate / Pulse Card */}
        <div className="p-4 rounded-xl glass-panel border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Resting Heart Rate</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white tabular-nums">
                {todayVitals?.heartRateBpm || 70}
              </span>
              <span className="text-xs text-slate-400">BPM</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-sky-300">Normal Sinus</span>
              <span className="text-[10px] text-slate-400">SpO2: {todayVitals?.spO2Percent || 99}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Trend Chart & Daily Circular Ring Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Vitals Trend Chart (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-panel border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">7-Day Vitals & Glucose Progression</h3>
              <p className="text-xs text-slate-400">
                Visualizing blood pressure & fasting glucose readings over time
              </p>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs text-teal-400 hover:text-teal-300 transition-colors font-medium"
            >
              View Full Lab Records →
            </button>
          </div>

          <VitalsTrendChart records={vitalsHistory} />
        </div>

        {/* Daily Wellness Activity Rings (1 Col) */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Daily Wellness Goals</h3>
            <span className="text-xs text-slate-400 font-mono">Today</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Step Counter */}
            <div className="flex flex-col items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <CircularProgressRing
                value={dailySteps}
                max={stepGoal}
                size={95}
                strokeWidth={7}
                label="Daily Steps"
                unit="steps"
                color="#2dd4bf"
              />
              <button
                onClick={() => addSteps(500)}
                className="mt-2 text-[10px] px-2 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-colors"
              >
                +500 steps
              </button>
            </div>

            {/* Water Tracker */}
            <div className="flex flex-col items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <CircularProgressRing
                value={todayWaterMl}
                max={waterGoalMl}
                size={95}
                strokeWidth={7}
                label="Water Log"
                unit="ml"
                color="#38bdf8"
              />
              <button
                onClick={() => logWater(250)}
                className="mt-2 text-[10px] px-2 py-1 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition-colors"
              >
                +250 ml glass
              </button>
            </div>
          </div>

          {/* Calorie & Sleep Strip */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300">Nutrition Calories</span>
              </div>
              <span className="font-semibold text-white tabular-nums">
                {dailyNutritionSummary.calories} / {dailyNutritionSummary.targetCalories} kcal
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300">Sleep Rest</span>
              </div>
              <span className="font-semibold text-white tabular-nums">
                {latestSleep.durationHours} hrs (Quality: {latestSleep.qualityRating}/5)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary 2-Column Split: Today's Medication Schedule & Physical Exercise Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Prescribed Medication Schedule */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-400" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Today's Prescriptions</h3>
                <p className="text-xs text-slate-400">Adhere strictly to your physician's prescribed schedule</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('medications')}
              className="text-xs text-teal-400 hover:text-teal-300 font-medium"
            >
              Manage →
            </button>
          </div>

          <div className="space-y-3">
            {medications.map((med) => {
              const activeSlots = (['morning', 'afternoon', 'evening', 'night'] as const).filter(
                (slot) => med.timing[slot]
              );

              return (
                <div
                  key={med.id}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{med.name}</h4>
                      <p className="text-xs text-slate-400">
                        {med.dosage} · Prescribed by {med.prescribedBy}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    "{med.doctorInstructions}"
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800/60">
                    {activeSlots.map((slot) => {
                      const status = med.todayStatus[slot];
                      const isTaken = status === 'taken';

                      return (
                        <button
                          key={slot}
                          onClick={() =>
                            updateMedicationStatus(med.id, slot, isTaken ? 'pending' : 'taken')
                          }
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                            isTaken
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                          }`}
                        >
                          <CheckCircle
                            className={`w-3.5 h-3.5 ${
                              isTaken ? 'text-teal-400 fill-teal-400/20' : 'text-slate-500'
                            }`}
                          />
                          <span className="capitalize">{slot}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({isTaken ? 'Taken' : 'Pending'})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Physical Activities & Upcoming Calendar Reminders */}
        <div className="space-y-6">
          {/* Exercise Checklist */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Daily Exercise Progress</h3>
                  <p className="text-xs text-slate-400">Suitable activities based on your age and health profile</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('exercise')}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium"
              >
                View Exercises →
              </button>
            </div>

            <div className="space-y-2">
              {exercises.slice(0, 3).map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => toggleExerciseCompleted(ex.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    ex.completedToday
                      ? 'bg-teal-950/20 border-teal-500/30 text-slate-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle
                      className={`w-4 h-4 ${
                        ex.completedToday ? 'text-teal-400 fill-teal-400/20' : 'text-slate-600'
                      }`}
                    />
                    <div>
                      <p className={`text-xs font-semibold ${ex.completedToday ? 'text-white' : 'text-slate-300'}`}>
                        {ex.name}
                      </p>
                      <span className="text-[11px] text-slate-500">
                        {ex.category} · {ex.durationMinutes} mins · {ex.difficulty}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {ex.completedToday ? 'Completed' : 'To Do'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Reminders Strip */}
          <div className="p-4 rounded-xl glass-panel border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Calendar className="w-4 h-4 text-teal-400" />
                <span>Upcoming Reminders & Checkups</span>
              </div>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-[11px] text-teal-400 hover:text-teal-300"
              >
                Full Calendar →
              </button>
            </div>

            <div className="space-y-2">
              {calendarEvents.slice(0, 2).map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <p className="font-medium text-white">{ev.title}</p>
                      <span className="text-[11px] text-slate-400">{ev.date} · {ev.time}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono capitalize px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                    {ev.type.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
