import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  VitalRecord,
  MedicationItem,
  RecipeItem,
  ExerciseItem,
  MedicalReport,
  LoggedMeal,
  CalendarEvent,
  DoctorQuestion,
  SleepLog,
  NavTab,
} from '../types';
import {
  INITIAL_USER_PROFILE,
  FAMILY_PROFILES,
  INITIAL_VITALS_HISTORY,
  INITIAL_MEDICATIONS,
  INITIAL_RECIPES,
  INITIAL_EXERCISES,
  INITIAL_REPORTS,
  INITIAL_LOGGED_MEALS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_DOCTOR_QUESTIONS,
  INITIAL_SLEEP_LOGS,
} from '../data/mockHealthData';
import { calculateWaterTarget, calculateDailyCalories } from '../utils/healthMath';

interface HealthContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  // Profiles
  activeProfile: UserProfile;
  familyProfiles: UserProfile[];
  switchProfile: (profileId: string) => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  addFamilyMember: (newMember: UserProfile) => void;
  deleteProfile: (profileId: string) => boolean;
  // Vitals
  vitalsHistory: VitalRecord[];
  addVitalRecord: (record: Omit<VitalRecord, 'id' | 'timestamp'>) => void;
  todayVitals: VitalRecord | undefined;
  // Medications
  medications: MedicationItem[];
  addMedication: (med: Omit<MedicationItem, 'id' | 'todayStatus'>) => void;
  updateMedicationStatus: (medId: string, slot: 'morning' | 'afternoon' | 'evening' | 'night', status: 'taken' | 'skipped' | 'pending') => void;
  deleteMedication: (medId: string) => void;
  // Nutrition & Food
  recipes: RecipeItem[];
  loggedMeals: LoggedMeal[];
  addLoggedMeal: (meal: Omit<LoggedMeal, 'id' | 'date'>) => void;
  removeLoggedMeal: (mealId: string) => void;
  dailyNutritionSummary: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
    targetCalories: number;
  };
  // Exercises
  exercises: ExerciseItem[];
  toggleExerciseCompleted: (exerciseId: string) => void;
  dailySteps: number;
  stepGoal: number;
  addSteps: (steps: number) => void;
  // Water Tracker
  todayWaterMl: number;
  waterGoalMl: number;
  logWater: (amountMl: number) => void;
  resetWater: () => void;
  // Sleep Tracker
  sleepLogs: SleepLog[];
  logSleep: (log: Omit<SleepLog, 'id'>) => void;
  // Reports
  reports: MedicalReport[];
  addReport: (report: MedicalReport) => void;
  deleteReport: (reportId: string) => void;
  // Calendar & Doctor Prep
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  toggleCalendarEventCompleted: (eventId: string) => void;
  doctorQuestions: DoctorQuestion[];
  addDoctorQuestion: (q: Omit<DoctorQuestion, 'id'>) => void;
  deleteDoctorQuestion: (qId: string) => void;
  // Notifications & UI state
  notificationPermissionGranted: boolean;
  requestNotificationPermission: () => Promise<void>;
  // Privacy & Data management
  exportUserData: () => void;
  clearUserData: () => void;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

