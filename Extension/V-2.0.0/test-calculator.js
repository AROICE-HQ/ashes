// Test the advanced age calculation
// This file can be used to test the life-calculator.js functions

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
