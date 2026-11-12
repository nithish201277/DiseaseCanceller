import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { CalendarEvent } from '../../types';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle,
  Pill,
  Dumbbell,
  Stethoscope,
  Activity,
  X,
  Filter,
} from 'lucide-react';

export const HealthCalendar: React.FC = () => {
  const { calendarEvents, addCalendarEvent, toggleCalendarEventCompleted, activeProfile } =
    useHealth();

  const [filterType, setFilterType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEvent['type']>('doctor-appointment');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [notes, setNotes] = useState('');

  const filteredEvents = calendarEvents.filter((ev) => {
    if (filterType === 'all') return true;
    return ev.type === filterType;
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addCalendarEvent({
      title: title.trim(),
      type,
      date,
      time,
      notes: notes.trim() || undefined,
      completed: false,
    });

    setTitle('');
    setNotes('');
    setShowAddModal(false);
  };

  const getTypeIcon = (evType: CalendarEvent['type']) => {
    switch (evType) {
      case 'medication':
        return <Pill className="w-4 h-4 text-teal-400" />;
      case 'exercise':
        return <Dumbbell className="w-4 h-4 text-sky-400" />;
      case 'doctor-appointment':
        return <Stethoscope className="w-4 h-4 text-rose-400" />;
      default:
        return <Activity className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <CalendarIcon className="w-4 h-4" />
            <span>Unified Healthcare Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Health Calendar & Reminders
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Sync medication dosages, exercise sessions, and medical appointments for {activeProfile.fullName}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-teal-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reminder / Appointment</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'doctor-appointment', label: 'Doctor Appointments' },
          { id: 'medication', label: 'Medications' },
          { id: 'exercise', label: 'Exercise Sessions' },
          { id: 'checkup', label: 'Health Checkups' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilterType(item.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === item.id
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Events Timeline List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-panel border border-slate-800 text-slate-400 text-xs">
            No events scheduled under this filter category.
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                ev.completed
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : 'glass-panel border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                <button
                  onClick={() => toggleCalendarEventCompleted(ev.id)}
                  className="mt-0.5 sm:mt-0 p-1 rounded-lg text-slate-400 hover:text-teal-400"
                  title="Toggle completed"
                >
                  <CheckCircle
                    className={`w-5 h-5 ${
                      ev.completed ? 'text-teal-400 fill-teal-400/20' : 'text-slate-600'
                    }`}
                  />
                </button>

                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                  {getTypeIcon(ev.type)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm font-bold ${
                        ev.completed ? 'line-through text-slate-400' : 'text-white'
                      }`}
                    >
                      {ev.title}
                    </h4>
                    <span className="text-[10px] font-mono capitalize px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                      {ev.type.replace('-', ' ')}
                    </span>
                  </div>
                  {ev.notes && <p className="text-xs text-slate-400 mt-0.5">{ev.notes}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0 self-end sm:self-center font-mono">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                  {ev.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {ev.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl glass-panel border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Add Calendar Event / Reminder</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Title / Event Description</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dr. Deshmukh Consultation, Fasting Blood Test..."
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Event Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                >
                  <option value="doctor-appointment">Doctor Appointment</option>
                  <option value="medication">Medication Dose</option>
                  <option value="exercise">Exercise / Walk Session</option>
                  <option value="checkup">Health Checkup</option>
                  <option value="lab-test">Laboratory Test</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Time</label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Preparation Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Bring recent fasting glucose log..."
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