const STORAGE_PREFIX = 'dc_ai_';

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Load or fallback to initial states
  const [familyProfiles, setFamilyProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}family_profiles`);
    return saved ? JSON.parse(saved) : FAMILY_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_PREFIX}active_profile_id`) || INITIAL_USER_PROFILE.id;
  });

  const activeProfile = familyProfiles.find((p) => p.id === activeProfileId) || familyProfiles[0] || INITIAL_USER_PROFILE;

  const [vitalsHistory, setVitalsHistory] = useState<VitalRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}vitals`);
    return saved ? JSON.parse(saved) : INITIAL_VITALS_HISTORY;
  });

  const [medications, setMedications] = useState<MedicationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}medications`);
    return saved ? JSON.parse(saved) : INITIAL_MEDICATIONS;
  });

  const [recipes] = useState<RecipeItem[]>(INITIAL_RECIPES);

  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}logged_meals`);
    return saved ? JSON.parse(saved) : INITIAL_LOGGED_MEALS;
  });

  const [exercises, setExercises] = useState<ExerciseItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}exercises`);
    return saved ? JSON.parse(saved) : INITIAL_EXERCISES;
  });

  const [dailySteps, setDailySteps] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}steps`);
    return saved ? parseInt(saved, 10) : 6420;
  });
  const stepGoal = 8000;

  const [todayWaterMl, setTodayWaterMl] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}water`);
    return saved ? parseInt(saved, 10) : 1750;
  });

  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}sleep`);
    return saved ? JSON.parse(saved) : INITIAL_SLEEP_LOGS;
  });

  const [reports, setReports] = useState<MedicalReport[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}reports`);
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}calendar`);
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_EVENTS;
  });

  const [doctorQuestions, setDoctorQuestions] = useState<DoctorQuestion[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}doctor_questions`);
    return saved ? JSON.parse(saved) : INITIAL_DOCTOR_QUESTIONS;
  });

  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  });

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}family_profiles`, JSON.stringify(familyProfiles));
  }, [familyProfiles]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}active_profile_id`, activeProfileId);
  }, [activeProfileId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}vitals`, JSON.stringify(vitalsHistory));
  }, [vitalsHistory]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}medications`, JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}logged_meals`, JSON.stringify(loggedMeals));
  }, [loggedMeals]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}exercises`, JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}steps`, dailySteps.toString());
  }, [dailySteps]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}water`, todayWaterMl.toString());
  }, [todayWaterMl]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}sleep`, JSON.stringify(sleepLogs));
  }, [sleepLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}reports`, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}calendar`, JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}doctor_questions`, JSON.stringify(doctorQuestions));
  }, [doctorQuestions]);

  // Profile actions
  const switchProfile = (profileId: string) => {
    setActiveProfileId(profileId);
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setFamilyProfiles((prev) =>
      prev.map((p) => (p.id === activeProfile.id ? { ...p, ...updated } : p))
    );
  };

  const addFamilyMember = (newMember: UserProfile) => {
    setFamilyProfiles((prev) => [...prev, newMember]);
    setActiveProfileId(newMember.id);
  };

  const deleteProfile = (profileId: string): boolean => {
    if (familyProfiles.length <= 1) {
      // Reset only remaining profile to fresh default state
      const resetProfile: UserProfile = {
        ...INITIAL_USER_PROFILE,
        id: `profile_${Date.now()}`,
        fullName: 'Default Profile',
        age: 35,
        heightCm: 170,
        weightKg: 68,
        existingConditions: [],
        allergies: [],
        currentSymptoms: [],
        prescribedMedicationsSummary: [],
        previousSurgeries: [],
        relation: 'Self',
      };
      setFamilyProfiles([resetProfile]);
      setActiveProfileId(resetProfile.id);
      return true;
    }

    const remaining = familyProfiles.filter((p) => p.id !== profileId);
    setFamilyProfiles(remaining);

    if (activeProfileId === profileId && remaining.length > 0) {
      setActiveProfileId(remaining[0].id);
    }
    return true;
  };

  // Vitals actions
  const addVitalRecord = (record: Omit<VitalRecord, 'id' | 'timestamp'>) => {
    const newRecord: VitalRecord = {
      ...record,
      id: `v-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isDemonstrationData: false,
    };
    setVitalsHistory((prev) => [...prev, newRecord]);
    if (record.weightKg) {
      updateProfile({ weightKg: record.weightKg });
    }
  };

  const todayVitals = vitalsHistory[vitalsHistory.length - 1];

  // Medications actions
  const addMedication = (med: Omit<MedicationItem, 'id' | 'todayStatus'>) => {
    const newMed: MedicationItem = {
      ...med,
      id: `med-${Date.now()}`,
      todayStatus: {
        morning: 'pending',
        afternoon: 'pending',
        evening: 'pending',
        night: 'pending',
      },
    };
    setMedications((prev) => [...prev, newMed]);
  };

  const updateMedicationStatus = (
    medId: string,
    slot: 'morning' | 'afternoon' | 'evening' | 'night',
    status: 'taken' | 'skipped' | 'pending'
  ) => {
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id !== medId) return med;
        return {
          ...med,
          todayStatus: {
            ...med.todayStatus,
            [slot]: status,
          },
        };
      })
    );
  };

  const deleteMedication = (medId: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== medId));
  };

  // Food actions
  const addLoggedMeal = (meal: Omit<LoggedMeal, 'id' | 'date'>) => {
    const newMeal: LoggedMeal = {
      ...meal,
      id: `m-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setLoggedMeals((prev) => [...prev, newMeal]);
  };

  const removeLoggedMeal = (mealId: string) => {
    setLoggedMeals((prev) => prev.filter((m) => m.id !== mealId));
  };

  const targetCalories = calculateDailyCalories(
    activeProfile.weightKg,
    activeProfile.heightCm,
    activeProfile.age,
    activeProfile.gender === 'female' ? 'female' : 'male',
    activeProfile.activityLevel
  );

  const dailyNutritionSummary = loggedMeals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      proteinG: acc.proteinG + m.proteinG,
      carbsG: acc.carbsG + m.carbsG,
      fatG: acc.fatG + m.fatG,
      fiberG: acc.fiberG + m.fiberG,
      targetCalories,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, targetCalories }
  );

  // Exercise actions
  const toggleExerciseCompleted = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, completedToday: !ex.completedToday } : ex))
    );
  };

  const addSteps = (steps: number) => {
    setDailySteps((prev) => Math.max(0, prev + steps));
  };

  // Water actions
  const waterGoalMl = calculateWaterTarget(
    activeProfile.weightKg,
    activeProfile.activityLevel === 'athlete' ? 'athlete' : activeProfile.activityLevel === 'active' ? 'active' : 'moderate'
  );

  const logWater = (amountMl: number) => {
    setTodayWaterMl((prev) => Math.max(0, prev + amountMl));
  };

  const resetWater = () => {
    setTodayWaterMl(0);
  };

  // Sleep actions
  const logSleep = (log: Omit<SleepLog, 'id'>) => {
    const newLog: SleepLog = { ...log, id: `sl-${Date.now()}` };
    setSleepLogs((prev) => [...prev, newLog]);
  };

  // Report actions
  const addReport = (report: MedicalReport) => {
    setReports((prev) => [report, ...prev]);
  };

  const deleteReport = (reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  // Calendar actions
  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = { ...event, id: `ev-${Date.now()}` };
    setCalendarEvents((prev) => [...prev, newEvent]);
  };

  const toggleCalendarEventCompleted = (eventId: string) => {
    setCalendarEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, completed: !e.completed } : e))
    );
  };

  // Doctor Prep actions
  const addDoctorQuestion = (q: Omit<DoctorQuestion, 'id'>) => {
    const newQ: DoctorQuestion = { ...q, id: `dq-${Date.now()}` };
    setDoctorQuestions((prev) => [...prev, newQ]);
  };

  const deleteDoctorQuestion = (qId: string) => {
    setDoctorQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  // Notifications
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      setNotificationPermissionGranted(res === 'granted');
    }
  };

  // Data Privacy & Export
  const exportUserData = () => {
    const fullBackup = {
      exportDate: new Date().toISOString(),
      platform: 'Disease Canceller AI',
      tagline: 'Understand Your Health. Build a Healthier Tomorrow.',
      disclaimer: 'Personal health data export for patient records. Not a diagnostic document.',
      profile: activeProfile,
      allProfiles: familyProfiles,
      vitalsHistory,
      medications,
      loggedMeals,
      sleepLogs,
      reports,
      calendarEvents,
      doctorQuestions,
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Disease_Canceller_Health_Summary_${activeProfile.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearUserData = () => {
    if (confirm('Are you sure you want to permanently delete your stored personal health logs from this browser? This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <HealthContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeProfile,
        familyProfiles,
        switchProfile,
        updateProfile,
        addFamilyMember,
        deleteProfile,
        vitalsHistory,
        addVitalRecord,
        todayVitals,
        medications,
        addMedication,
        updateMedicationStatus,
        deleteMedication,
        recipes,
        loggedMeals,
        addLoggedMeal,
        removeLoggedMeal,
        dailyNutritionSummary,
        exercises,
        toggleExerciseCompleted,
        dailySteps,
        stepGoal,
        addSteps,
        todayWaterMl,
        waterGoalMl,
        logWater,
        resetWater,
        sleepLogs,
        logSleep,
        reports,
        addReport,
        deleteReport,
        calendarEvents,
        addCalendarEvent,
        toggleCalendarEventCompleted,
        doctorQuestions,
        addDoctorQuestion,
        deleteDoctorQuestion,
        notificationPermissionGranted,
        requestNotificationPermission,
        exportUserData,
        clearUserData,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export function useHealth() {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}
