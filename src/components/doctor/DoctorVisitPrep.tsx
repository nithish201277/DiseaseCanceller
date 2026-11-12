import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { DoctorQuestion } from '../../types';
import {
  Stethoscope,
  Plus,
  Printer,
  Sparkles,
  HelpCircle,
  FileText,
  Trash2,
  CheckCircle2,
  Calendar,
  X,
  ChevronDown,
} from 'lucide-react';
import { prepareDoctorBriefing } from '../../services/api';
import { SafetyDisclaimerBanner } from '../common/ChartComponents';

export const DoctorVisitPrep: React.FC = () => {
  const {
    activeProfile,
    doctorQuestions,
    addDoctorQuestion,
    deleteDoctorQuestion,
    vitalsHistory,
    medications,
    reports,
  } = useHealth();

  const [newQuestionText, setNewQuestionText] = useState('');
  const [newCategory, setNewCategory] = useState<DoctorQuestion['category']>('Symptoms');
  const [isGeneratingAiBriefing, setIsGeneratingAiBriefing] = useState(false);
  const [aiBriefingResult, setAiBriefingResult] = useState<any>(null);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    addDoctorQuestion({
      category: newCategory,
      question: newQuestionText.trim(),
      answeredByDoctor: false,
    });

    setNewQuestionText('');
  };

  const handleGenerateAiBriefing = async () => {
    setIsGeneratingAiBriefing(true);
    try {
      const recentVitals = vitalsHistory.slice(-5);
      const briefing = await prepareDoctorBriefing({
        profile: {
          fullName: activeProfile.fullName,
          age: activeProfile.age,
          gender: activeProfile.gender,
        },
        activeConditions: activeProfile.existingConditions,
        medications: medications.map((m) => `${m.name} ${m.dosage} (${m.doctorInstructions})`),
        recentReadings: recentVitals.map((v) => ({
          date: v.timestamp.split('T')[0],
          bp: `${v.systolicBP}/${v.diastolicBP}`,
          glucose: v.fastingGlucoseMgDl,
        })),
        concernNotes: 'Routine quarterly checkup, vitals trend review, and dosage tolerance check.',
      });

      setAiBriefingResult(briefing);

      // Add any generated questions that aren't already present
      if (briefing.keyQuestions && Array.isArray(briefing.keyQuestions)) {
        briefing.keyQuestions.forEach((q: string) => {
          if (!doctorQuestions.some((dq) => dq.question === q)) {
            addDoctorQuestion({
              category: 'Lab Results',
              question: q,
              answeredByDoctor: false,
            });
          }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAiBriefing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const latestVital = vitalsHistory[vitalsHistory.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
            <Stethoscope className="w-4 h-4" />
            <span>Physician Consultation Organizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Doctor Visit Preparation
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Organize questions, vitals trends, and current prescriptions into a high-value clinical summary for {activeProfile.fullName}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateAiBriefing}
            disabled={isGeneratingAiBriefing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-sky-500 hover:opacity-90 text-slate-950 font-bold text-xs transition-opacity shadow-md shadow-teal-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingAiBriefing ? 'Synthesizing...' : 'AI Prepare Briefing'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-teal-400" />
            <span>Print Clinical Summary</span>
          </button>
        </div>
      </div>

      <SafetyDisclaimerBanner />

      {/* Printable Clinical Summary Preview Card */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-5 print:bg-white print:text-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Patient Consultation Briefing Sheet</h3>
            <p className="text-xs text-slate-400">
              Generated for appointment discussion with primary healthcare provider
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Date: {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Demographics & Current Vitals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Patient Name</span>
            <span className="font-bold text-white">{activeProfile.fullName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Age / Gender</span>
            <span className="font-bold text-white capitalize">{activeProfile.age} yrs · {activeProfile.gender}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Latest Blood Pressure</span>
            <span className="font-bold text-rose-300 tabular-nums">
              {latestVital ? `${latestVital.systolicBP}/${latestVital.diastolicBP} mmHg` : '120/80 mmHg'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Fasting Glucose</span>
            <span className="font-bold text-amber-300 tabular-nums">
              {latestVital?.fastingGlucoseMgDl ? `${latestVital.fastingGlucoseMgDl} mg/dL` : '98 mg/dL'}
            </span>
          </div>
        </div>

        {/* Current Active Conditions & Medications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <h4 className="font-bold text-teal-300 uppercase tracking-wider text-[11px]">
              Active Diagnosed Conditions
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {activeProfile.existingConditions.length > 0 ? (
                activeProfile.existingConditions.map((c, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-800"
                  >
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">None reported</span>
              )}
            </div>
            {activeProfile.allergies.length > 0 && (
              <p className="text-[11px] text-rose-300 pt-1">
                <strong>Known Allergies:</strong> {activeProfile.allergies.join(', ')}
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
            <h4 className="font-bold text-teal-300 uppercase tracking-wider text-[11px]">
              Current Prescribed Medications ({medications.length})
            </h4>
            <ul className="space-y-1 text-slate-300">
              {medications.map((m) => (
                <li key={m.id} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">{m.name} {m.dosage}</span>
                  <span className="text-[11px] text-slate-400">{m.doctorInstructions}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI Synthesized Topics if generated */}
        {aiBriefingResult && (
          <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/30 space-y-3">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
              AI Clinical Briefing Summary:
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">{aiBriefingResult.summary}</p>
            {aiBriefingResult.organizedTopics && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                {aiBriefingResult.organizedTopics.map((item: any, i: number) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="font-bold text-white block">{item.topic}</span>
                    <span className="text-[11px] text-slate-400">{item.detail}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Questions for Doctor */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">
              Questions Prepared for Your Doctor ({doctorQuestions.length})
            </h3>
            <p className="text-xs text-slate-400">
              Prioritize topics so nothing is missed during your consultation
            </p>
          </div>
        </div>

        {/* Add Question Input */}
        <form onSubmit={handleAddQuestion} className="flex flex-col sm:flex-row gap-2">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as any)}
            className="px-3 py-2 rounded-lg glass-input text-xs"
          >
            <option value="Symptoms">Symptoms</option>
            <option value="Medications">Medications</option>
            <option value="Lab Results">Lab Results</option>
            <option value="Lifestyle">Diet / Exercise</option>
          </select>

          <input
            type="text"
            required
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            placeholder="Type your question for the doctor..."
            className="flex-1 px-3 py-2 rounded-lg glass-input text-xs"
          />

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs whitespace-nowrap shadow-md shadow-teal-500/20"
          >
            Add Question
          </button>
        </form>

        {/* Questions list */}
        <div className="space-y-2 pt-2">
          {doctorQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-teal-400 font-bold text-xs">{idx + 1}.</span>
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 mr-2">
                    {q.category}
                  </span>
                  <span className="text-xs text-slate-200 leading-relaxed font-medium">
                    {q.question}
                  </span>
                </div>
              </div>

              <button
                onClick={() => deleteDoctorQuestion(q.id)}
                className="p-1 text-slate-500 hover:text-rose-400"
                title="Remove question"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
