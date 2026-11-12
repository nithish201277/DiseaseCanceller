import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBMI,
  calculateWaterTarget,
  calculateDailyCalories,
  classifyBloodPressure,
  classifyBloodGlucose,
  checkLabValue
} from './healthMath';

test('BMI calculation for normal adult', () => {
  const res = calculateBMI(70, 175);
  // 70 / (1.75 * 1.75) = 22.857 -> 22.9
  assert.equal(res.bmi, 22.9);
  assert.equal(res.category, 'Normal weight');
});

test('BMI calculation handles underweight and overweight', () => {
  const under = calculateBMI(45, 170);
  assert.equal(under.category, 'Underweight');

  const over = calculateBMI(85, 170);
  assert.equal(over.category, 'Overweight');

  const obese = calculateBMI(110, 170);
  assert.equal(obese.category, 'Obese');
});

test('Water target accounts for weight and activity bonus', () => {
  // 70kg * 35 = 2450 + 350 = 2800
  const target = calculateWaterTarget(70, 'moderate');
  assert.equal(target, 2800);

  const athlete = calculateWaterTarget(80, 'athlete');
  // 80 * 35 = 2800 + 1000 = 3800
  assert.equal(athlete, 3800);
});

test('Blood pressure classification identifies stages', () => {
  const normal = classifyBloodPressure(118, 76);
  assert.equal(normal.status, 'Normal');

  const elevated = classifyBloodPressure(124, 76);
  assert.equal(elevated.status, 'Elevated');

  const stage1 = classifyBloodPressure(134, 84);
  assert.equal(stage1.status, 'Stage 1');

  const crisis = classifyBloodPressure(190, 125);
  assert.equal(crisis.status, 'Hypertensive Crisis');
});

test('Blood glucose classification detects fasting ranges', () => {
  assert.equal(classifyBloodGlucose(88).status, 'Normal Fasting');
  assert.equal(classifyBloodGlucose(115).status, 'Impaired Fasting / Pre-diabetes');
  assert.equal(classifyBloodGlucose(150).status, 'Elevated / Diabetes Range');
  assert.equal(classifyBloodGlucose(65).status, 'Hypoglycemia Risk');
});

test('Lab reference range checking marks deviations', () => {
  const inRange = checkLabValue(14.2, 13.5, 17.5);
  assert.equal(inRange.status, 'Normal');
  assert.equal(inRange.isOutOfRange, false);

  const low = checkLabValue(11.0, 13.5, 17.5);
  assert.equal(low.status, 'Low');
  assert.equal(low.isOutOfRange, true);

  const high = checkLabValue(19.0, 13.5, 17.5);
  assert.equal(high.status, 'High');
  assert.equal(high.isOutOfRange, true);
});
