/**
 * Health math calculations and clinical reference range evaluations.
 * Pure deterministic functions decoupled from UI for testability.
 */

export interface BmiResult {
  bmi: number;
  category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obese';
  healthyRange: string;
}

export function calculateBMI(weightKg: number, heightCm: number): BmiResult {
  if (weightKg <= 0 || heightCm <= 0) {
    return { bmi: 0, category: 'Normal weight', healthyRange: '18.5 - 24.9' };
  }
  const heightM = heightCm / 100;
  const bmiRaw = weightKg / (heightM * heightM);
  const bmi = Math.round(bmiRaw * 10) / 10;

  let category: BmiResult['category'] = 'Normal weight';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25.0) category = 'Normal weight';
  else if (bmi < 30.0) category = 'Overweight';
  else category = 'Obese';

  return {
    bmi,
    category,
    healthyRange: '18.5 - 24.9',
  };
}

export function calculateWaterTarget(weightKg: number, activityLevel: 'sedentary' | 'moderate' | 'active' | 'athlete' = 'moderate'): number {
  // Baseline ~35ml per kg + activity compensation
  const baseMl = (weightKg > 0 ? weightKg : 70) * 35;
  const activityBonus: Record<string, number> = {
    sedentary: 0,
    moderate: 350,
    active: 700,
    athlete: 1000,
  };
  return Math.round(baseMl + (activityBonus[activityLevel] || 350));
}

export function calculateDailyCalories(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female' | 'other' = 'male',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete' | 'very_active' = 'moderate'
): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 2000;
  
  // Mifflin-St Jeor Equation
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr += 5;
  }

  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9,
    very_active: 1.9,
  };

  const factor = multipliers[activityLevel] || 1.55;
  return Math.round(bmr * factor);
}

export function classifyBloodPressure(systolic: number, diastolic: number): {
  status: 'Normal' | 'Elevated' | 'Stage 1' | 'Stage 2' | 'Hypertensive Crisis' | 'Invalid';
  color: string;
  advice: string;
} {
  if (systolic <= 0 || diastolic <= 0) {
    return { status: 'Invalid', color: 'text-slate-400', advice: 'Enter valid blood pressure readings.' };
  }
  if (systolic > 180 || diastolic > 120) {
    return {
      status: 'Hypertensive Crisis',
      color: 'text-rose-500',
      advice: 'Urgent: Seek immediate medical evaluation if verified.'
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      status: 'Stage 2',
      color: 'text-amber-500',
      advice: 'Consistently higher than standard targets. Discuss with your physician.'
    };
  }
  if ((systolic >= 130 && systolic < 140) || (diastolic >= 80 && diastolic < 90)) {
    return {
      status: 'Stage 1',
      color: 'text-amber-400',
      advice: 'Mild elevation. Lifestyle adjustments and medical consultation recommended.'
    };
  }
  if (systolic >= 120 && systolic < 130 && diastolic < 80) {
    return {
      status: 'Elevated',
      color: 'text-sky-400',
      advice: 'Borderline systolic reading. Regular monitoring and hydration beneficial.'
    };
  }
  return {
    status: 'Normal',
    color: 'text-teal-400',
    advice: 'Within general optimal clinical thresholds.'
  };
}

export function classifyBloodGlucose(fastingMgDl: number): {
  status: 'Normal Fasting' | 'Impaired Fasting / Pre-diabetes' | 'Elevated / Diabetes Range' | 'Hypoglycemia Risk';
  color: string;
} {
  if (fastingMgDl < 70) return { status: 'Hypoglycemia Risk', color: 'text-amber-400' };
  if (fastingMgDl <= 99) return { status: 'Normal Fasting', color: 'text-teal-400' };
  if (fastingMgDl <= 125) return { status: 'Impaired Fasting / Pre-diabetes', color: 'text-amber-400' };
  return { status: 'Elevated / Diabetes Range', color: 'text-rose-400' };
}

export function checkLabValue(value: number, min: number, max: number): {
  status: 'Low' | 'Normal' | 'High';
  isOutOfRange: boolean;
  color: string;
} {
  if (value < min) {
    return { status: 'Low', isOutOfRange: true, color: 'text-amber-400' };
  }
  if (value > max) {
    return { status: 'High', isOutOfRange: true, color: 'text-rose-400' };
  }
  return { status: 'Normal', isOutOfRange: false, color: 'text-teal-400' };
}
