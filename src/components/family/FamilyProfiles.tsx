import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { UserProfile, AgeCategory } from '../../types';
import {
  Users,
  Plus,
  CheckCircle,
  Shield,
  Heart,
  Baby,
  User,
  Crown,
  ChevronRight,
  X,
  Trash2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { calculateBMI } from '../../utils/healthMath';

export const FamilyProfiles: React.FC = () => {
  const {
    familyProfiles,
    activeProfile,
    switchProfile,
    addFamilyMember,
    deleteProfile,
    setActiveTab,
  } = useHealth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<UserProfile | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New family member form state
  const [fullName, setFullName] = useState('');
  const [relation, setRelation] = useState('Child');
  const [age, setAge] = useState('10');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [ageCategory, setAgeCategory] = useState<AgeCategory>('child');
  const [heightCm, setHeightCm] = useState('140');
  const [weightKg, setWeightKg] = useState('32');
  const [guardianConsent, setGuardianConsent] = useState(true);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const newProfile: UserProfile = {
      id: `profile_family_${Date.now()}`,
      fullName: fullName.trim(),
      age: parseInt(age, 10) || 10,
      dateOfBirth: '2016-01-01',
      gender,
      city: activeProfile.city || 'Bengaluru',
      country: activeProfile.country || 'India',
      heightCm: parseFloat(heightCm) || 140,
      weightKg: parseFloat(weightKg) || 32,
      existingConditions: [],
      allergies: [],
      currentSymptoms: [],
      prescribedMedicationsSummary: [],
      previousSurgeries: [],
      dietaryPreference: activeProfile.dietaryPreference,
      activityLevel: 'moderate',
      ageCategory,
      guardianConsentProvided: ageCategory === 'child' ? guardianConsent : true,
      dataProcessingConsent: true,
      relation,
    };

    addFamilyMember(newProfile);
    setShowAddModal(false);
    setFullName('');
    setActionNotice(`Added ${newProfile.fullName}'s profile.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const confirmDelete = () => {
    if (!profileToDelete) return;
    const deletedName = profileToDelete.fullName;
    deleteProfile(profileToDelete.id);
    setProfileToDelete(null);
    setActionNotice(`Profile for ${deletedName} has been removed.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const getCategoryIcon = (category: AgeCategory) => {
    switch (category) {
      case 'child':
        return <Baby className="w-5 h-5 text-sky-400" />;
      case 'senior':
        return <Crown className="w-5 h-5 text-amber-400" />;
      default:
        return <User className="w-5 h-5 text-teal-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <Users className="w-4 h-4" />
            <span>Multi-Generation Family Wellness</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Family Health Profiles
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Maintain independent records for children, adults, and elderly family members. Add or remove profiles at any time.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-teal-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Family Member</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-500/30 text-xs text-teal-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Guide Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            You have <strong className="text-white">{familyProfiles.length}</strong> active profiles. Click the red trash icon on any member's card to remove their profile.
          </span>
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {familyProfiles.map((member) => {
          const isActive = member.id === activeProfile.id;
          const bmi = calculateBMI(member.weightKg, member.heightCm);

          return (
            <div
              key={member.id}
              className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                isActive
                  ? 'glass-panel border-teal-500/50 ring-1 ring-teal-500/30 shadow-lg shadow-teal-950/40'
                  : 'glass-panel border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      {getCategoryIcon(member.ageCategory)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                        <span>{member.fullName}</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        {member.relation || member.ageCategory} · {member.age} yrs
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isActive && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40">
                        Active
                      </span>
                    )}

                    {/* Remove Profile Button */}
                    <button
                      onClick={() => setProfileToDelete(member)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title={familyProfiles.length > 1 ? `Remove ${member.fullName}'s profile` : 'Reset this profile'}
                      aria-label={`Remove ${member.fullName}'s profile`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Biometrics Summary */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Height</span>
                    <span className="font-semibold text-white tabular-nums">{member.heightCm} cm</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Weight</span>
                    <span className="font-semibold text-white tabular-nums">{member.weightKg} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">BMI</span>
                    <span className="font-semibold text-teal-300 tabular-nums">{bmi.bmi}</span>
                  </div>
                </div>

                {/* Conditions / Allergies summary */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Conditions:</span>
                    <span className="text-slate-200 truncate max-w-[150px]">
                      {member.existingConditions.length > 0
                        ? member.existingConditions.join(', ')
                        : 'None reported'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Diet Preference:</span>
                    <span className="capitalize text-slate-200">{member.dietaryPreference}</span>
                  </div>
                </div>

                {member.ageCategory === 'child' && (
                  <div className="p-2 rounded-lg bg-sky-950/40 border border-sky-500/20 text-[11px] text-sky-200 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Guardian Consent Verified</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                {isActive ? (
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="flex-1 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-semibold border border-teal-500/30 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Edit Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => switchProfile(member.id)}
                    className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 transition-colors"
                  >
                    Switch to {member.fullName.split(' ')[0]}
                  </button>
                )}

                <button
                  onClick={() => setProfileToDelete(member)}
                  className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs transition-colors flex items-center gap-1"
                  title="Remove this profile"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal to Remove Profile */}
      {profileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl glass-panel border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Remove Health Profile?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Are you sure you want to remove <strong className="text-white">{profileToDelete.fullName}</strong> ({profileToDelete.relation || profileToDelete.ageCategory}, {profileToDelete.age} yrs)?
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
              {familyProfiles.length > 1 ? (
                <span>
                  This profile will be permanently deleted from your local family list. If this was your active profile, the dashboard will automatically switch to your next available profile.
                </span>
              ) : (
                <span>
                  This is the only remaining profile. Removing it will reset the dashboard to a fresh default profile.
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProfileToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-md shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Removal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Family Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl glass-panel border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Family Member Profile</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Priya Patel, Aarav Patel..."
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Relationship</label>
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  >
                    <option value="Spouse">Spouse / Partner</option>
                    <option value="Child">Child (Son / Daughter)</option>
                    <option value="Parent">Parent (Mother / Father)</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Grandparent">Grandparent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Age Category</label>
                  <select
                    value={ageCategory}
                    onChange={(e) => setAgeCategory(e.target.value as AgeCategory)}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  >
                    <option value="child">Child (&lt; 18)</option>
                    <option value="adult">Adult (18-64)</option>
                    <option value="senior">Senior (65+)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Age</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg glass-input text-xs tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg glass-input text-xs tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg glass-input text-xs tabular-nums"
                  />
                </div>
              </div>

              {ageCategory === 'child' && (
                <label className="flex items-start gap-2 p-2.5 rounded-lg bg-sky-950/30 border border-sky-500/20 text-xs text-sky-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guardianConsent}
                    onChange={(e) => setGuardianConsent(e.target.checked)}
                    className="mt-0.5 rounded text-teal-500"
                  />
                  <span>
                    I confirm that I am the parent or legal guardian authorizing this pediatric health profile.
                  </span>
                </label>
              )}

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
                  Add Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
