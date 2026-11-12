import React, { useState } from 'react';
import { VitalRecord } from '../../types';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export const SafetyDisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-teal-950/40 border border-teal-500/20 text-xs text-teal-200">
        <ShieldAlert className="w-4 h-4 text-teal-400 shrink-0" />
        <span>Educational health support only. Not a medical diagnostic tool or prescription service. Always consult your physician.</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-950/60 via-slate-900/80 to-sky-950/60 border border-teal-500/20 p-4 text-xs text-slate-300">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-teal-200">Clinical Scope & Medical Safety Notice</h4>
          <p className="leading-relaxed text-slate-300">
            Disease Canceller AI is an intelligent health-monitoring and educational support platform designed to help you understand health data and build daily wellness habits. It does <strong className="text-white">not</strong> diagnose, treat, cure, or cancel disease, nor prescribe or modify medications. In case of acute or emergency medical symptoms, immediately contact emergency services or your nearest emergency medical facility.
          </p>
        </div>
      </div>
    </div>
  );
};

export const CircularProgressRing: React.FC<{
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  unit: string;
  sublabel?: string;
  color?: string;
}> = ({
  value,
  max,
  size = 140,
  strokeWidth = 10,
  label,
  unit,
  sublabel,
  color = '#2dd4bf', // teal-400
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <span className="text-2xl font-bold tracking-tight text-white tabular-nums">
            {value.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-slate-400">{unit}</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-semibold text-slate-200">{label}</p>
        {sublabel && <p className="text-xs text-slate-400">{sublabel}</p>}
      </div>
    </div>
  );
};

export const VitalsTrendChart: React.FC<{ records: VitalRecord[] }> = ({ records }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!records || records.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        No recorded health measurements yet.
      </div>
    );
  }

  const height = 220;
  const width = 640;
  const padding = { top: 20, right: 24, bottom: 40, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Range from 60 to 180 for systolic/diastolic/glucose
  const minY = 60;
  const maxY = 160;

  const getY = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    return padding.top + graphHeight - ((clamped - minY) / (maxY - minY)) * graphHeight;
  };

  const getX = (index: number) => {
    if (records.length <= 1) return padding.left + graphWidth / 2;
    return padding.left + (index / (records.length - 1)) * graphWidth;
  };

  // Build SVG path strings
  const systolicPoints = records.map((r, i) => `${getX(i)},${getY(r.systolicBP)}`).join(' ');
  const diastolicPoints = records.map((r, i) => `${getX(i)},${getY(r.diastolicBP)}`).join(' ');
  const glucosePoints = records
    .filter((r) => r.fastingGlucoseMgDl)
    .map((r) => `${getX(records.indexOf(r))},${getY(r.fastingGlucoseMgDl!)}`)
    .join(' ');

  const activeRecord = hoveredIndex !== null ? records[hoveredIndex] : records[records.length - 1];

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-400 rounded-full" />
            <span className="text-slate-300">Systolic BP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-sky-400 rounded-full" />
            <span className="text-slate-300">Diastolic BP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400 rounded-full" />
            <span className="text-slate-300">Fasting Glucose</span>
          </div>
        </div>

        {activeRecord && (
          <div className="flex items-center gap-3 text-xs bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <span className="text-slate-400">
              {new Date(activeRecord.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}:
            </span>
            <span className="text-rose-300 font-semibold tabular-nums">
              {activeRecord.systolicBP}/{activeRecord.diastolicBP} mmHg
            </span>
            {activeRecord.fastingGlucoseMgDl && (
              <span className="text-amber-300 font-semibold tabular-nums">
                · {activeRecord.fastingGlucoseMgDl} mg/dL
              </span>
            )}
            {activeRecord.isDemonstrationData && (
              <span className="text-slate-400 text-[10px] uppercase font-mono">(Demo sample)</span>
            )}
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden rounded-xl bg-slate-950/60 p-2 border border-slate-800">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          {/* Y-axis gridlines and labels */}
          {[60, 80, 100, 120, 140, 160].map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Normal Optimal BP threshold shading (120/80) */}
          <line
            x1={padding.left}
            y1={getY(120)}
            x2={width - padding.right}
            y2={getY(120)}
            stroke="rgba(45, 212, 191, 0.25)"
            strokeWidth="1"
          />

          {/* Lines */}
          <polyline
            fill="none"
            stroke="#fb7185" // rose-400
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={systolicPoints}
          />
          <polyline
            fill="none"
            stroke="#38bdf8" // sky-400
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={diastolicPoints}
          />
          {glucosePoints && (
            <polyline
              fill="none"
              stroke="#fbbf24" // amber-400
              strokeWidth="2"
              strokeDasharray="3 3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={glucosePoints}
            />
          )}

          {/* Points & interactive hit areas */}
          {records.map((r, i) => {
            const x = getX(i);
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={r.id}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Hover vertical cursor */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={height - padding.bottom}
                    stroke="rgba(255, 255, 255, 0.25)"
                    strokeWidth="1"
                  />
                )}

                {/* Systolic dot */}
                <circle
                  cx={x}
                  cy={getY(r.systolicBP)}
                  r={isHovered ? 5 : 3.5}
                  fill="#fb7185"
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
                {/* Diastolic dot */}
                <circle
                  cx={x}
                  cy={getY(r.diastolicBP)}
                  r={isHovered ? 5 : 3.5}
                  fill="#38bdf8"
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
                {/* Fasting glucose dot */}
                {r.fastingGlucoseMgDl && (
                  <circle
                    cx={x}
                    cy={getY(r.fastingGlucoseMgDl)}
                    r={isHovered ? 4.5 : 3}
                    fill="#fbbf24"
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />
                )}

                {/* X axis date label */}
                <text
                  x={x}
                  y={height - padding.bottom + 16}
                  textAnchor="middle"
                  fill={isHovered ? '#f1f5f9' : '#64748b'}
                  fontSize="10"
                  fontFamily="Plus Jakarta Sans"
                >
                  {new Date(r.timestamp).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Target benchmark: Optimal Blood Pressure &lt; 120/80 mmHg · Fasting Glucose 70-99 mg/dL</span>
        <span className="font-mono text-slate-500">Manual & connected records clearly tagged</span>
      </p>
    </div>
  );
};

export const WeeklyBarChart: React.FC<{
  data: { label: string; value: number; goal: number }[];
  unit: string;
  color?: string;
}> = ({ data, unit, color = '#2dd4bf' }) => {
  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.goal)), 1);

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-2 h-36 items-end pt-4 pb-2 px-2">
        {data.map((d, i) => {
          const heightPercent = Math.min(100, Math.round((d.value / maxVal) * 100));
          const goalPercent = Math.min(100, Math.round((d.goal / maxVal) * 100));
          const isGoalMet = d.value >= d.goal;

          return (
            <div key={i} className="flex flex-col items-center h-full justify-end group relative">
              {/* Tooltip */}
              <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-white text-[10px] px-2 py-0.5 rounded pointer-events-none whitespace-nowrap z-10 tabular-nums">
                {d.value} {unit} / {d.goal}
              </div>

              {/* Bar track */}
              <div className="w-full max-w-[28px] bg-slate-800/80 rounded-t-md h-full flex items-end relative overflow-hidden">
                {/* Goal indicator hairline */}
                <div
                  className="absolute w-full border-t border-dashed border-slate-500/60 z-10 pointer-events-none"
                  style={{ bottom: `${goalPercent}%` }}
                />

                {/* Fill bar */}
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: isGoalMet ? color : 'rgba(45, 212, 191, 0.45)',
                  }}
                />
              </div>

              {/* Day label */}
              <span className="text-[11px] font-medium text-slate-400 mt-2">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
