import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { UserProfile, AgeCategory } from '../../types';
import {
  UserCheck,
  Shield,
  Download,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { calculateBMI, calculateDailyCalories } from '../../utils/healthMath';

export const ProfileView: React.FC = () => {
  const { activeProfile, updateProfile, deleteProfile, familyProfiles, exportUserData, clearUserData } = useHealth();

  const [formData, setFormData] = useState<UserProfile>({ ...activeProfile });
  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  // Sync formData when activeProfile changes or when another profile is selected
  React.useEffect(() => {
    setFormData({ ...activeProfile });
  }, [activeProfile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleConfirmDelete = () => {
    const name = activeProfile.fullName;
    deleteProfile(activeProfile.id);
    setShowDeleteModal(false);
    setDeleteNotice(`Profile for ${name} has been removed.`);
    setTimeout(() => setDeleteNotice(null), 3000);
  };

  const addCondition = () => {
    if (newCondition.trim() && !formData.existingConditions.includes(newCondition.trim())) {
      setFormData({
        ...formData,
        existingConditions: [...formData.existingConditions, newCondition.trim()],
      });
      setNewCondition('');
    }
  };

  const removeCondition = (c: string) => {
    setFormData({
      ...formData,
      existingConditions: formData.existingConditions.filter((item) => item !== c),
    });
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !formData.allergies.includes(newAllergy.trim())) {
      setFormData({
        ...formData,
        allergies: [...formData.allergies, newAllergy.trim()],
      });
      setNewAllergy('');
    }
  };

  const removeAllergy = (a: string) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter((item) => item !== a),
    });
  };

  const bmi = calculateBMI(formData.weightKg, formData.heightCm);
  const estimatedCalories = calculateDailyCalories(
    formData.weightKg,
    formData.heightCm,
    formData.age,
    formData.gender === 'female' ? 'female' : 'male',
    formData.activityLevel
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title & Privacy Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <UserCheck className="w-4 h-4" />
            <span>Health Profile & Preferences</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            {formData.fullName}'s Profile
          </h1>
          <p className="text-xs text-slate-400">
            Configure biometric measurements, clinical conditions, and sensitive data preferences.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportUserData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Health JSON</span>
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-medium border border-rose-800/40 transition-colors"
            title="Remove current active profile"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove This Profile</span>
          </button>
          <button
            type="button"
            onClick={clearUserData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-300 text-xs font-medium border border-slate-800 transition-colors"
            title="Reset and clear all saved application data"
          >
            <span>Reset All App Data</span>
          </button>
        </div>
      </div>

      {deleteNotice && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-950/60 border border-teal-500/40 text-xs text-teal-200">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{deleteNotice}</span>
        </div>
      )}

      {savedSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-950/60 border border-teal-500/40 text-xs text-teal-200">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>Health profile changes updated and securely saved to your local storage.</span>
        </div>
      )}

      {/* Delete Profile Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl glass-panel border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Remove Current Profile?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Are you sure you want to remove <strong className="text-white">{activeProfile.fullName}</strong> ({activeProfile.relation || activeProfile.ageCategory}, {activeProfile.age} yrs)?
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
              {familyProfiles.length > 1 ? (
                <span>
                  This profile will be permanently deleted from your saved profiles. The system will automatically switch to your next family member profile.
                </span>
              ) : (
                <span>
                  This is your only profile. Removing it will reset it to default empty values so you can start fresh.
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-md shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Removal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Calculated Biometrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
        <div>
          <span className="text-slate-400">Calculated BMI</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-white tabular-nums">{bmi.bmi}</span>
            <span className="text-teal-400 font-medium">({bmi.category})</span>
          </div>
        </div>
        <div>
          <span className="text-slate-400">Daily Caloric Target</span>
          <p className="text-lg font-bold text-white tabular-nums mt-0.5">
            {estimatedCalories} <span className="text-xs font-normal text-slate-400">kcal/day</span>
          </p>
        </div>
        <div>
          <span className="text-slate-400">Age Classification</span>
          <p className="text-lg font-bold text-white capitalize mt-0.5">
            {formData.ageCategory} ({formData.age} yrs)
          </p>
        </div>
        <div>
          <span className="text-slate-400">Activity Multiplier</span>
          <p className="text-lg font-bold text-white capitalize mt-0.5">
            {formData.activityLevel}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Personal Identification */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-teal-300">
            1. Personal Demographics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Full Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Age</label>
              <input
                type="number"
                required
                min={1}
                max={120}
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs tabular-nums"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Biometrics & Routine Lifestyle */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-teal-300">
            2. Biometrics & Lifestyle Habits
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Height (cm)</label>
              <input
                type="number"
                min={50}
                max={250}
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs tabular-nums"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Current Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min={10}
                max={300}
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs tabular-nums"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Target Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min={10}
                max={300}
                value={formData.targetWeightKg || ''}
                onChange={(e) =>
                  setFormData({ ...formData, targetWeightKg: parseFloat(e.target.value) || undefined })
                }
                className="w-full px-3 py-2 rounded-lg glass-input text-xs tabular-nums"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Dietary Preference</label>
              <select
                value={formData.dietaryPreference}
                onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
              >
                <option value="vegetarian">Vegetarian</option>
                <option value="non-vegetarian">Non-Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="jain">Jain Friendly</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="diabetic-friendly">Diabetic-Friendly / Low Glycemic</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Physical Activity Level</label>
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
              >
                <option value="sedentary">Sedentary (Little or no exercise, desk work)</option>
                <option value="light">Light (Light walking or gentle workouts 1-3 days/week)</option>
                <option value="moderate">Moderate (Moderate exercise/sports 3-5 days/week)</option>
                <option value="active">Active (Hard exercise 6-7 days/week)</option>
                <option value="athlete">Athlete / Very Active (High physical job or training twice/day)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Age Tier Interface</label>
              <select
                value={formData.ageCategory}
                onChange={(e) => setFormData({ ...formData, ageCategory: e.target.value as AgeCategory })}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs"
              >
                <option value="adult">Adult (18-64)</option>
                <option value="child">Child / Pediatric (&lt; 18)</option>
                <option value="senior">Senior (65+)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Clinical Health Background */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-teal-300">
            3. Diagnosed Conditions & Known Allergies
          </h2>

          {/* Existing Conditions */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Existing Diagnosed Health Conditions
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.existingConditions.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-950/60 border border-teal-500/30 text-teal-200 text-xs"
                >
                  <span>{c}</span>
                  <button
                    type="button"
                    onClick={() => removeCondition(c)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCondition();
                  }
                }}
                placeholder="Add condition (e.g. Mild Hypertension, Thyroid)..."
                className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs"
              />
              <button
                type="button"
                onClick={addCondition}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white"
              >
                Add
              </button>
            </div>
          </div>

          {/* Allergies */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-medium text-slate-300">Known Allergies (Food or Drug)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.allergies.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs"
                >
                  <span>{a}</span>
                  <button
                    type="button"
                    onClick={() => removeAllergy(a)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAllergy();
                  }
                }}
                placeholder="Add allergy (e.g. Peanuts, Penicillin)..."
                className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs"
              />
              <button
                type="button"
                onClick={addAllergy}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Consent & Sensitive Data Processing */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-teal-400">
            <Shield className="w-4 h-4" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              4. Consent & Privacy Protection
            </h2>
          </div>

          <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.dataProcessingConsent}
              onChange={(e) => setFormData({ ...formData, dataProcessingConsent: e.target.checked })}
              className="mt-0.5 rounded text-teal-500 focus:ring-teal-400"
            />
            <div className="text-xs space-y-0.5">
              <span className="font-semibold text-white">
                Consent to process personal health information for educational monitoring
              </span>
              <p className="text-slate-400 leading-relaxed">
                I understand that Disease Canceller AI processes health logs and lab records solely to assist my daily wellness tracking and educational literacy. My personal data is never shared with third parties without my instruction.
              </p>
            </div>
          </label>

          {formData.ageCategory === 'child' && (
            <label className="flex items-start gap-3 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.guardianConsentProvided || false}
                onChange={(e) =>
                  setFormData({ ...formData, guardianConsentProvided: e.target.checked })
                }
                className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
              />
              <div className="text-xs space-y-0.5">
                <span className="font-semibold text-amber-200">
                  Guardian / Parental Consent for Minor Record
                </span>
                <p className="text-slate-400 leading-relaxed">
                  As the legal parent or guardian, I authorize the storage and pediatric wellness monitoring of this minor profile.
                </p>
              </div>
            </label>
          )}
        </div>

        {/* Save CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Updates</span>
          </button>
        </div>
      </form>
    </div>
  );
};
