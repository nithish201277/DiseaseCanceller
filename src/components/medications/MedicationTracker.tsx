import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { MedicationItem } from '../../types';
import {
  Pill,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Bell,
  Trash2,
  Calendar,
  ShieldAlert,
  X,
  Check,
} from 'lucide-react';
import { SafetyDisclaimerBanner } from '../common/ChartComponents';

export const MedicationTracker: React.FC = () => {
  const {
    medications,
    addMedication,
    updateMedicationStatus,
    deleteMedication,
    notificationPermissionGranted,
    requestNotificationPermission,
    activeProfile,
  } = useHealth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [instructions, setInstructions] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [timing, setTiming] = useState({
    morning: true,
    afternoon: false,
    evening: false,
    night: false,
  });

  // Calculate adherence
  let totalDoses = 0;
  let takenDoses = 0;
  medications.forEach((m) => {
    (['morning', 'afternoon', 'evening', 'night'] as const).forEach((slot) => {
      if (m.timing[slot]) {
        totalDoses += 1;
        if (m.todayStatus[slot] === 'taken') takenDoses += 1;
      }
    });
  });
  const adherencePercent = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim() || !dosage.trim()) return;

    addMedication({
      name: medName.trim(),
      dosage: dosage.trim(),
      timing,
      startDate,
      endDate: endDate.trim() || undefined,
      doctorInstructions: instructions.trim() || 'Take as directed by your physician.',
      prescribedBy: prescribedBy.trim() || 'Primary Care Physician',
    });

    setMedName('');
    setDosage('');
    setInstructions('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <Pill className="w-4 h-4" />
            <span>Doctor Prescription Schedule & Adherence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Medicine Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Track daily doses exactly as prescribed by your treating physician for {activeProfile.fullName}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!notificationPermissionGranted && (
            <button
              onClick={requestNotificationPermission}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-teal-400" />
              <span>Enable Browser Alerts</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-teal-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Prescription</span>
          </button>
        </div>
      </div>

      <SafetyDisclaimerBanner />

      {/* Adherence Rate Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Today's Adherence Rate</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-white tabular-nums">{adherencePercent}%</span>
              <span className="text-xs text-teal-400">({takenDoses}/{totalDoses} doses)</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-teal-500/30 flex items-center justify-center font-bold text-teal-400 text-xs tabular-nums">
            {adherencePercent}%
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Active Prescriptions</span>
            <p className="text-2xl font-bold text-white tabular-nums mt-1">{medications.length}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400">
            <Pill className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Reminder Timing Status</span>
            <p className="text-xs font-semibold text-teal-300 mt-1">
              {notificationPermissionGranted ? 'Active Desktop Notifications' : 'In-App Alerts Active'}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Daily Medication Checklist */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Daily Prescription Schedule</h3>

        <div className="grid grid-cols-1 gap-4">
          {medications.map((med) => (
            <div
              key={med.id}
              className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white">{med.name}</h4>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                      {med.dosage}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Prescribed by: <strong className="text-slate-300">{med.prescribedBy}</strong> · Started: {med.startDate}
                    {med.endDate && ` · Until: ${med.endDate}`}
                  </p>
                </div>

                <button
                  onClick={() => deleteMedication(med.id)}
                  className="self-end sm:self-auto p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Remove medication"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Instructions Callout */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <span className="font-semibold text-slate-400 block mb-0.5">Doctor's Direct Instructions:</span>
                "{med.doctorInstructions}"
              </div>

              {/* Timing Slots */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-400">Daily Dosage Check:</span>
                <div className="flex flex-wrap gap-2">
                  {(['morning', 'afternoon', 'evening', 'night'] as const).map((slot) => {
                    if (!med.timing[slot]) return null;
                    const status = med.todayStatus[slot];
                    const isTaken = status === 'taken';
                    const isSkipped = status === 'skipped';

                    return (
                      <div
                        key={slot}
                        className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900/90 border border-slate-800"
                      >
                        <button
                          onClick={() =>
                            updateMedicationStatus(
                              med.id,
                              slot,
                              isTaken ? 'pending' : 'taken'
                            )
                          }
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                            isTaken
                              ? 'bg-teal-500 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span className="capitalize">{slot}</span>
                          <span className="text-[10px] opacity-75">
                            ({isTaken ? 'Taken' : 'Take'})
                          </span>
                        </button>

                        <button
                          onClick={() =>
                            updateMedicationStatus(
                              med.id,
                              slot,
                              isSkipped ? 'pending' : 'skipped'
                            )
                          }
                          className={`px-1.5 py-1 rounded-md text-[10px] font-mono transition-colors ${
                            isSkipped ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500 hover:text-slate-300'
                          }`}
                          title="Mark skipped"
                        >
                          Skip
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Prescribed Medication</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Medication Name</label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Telmisartan, Metformin XR, Atorvastatin..."
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Prescribed Dosage</label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 40 mg, 500 mg, 1 tablet..."
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Prescribing Doctor</label>
                  <input
                    type="text"
                    value={prescribedBy}
                    onChange={(e) => setPrescribedBy(e.target.value)}
                    placeholder="e.g. Dr. Deshmukh (Cardiology)"
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  />
                </div>
              </div>

              {/* Timing checkboxes */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Daily Timing Schedule</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['morning', 'afternoon', 'evening', 'night'] as const).map((slot) => (
                    <label
                      key={slot}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        timing[slot]
                          ? 'bg-teal-500/20 border-teal-500/40 text-teal-300 font-semibold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={timing[slot]}
                        onChange={(e) => setTiming({ ...timing, [slot]: e.target.checked })}
                        className="hidden"
                      />
                      <span className="capitalize">{slot}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">End Date (Optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Doctor's Instructions</label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Take immediately after breakfast with water. Avoid grapefruit."
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                >
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
