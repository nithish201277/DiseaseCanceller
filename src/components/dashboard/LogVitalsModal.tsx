import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { X, Activity, Heart, Droplet, Scale, CheckCircle2 } from 'lucide-react';
import { classifyBloodPressure, classifyBloodGlucose } from '../../utils/healthMath';

interface LogVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogVitalsModal: React.FC<LogVitalsModalProps> = ({ isOpen, onClose }) => {
  const { addVitalRecord, todayVitals, activeProfile } = useHealth();

  const [systolic, setSystolic] = useState<string>(todayVitals ? todayVitals.systolicBP.toString() : '120');
  const [diastolic, setDiastolic] = useState<string>(todayVitals ? todayVitals.diastolicBP.toString() : '80');
  const [glucose, setGlucose] = useState<string>(todayVitals?.fastingGlucoseMgDl ? todayVitals.fastingGlucoseMgDl.toString() : '98');
  const [heartRate, setHeartRate] = useState<string>(todayVitals ? todayVitals.heartRateBpm.toString() : '72');
  const [spO2, setSpO2] = useState<string>(todayVitals ? todayVitals.spO2Percent.toString() : '99');
  const [weight, setWeight] = useState<string>(activeProfile.weightKg.toString());
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const numSystolic = parseInt(systolic, 10) || 0;
  const numDiastolic = parseInt(diastolic, 10) || 0;
  const numGlucose = parseInt(glucose, 10) || 0;

  const bpStatus = classifyBloodPressure(numSystolic, numDiastolic);
  const glucoseStatus = numGlucose > 0 ? classifyBloodGlucose(numGlucose) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numSystolic <= 0 || numDiastolic <= 0) return;

    addVitalRecord({
      systolicBP: numSystolic,
      diastolicBP: numDiastolic,
      fastingGlucoseMgDl: numGlucose > 0 ? numGlucose : undefined,
      heartRateBpm: parseInt(heartRate, 10) || 72,
      spO2Percent: parseInt(spO2, 10) || 99,
      weightKg: parseFloat(weight) || activeProfile.weightKg,
      isDemonstrationData: false,
    });

    setSuccessNotice(true);
    setTimeout(() => {
      setSuccessNotice(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel shadow-2xl border border-slate-700/80 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Health Measurements</h3>
              <p className="text-xs text-slate-400">
                Log real-time manual readings for {activeProfile.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successNotice ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-teal-400 animate-bounce" />
            <p className="text-base font-semibold text-white">Measurements Logged Successfully</p>
            <p className="text-xs text-slate-400">Your dashboard and trend charts have updated immediately.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* Blood Pressure Row */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Blood Pressure (Systolic / Diastolic)</span>
                <span className={`text-[11px] font-mono ${bpStatus.color}`}>
                  Status: {bpStatus.status}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={60}
                      max={240}
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      placeholder="120"
                      className="w-full px-3 py-2 rounded-lg glass-input text-sm tabular-nums"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500">mmHg</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Systolic (Top number)</span>
                </div>
                <div>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={40}
                      max={140}
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      placeholder="80"
                      className="w-full px-3 py-2 rounded-lg glass-input text-sm tabular-nums"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500">mmHg</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Diastolic (Bottom number)</span>
                </div>
              </div>
            </div>

            {/* Blood Glucose & Heart Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Fasting Glucose</span>
                  {glucoseStatus && (
                    <span className={`text-[10px] font-mono ${glucoseStatus.color}`}>
                      {glucoseStatus.status.split(' ')[0]}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={40}
                    max={400}
                    value={glucose}
                    onChange={(e) => setGlucose(e.target.value)}
                    placeholder="95"
                    className="w-full px-3 py-2 rounded-lg glass-input text-sm tabular-nums"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500">mg/dL</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Heart Rate (Pulse)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={40}
                    max={200}
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    placeholder="72"
                    className="w-full px-3 py-2 rounded-lg glass-input text-sm tabular-nums"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500">BPM</span>
                </div>
              </div>
            </div>

            {/* SpO2 and Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Blood Oxygen (SpO2)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={70}
                    max={100}
                    value={spO2}
                    onChange={(e) => setSpO2(e.target.value)}
                    placeholder="99"
                    className="w-full px-3 py-2 rounded-lg glass-input text-sm tabular-nums"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500">%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Weight</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min={10}
                    max={250}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                    className="w-full px-3 py-2 rounded-lg glass-input text-sm tabular-nums"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500">kg</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
              Note: Readings entered here are tagged as user-entered records and graphed alongside reference intervals.
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-colors shadow-md shadow-teal-500/20"
              >
                Save Measurements
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
