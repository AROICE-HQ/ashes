// Test the advanced age calculation
// This file can be used to test the life-calculator.js functions
// Run with: node test-calculator.js

const {
  calculateAdvancedLifeExpectancy,
  getBMIAnalysis,
  generateHealthRecommendations
} = require('./life-calculator.js');

console.log('Testing Advanced Life Expectancy Calculator...');

// Test case 1: Healthy young adult
const healthyProfile = {
  gender: 'male',
  country: 'us',
  currentAge: 25,
  bmi: 22.5,
  smoking: false,
  alcoholConsumption: 'moderate',
  fitnessLevel: 'active',
  dietQuality: 'good',
  stressLevel: 'low',
  sleepQuality: 'good',
  mentalOutlook: 'optimistic'
};

console.log('Healthy profile result:', calculateAdvancedLifeExpectancy(healthyProfile));

// Test case 2: High-risk profile
const riskProfile = {
  gender: 'male',
  country: 'us',
  currentAge: 45,
  bmi: 32,
  smoking: true,
  packsPerDay: 2,
  smokingYears: 20,
  alcoholConsumption: 'heavy',
  fitnessLevel: 'sedentary',
  dietQuality: 'poor',
  stressLevel: 'high',
  sleepQuality: 'poor',
  mentalOutlook: 'pessimistic'
};

console.log('High-risk profile result:', calculateAdvancedLifeExpectancy(riskProfile));

// Test BMI analysis
console.log('BMI 18:', getBMIAnalysis(18));
console.log('BMI 25:', getBMIAnalysis(25));
console.log('BMI 35:', getBMIAnalysis(35));

// Test recommendations
const recommendations = generateHealthRecommendations(riskProfile, calculateAdvancedLifeExpectancy(riskProfile));
console.log('Recommendations:', recommendations);

// --- Regression checks for the 2.5 audit fixes ---
console.log('\n--- Regression checks ---');

function assert(label, condition) {
  console.log(`${condition ? 'PASS' : 'FAIL'}: ${label}`);
  if (!condition) process.exitCode = 1;
}

// Gender 'other' must not produce NaN (was crashing the whole calculation)
const otherGenderResult = calculateAdvancedLifeExpectancy({ gender: 'other', country: 'us', currentAge: 30 });
assert('gender=other does not produce NaN', !Number.isNaN(otherGenderResult.adjustedLifespan));

// Life Factors form values must now actually move the number (were 100% dead)
const baseline = calculateAdvancedLifeExpectancy({ gender: 'male', country: 'us', currentAge: 30 });
const withExercise = calculateAdvancedLifeExpectancy({ gender: 'male', country: 'us', currentAge: 30, exerciseFrequency: '5-6' });
assert('exerciseFrequency="5-6" (HTML value) changes the result', withExercise.adjustedLifespan !== baseline.adjustedLifespan);

const withSteps = calculateAdvancedLifeExpectancy({ gender: 'male', country: 'us', currentAge: 30, dailySteps: '10k+' });
assert('dailySteps="10k+" (HTML value) changes the result', withSteps.adjustedLifespan !== baseline.adjustedLifespan);

const withOutlook = calculateAdvancedLifeExpectancy({ gender: 'male', country: 'us', currentAge: 30, mentalOutlook: 'very-optimistic' });
assert('mentalOutlook="very-optimistic" (HTML value) changes the result', withOutlook.adjustedLifespan !== baseline.adjustedLifespan);

const withDuration = calculateAdvancedLifeExpectancy({ gender: 'male', country: 'us', currentAge: 30, exerciseFrequency: '3-4', exerciseDuration: '90+' });
const withoutDuration = calculateAdvancedLifeExpectancy({ gender: 'male', country: 'us', currentAge: 30, exerciseFrequency: '3-4' });
assert('exerciseDuration now affects the result', withDuration.adjustedLifespan !== withoutDuration.adjustedLifespan);

// Former smokers should be penalized less than current smokers, same pack-years
const currentSmoker = calculateAdvancedLifeExpectancy({ gender: 'male', country: 'us', currentAge: 40, smoking: true, smokingStatus: 'true', packsPerDay: 1, smokingYears: 15 });
const formerSmoker = calculateAdvancedLifeExpectancy({ gender: 'male', country: 'us', currentAge: 40, smoking: true, smokingStatus: 'former', packsPerDay: 1, smokingYears: 15 });
assert('former smoker penalized less than current smoker (same pack-years)', formerSmoker.adjustedLifespan > currentSmoker.adjustedLifespan);

console.log('--- End regression checks ---\n');
