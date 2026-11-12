export type NavTab =
  | 'dashboard'
  | 'profile'
  | 'reports'
  | 'assistant'
  | 'nutrition'
  | 'exercise'
  | 'medications'
  | 'water'
  | 'sleep'
  | 'calendar'
  | 'family'
  | 'doctor-prep';

export type AgeCategory = 'child' | 'adult' | 'senior';

export interface UserProfile {
  id: string;
  fullName: string;
  age: number;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  city: string;
  country: string;
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number;
  existingConditions: string[];
  allergies: string[];
  currentSymptoms: string[];
  prescribedMedicationsSummary: string[];
  previousSurgeries: string[];
  dietaryPreference: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'jain' | 'pescatarian' | 'diabetic-friendly';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
  ageCategory: AgeCategory;
  guardianConsentProvided?: boolean;
  dataProcessingConsent: boolean;
  avatarUrl?: string;
  relation?: string;
}

export interface VitalRecord {
  id: string;
  timestamp: string;
  systolicBP: number;
  diastolicBP: number;
  fastingGlucoseMgDl?: number;
  postPrandialGlucoseMgDl?: number;
  heartRateBpm: number;
  spO2Percent: number;
  weightKg?: number;
  isDemonstrationData?: boolean;
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  timing: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  startDate: string;
  endDate?: string;
  doctorInstructions: string;
  prescribedBy: string;
  todayStatus: {
    morning: 'taken' | 'skipped' | 'pending';
    afternoon: 'taken' | 'skipped' | 'pending';
    evening: 'taken' | 'skipped' | 'pending';
    night: 'taken' | 'skipped' | 'pending';
  };
}

export interface RecipeItem {
  id: string;
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Healthy Snack';
  cuisine: 'Indian' | 'South Indian' | 'Mediterranean' | 'Global Healthy' | 'Ayurvedic Inspired';
  dietType: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Jain Friendly';
  isBudgetFriendly: boolean;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  servingSize: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  imageUrl?: string;
  ingredients: { item: string; amount: string }[];
  instructions: string[];
  healthyAlternatives: string;
  suitableForConditions: string[];
}

export interface LoggedMeal {
  id: string;
  date: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  foodName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface ExerciseItem {
  id: string;
  name: string;
  category: 'Walking' | 'Stretching' | 'Strength' | 'Flexibility' | 'Breathing & Relaxation';
  difficulty: 'Beginner' | 'Intermediate' | 'Gentle / Senior';
  durationMinutes: number;
  targetMuscles: string[];
  instructions: string[];
  safetyPrecautions: string[];
  completedToday?: boolean;
  youtubeId?: string;
  youtubeTitle?: string;
  youtubeChannel?: string;
  suitableAge: ('child' | 'adult' | 'senior')[];
}

export interface LabParameter {
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'Low' | 'High';
  explanation: string;
}

export interface MedicalReport {
  id: string;
  reportTitle: string;
  reportDate: string;
  laboratoryName: string;
  reportType: 'Complete Blood Count (CBC)' | 'Lipid Profile' | 'Thyroid Profile' | 'Metabolic & Glucose' | 'Comprehensive Panel';
  summary: string;
  parameters: LabParameter[];
  clinicalQuestionsForDoctor: string[];
  fileName?: string;
}

export interface WaterLog {
  id: string;
  timestamp: string;
  amountMl: number;
}

export interface SleepLog {
  id: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  durationHours: number;
  qualityRating: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'medication' | 'exercise' | 'doctor-appointment' | 'checkup' | 'lab-test';
  date: string;
  time: string;
  notes?: string;
  completed?: boolean;
}

export interface DoctorQuestion {
  id: string;
  category: 'Symptoms' | 'Medications' | 'Lab Results' | 'Lifestyle';
  question: string;
  answeredByDoctor?: boolean;
  doctorNotes?: string;
}
