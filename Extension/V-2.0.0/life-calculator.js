// Advanced Life Expectancy Calculator for Ashes
// Inspired by actuarial science and health research

// Base life expectancy data by country and gender (2025 estimates)
const LIFE_EXPECTANCY_DATABASE = {
  // Developed Countries
  us: { male: 76.4, female: 81.2 },
  uk: { male: 79.1, female: 82.9 },
  canada: { male: 80.1, female: 84.1 },
  australia: { male: 81.2, female: 85.4 },
  germany: { male: 78.7, female: 83.6 },
  france: { male: 79.8, female: 85.8 },
  japan: { male: 81.6, female: 87.7 },
  
  // Emerging Markets
  india: { male: 69.5, female: 72.0 },
  china: { male: 75.2, female: 79.4 },
  brazil: { male: 72.8, female: 79.9 },
  
  // Global Average
  other: { male: 75.0, female: 80.0 }
};

/**
 * Look up base life expectancy for a country + gender. 'male'/'female' hit
 * the actuarial table directly; anything else (e.g. 'other') has no
 * dedicated column in this dataset, so fall back to the country's
 * male/female average rather than returning undefined (which would
 * propagate to NaN through the rest of the calculation).
 */
function getBaseLifespan(country, gender) {
  const countryData = LIFE_EXPECTANCY_DATABASE[country] || LIFE_EXPECTANCY_DATABASE.other;
  if (gender === 'male' || gender === 'female') {
    return countryData[gender] ?? LIFE_EXPECTANCY_DATABASE.other[gender];
  }
  return (countryData.male + countryData.female) / 2;
}

/**
 * Advanced Life Expectancy Calculator
 * Takes into account multiple lifestyle and health factors
 * 
 * @param {Object} factors - All the lifestyle and health factors
 * @returns {Object} - Calculated lifespan and breakdown
 */
function calculateAdvancedLifeExpectancy(factors) {
  const {
    gender = 'male',
    country = 'us',
    currentAge = 0,
    bmi = null,
    smoking = false,
    packsPerDay = 0,
    smokingYears = 0,
    alcoholConsumption = 'never',
    smokingStatus = '',
    fitnessLevel = 'moderate',
    dietQuality = 'average',
    stressLevel = 'moderate',
    sleepQuality = 'good',
    mentalOutlook = 'optimistic',
    // New comprehensive factors
    exerciseFrequency = '',
    exerciseType = '',
    exerciseDuration = '',
    dailySteps = '',
    waterIntake = '',
    fruitsVegetables = '',
    processedFood = '',
    mealRegularity = '',
    socialConnections = '',
    workLifeBalance = '',
    lifeSatisfaction = '',
    purpose = '',
    meditation = '',
    medicalCheckups = '',
    preventiveCare = '',
    supplements = '',
    dentalCare = '',
    familyHistory = 'average' // Future enhancement
  } = factors;

  // Start with base life expectancy
  let baseLifespan = getBaseLifespan(country, gender);
  
  let adjustments = [];
  let totalAdjustment = 0;

  // === BMI IMPACT ===
  // Based on research from Harvard School of Public Health
  if (bmi && bmi > 0) {
    if (bmi < 16) {
      // Severely underweight
      totalAdjustment -= 4;
      adjustments.push({ 
        factor: 'Severely Underweight BMI', 
        adjustment: -4, 
        type: 'negative',
        impact: 'high'
      });
    } else if (bmi < 18.5) {
      // Underweight
      totalAdjustment -= 2;
      adjustments.push({ 
        factor: 'Underweight BMI', 
        adjustment: -2, 
        type: 'negative',
        impact: 'medium'
      });
    } else if (bmi >= 18.5 && bmi <= 24.9) {
      // Normal weight - this is optimal
      totalAdjustment += 2;
      adjustments.push({ 
        factor: 'Healthy BMI Range', 
        adjustment: +2, 
        type: 'positive',
        impact: 'medium'
      });
    } else if (bmi >= 25 && bmi <= 29.9) {
      // Overweight
      totalAdjustment -= 1.5;
      adjustments.push({ 
        factor: 'Overweight BMI', 
        adjustment: -1.5, 
        type: 'negative',
        impact: 'low'
      });
    } else if (bmi >= 30 && bmi <= 34.9) {
      // Class I obesity
      totalAdjustment -= 3;
      adjustments.push({ 
        factor: 'Class I Obesity', 
        adjustment: -3, 
        type: 'negative',
        impact: 'medium'
      });
    } else if (bmi >= 35 && bmi <= 39.9) {
      // Class II obesity
      totalAdjustment -= 5;
      adjustments.push({ 
        factor: 'Class II Obesity', 
        adjustment: -5, 
        type: 'negative',
        impact: 'high'
      });
    } else if (bmi >= 40) {
      // Class III obesity (morbid obesity)
      totalAdjustment -= 8;
      adjustments.push({ 
        factor: 'Morbid Obesity', 
        adjustment: -8, 
        type: 'negative',
        impact: 'severe'
      });
    }
  }

  // === SMOKING IMPACT ===
  // Based on CDC and WHO research on tobacco mortality
  if (smoking && packsPerDay > 0 && smokingYears > 0) {
    // Calculate pack-years (standard medical measurement)
    const packYears = packsPerDay * smokingYears;
    
    let smokingPenalty;
    if (packYears < 10) {
      smokingPenalty = 2;
    } else if (packYears < 20) {
      smokingPenalty = 4;
    } else if (packYears < 40) {
      smokingPenalty = 7;
    } else if (packYears < 60) {
      smokingPenalty = 10;
    } else {
      smokingPenalty = 13; // Heavy long-term smokers
    }

    // Former smokers see substantial risk reduction after quitting (CDC/WHO
    // both show excess mortality risk dropping significantly within 5-15
    // years of cessation). Approximate that with a flat reduction rather
    // than a full years-since-quit curve, which would need its own input.
    const isFormerSmoker = smokingStatus === 'former';
    if (isFormerSmoker) {
      smokingPenalty *= 0.6;
    }
    smokingPenalty = Math.round(smokingPenalty * 10) / 10;

    totalAdjustment -= smokingPenalty;
    adjustments.push({
      factor: isFormerSmoker
        ? `Former Smoker (${packYears} pack-years, quit)`
        : `Smoking History (${packYears} pack-years)`,
      adjustment: -smokingPenalty,
      type: 'negative',
      impact: packYears > 40 ? 'severe' : packYears > 20 ? 'high' : 'medium'
    });
  }

  // === ALCOHOL CONSUMPTION ===
  // J-shaped curve: moderate consumption can be beneficial, excess is harmful
  switch (alcoholConsumption) {
    case 'never':
      // Slight benefit from avoiding alcohol-related risks
      totalAdjustment += 0.5;
      adjustments.push({ 
        factor: 'No Alcohol Consumption', 
        adjustment: +0.5, 
        type: 'positive',
        impact: 'low'
      });
      break;
    case 'occasional':
      // 1-2 drinks per month - minimal impact
      adjustments.push({ 
        factor: 'Occasional Light Drinking', 
        adjustment: 0, 
        type: 'neutral',
        impact: 'none'
      });
      break;
    case 'moderate':
      // 2-4 drinks per week - can be slightly beneficial for heart health
      totalAdjustment += 1;
      adjustments.push({ 
        factor: 'Moderate Alcohol (Heart Benefits)', 
        adjustment: +1, 
        type: 'positive',
        impact: 'low'
      });
      break;
    case 'regular':
      // Daily drinking - increased health risks
      totalAdjustment -= 2;
      adjustments.push({ 
        factor: 'Regular Daily Drinking', 
        adjustment: -2, 
        type: 'negative',
        impact: 'medium'
      });
      break;
    case 'heavy':
      // Multiple drinks daily - serious health consequences
      totalAdjustment -= 6;
      adjustments.push({ 
        factor: 'Heavy Alcohol Consumption', 
        adjustment: -6, 
        type: 'negative',
        impact: 'high'
      });
      break;
  }

  // === PHYSICAL FITNESS ===
  // Enhanced exercise analysis combining multiple factors
  let exerciseBonus = 0;
  
  // Exercise frequency impact
  // NOTE: case values match factor-exercise-frequency's <option value> in
  // life-factors.html exactly (was previously 'never'/'1-2-times'/etc,
  // which never matched the HTML's '0'/'1-2'/etc - the entire field was a
  // silent no-op for every real user; fixed here rather than in the HTML so
  // any settings already saved by existing installs start working too).
  switch (exerciseFrequency) {
    case '0':
      exerciseBonus -= 4;
      adjustments.push({
        factor: 'No Exercise',
        adjustment: -4,
        type: 'negative',
        impact: 'high'
      });
      break;
    case '1-2':
      exerciseBonus += 1;
      adjustments.push({
        factor: 'Light Exercise (1-2x/week)',
        adjustment: +1,
        type: 'positive',
        impact: 'low'
      });
      break;
    case '3-4':
      exerciseBonus += 3;
      adjustments.push({
        factor: 'Regular Exercise (3-4x/week)',
        adjustment: +3,
        type: 'positive',
        impact: 'medium'
      });
      break;
    case '5-6':
      exerciseBonus += 5;
      adjustments.push({
        factor: 'Very Active (5-6x/week)',
        adjustment: +5,
        type: 'positive',
        impact: 'high'
      });
      break;
    case '7+':
      exerciseBonus += 6;
      adjustments.push({
        factor: 'Daily Exercise',
        adjustment: +6,
        type: 'positive',
        impact: 'high'
      });
      break;
  }
  
  // Exercise type bonus (if specified)
  if (exerciseType) {
    switch (exerciseType) {
      case 'cardio':
        exerciseBonus += 1;
        adjustments.push({ 
          factor: 'Cardio Focus', 
          adjustment: +1, 
          type: 'positive',
          impact: 'low'
        });
        break;
      case 'strength':
        exerciseBonus += 1;
        adjustments.push({ 
          factor: 'Strength Training', 
          adjustment: +1, 
          type: 'positive',
          impact: 'low'
        });
        break;
      case 'mixed':
        exerciseBonus += 2;
        adjustments.push({ 
          factor: 'Mixed Exercise Types', 
          adjustment: +2, 
          type: 'positive',
          impact: 'medium'
        });
        break;
      case 'sports':
        exerciseBonus += 1.5;
        adjustments.push({
          factor: 'Sports Activities',
          adjustment: +1.5,
          type: 'positive',
          impact: 'medium'
        });
        break;
      case 'yoga':
        exerciseBonus += 1.5;
        adjustments.push({
          factor: 'Yoga/Flexibility/Pilates',
          adjustment: +1.5,
          type: 'positive',
          impact: 'medium'
        });
        break;
      case 'walking':
        exerciseBonus += 0.5;
        adjustments.push({
          factor: 'Walking/Light Activities',
          adjustment: +0.5,
          type: 'positive',
          impact: 'low'
        });
        break;
    }
  }
  
  // Daily steps impact
  // NOTE: case values match factor-daily-steps's <option value> exactly
  // (was 'under-3000'/'3000-5000'/etc, which never matched the HTML's
  // 'under-3k'/'3k-5k'/etc - see the exerciseFrequency note above, same bug).
  if (dailySteps) {
    switch (dailySteps) {
      case 'under-3k':
        exerciseBonus -= 1;
        adjustments.push({
          factor: 'Low Daily Steps (<3K)',
          adjustment: -1,
          type: 'negative',
          impact: 'low'
        });
        break;
      case '3k-5k':
        // Neutral, no adjustment
        break;
      case '5k-8k':
        exerciseBonus += 1;
        adjustments.push({
          factor: 'Good Daily Steps (5-8K)',
          adjustment: +1,
          type: 'positive',
          impact: 'low'
        });
        break;
      case '8k-10k':
        exerciseBonus += 2;
        adjustments.push({
          factor: 'High Daily Steps (8-10K)',
          adjustment: +2,
          type: 'positive',
          impact: 'medium'
        });
        break;
      case '10k+':
        exerciseBonus += 3;
        adjustments.push({
          factor: 'Very High Daily Steps (10K+)',
          adjustment: +3,
          type: 'positive',
          impact: 'medium'
        });
        break;
    }
  }

  // Exercise session duration - only meaningful if the person exercises at
  // all. Was collected by the Life Factors form and saved, but never read
  // by this function; wired in here with a conservative, capped bonus.
  if (exerciseDuration && exerciseFrequency && exerciseFrequency !== '0') {
    switch (exerciseDuration) {
      case '15-30':
        // Baseline short session, no adjustment
        break;
      case '30-60':
        exerciseBonus += 0.5;
        adjustments.push({
          factor: 'Solid Session Length (30-60 min)',
          adjustment: +0.5,
          type: 'positive',
          impact: 'low'
        });
        break;
      case '60-90':
        exerciseBonus += 1;
        adjustments.push({
          factor: 'Extended Session Length (60-90 min)',
          adjustment: +1,
          type: 'positive',
          impact: 'low'
        });
        break;
      case '90+':
        exerciseBonus += 1;
        adjustments.push({
          factor: 'Long Session Length (90+ min)',
          adjustment: +1,
          type: 'positive',
          impact: 'low'
        });
        break;
    }
  }

  // Apply exercise adjustments (cap at reasonable limits)
  totalAdjustment += Math.min(exerciseBonus, 10); // Max 10 years from exercise
  
  // Legacy fitness level support (if new fields not filled)
  if (!exerciseFrequency && fitnessLevel) {
    switch (fitnessLevel) {
      case 'sedentary':
        totalAdjustment -= 4;
        adjustments.push({ 
          factor: 'Sedentary Lifestyle', 
          adjustment: -4, 
          type: 'negative',
          impact: 'high'
        });
        break;
      case 'light':
        totalAdjustment -= 1;
        adjustments.push({ 
          factor: 'Light Exercise', 
          adjustment: -1, 
          type: 'negative',
          impact: 'low'
        });
        break;
      case 'moderate':
        totalAdjustment += 3;
        adjustments.push({ 
          factor: 'Regular Moderate Exercise', 
          adjustment: +3, 
          type: 'positive',
          impact: 'medium'
        });
        break;
      case 'active':
        totalAdjustment += 5;
        adjustments.push({ 
          factor: 'Very Active Lifestyle', 
          adjustment: +5, 
          type: 'positive',
          impact: 'high'
        });
        break;
      case 'athlete':
        totalAdjustment += 7;
        adjustments.push({ 
          factor: 'Elite Athletic Fitness', 
          adjustment: +7, 
          type: 'positive',
          impact: 'high'
        });
        break;
    }
  }

  // === DIET QUALITY ===
  // Enhanced nutrition analysis
  let nutritionBonus = 0;
  
  // Water intake
  // NOTE: top case was 'over-8', which never matched the HTML's '8+' value.
  if (waterIntake) {
    switch (waterIntake) {
      case 'under-4':
        nutritionBonus -= 1;
        adjustments.push({ 
          factor: 'Low Water Intake (<4 glasses)', 
          adjustment: -1, 
          type: 'negative',
          impact: 'low'
        });
        break;
      case '4-6':
        // Neutral
        break;
      case '6-8':
        nutritionBonus += 0.5;
        adjustments.push({ 
          factor: 'Good Hydration (6-8 glasses)', 
          adjustment: +0.5, 
          type: 'positive',
          impact: 'low'
        });
        break;
      case '8+':
        nutritionBonus += 1;
        adjustments.push({
          factor: 'Excellent Hydration (8+ glasses)',
          adjustment: +1,
          type: 'positive',
          impact: 'low'
        });
        break;
    }
  }

  // Fruits and vegetables
  // NOTE: case values match factor-fruits-vegetables's <option value>
  // exactly (top/bottom tiers were 'under-2'/'over-5', which never matched
  // the HTML's '0-1'/'6+').
  if (fruitsVegetables) {
    switch (fruitsVegetables) {
      case '0-1':
        nutritionBonus -= 2;
        adjustments.push({
          factor: 'Low Fruit/Vegetable Intake',
          adjustment: -2,
          type: 'negative',
          impact: 'medium'
        });
        break;
      case '2-3':
        nutritionBonus += 0.5;
        adjustments.push({ 
          factor: 'Moderate Fruit/Vegetable Intake', 
          adjustment: +0.5, 
          type: 'positive',
          impact: 'low'
        });
        break;
      case '4-5':
        nutritionBonus += 2;
        adjustments.push({ 
          factor: 'Good Fruit/Vegetable Intake (4-5)', 
          adjustment: +2, 
          type: 'positive',
          impact: 'medium'
        });
        break;
      case '6+':
        nutritionBonus += 3;
        adjustments.push({
          factor: 'Excellent Fruit/Vegetable Intake (5+)',
          adjustment: +3,
          type: 'positive',
          impact: 'high'
        });
        break;
    }
  }
  
  // Processed food frequency
  if (processedFood) {
    switch (processedFood) {
      case 'daily':
        nutritionBonus -= 3;
        adjustments.push({ 
          factor: 'Daily Processed Food', 
          adjustment: -3, 
          type: 'negative',
          impact: 'high'
        });
        break;
      case 'few-times-week':
        nutritionBonus -= 1.5;
        adjustments.push({ 
          factor: 'Regular Processed Food', 
          adjustment: -1.5, 
          type: 'negative',
          impact: 'medium'
        });
        break;
      case 'weekly':
        nutritionBonus -= 0.5;
        adjustments.push({ 
          factor: 'Weekly Processed Food', 
          adjustment: -0.5, 
          type: 'negative',
          impact: 'low'
        });
        break;
      case 'rarely':
        nutritionBonus += 1;
        adjustments.push({ 
          factor: 'Minimal Processed Food', 
          adjustment: +1, 
          type: 'positive',
          impact: 'low'
        });
        break;
      case 'never':
        nutritionBonus += 2;
        adjustments.push({ 
          factor: 'No Processed Food', 
          adjustment: +2, 
          type: 'positive',
          impact: 'medium'
        });
        break;
    }
  }
  
  // Meal regularity
  // NOTE: case values match factor-meal-regularity's <option value> exactly
  // (was 'somewhat-regular'/'regular'/'very-regular', which never matched
  // the HTML's '2-meals'/'3-meals'/'3-meals-snacks').
  if (mealRegularity) {
    switch (mealRegularity) {
      case 'irregular':
        nutritionBonus -= 1;
        adjustments.push({
          factor: 'Irregular Eating Pattern',
          adjustment: -1,
          type: 'negative',
          impact: 'low'
        });
        break;
      case '2-meals':
        // Neutral
        break;
      case '3-meals':
        nutritionBonus += 1;
        adjustments.push({
          factor: 'Regular Meal Schedule',
          adjustment: +1,
          type: 'positive',
          impact: 'low'
        });
        break;
      case '3-meals-snacks':
        nutritionBonus += 1.5;
        adjustments.push({
          factor: 'Very Regular Meal Schedule',
          adjustment: +1.5,
          type: 'positive',
          impact: 'medium'
        });
        break;
    }
  }
  
  // Apply nutrition adjustments
  totalAdjustment += nutritionBonus;
  
  // Legacy diet quality support (if new fields not filled)
  if (!waterIntake && !fruitsVegetables && dietQuality) {
    switch (dietQuality) {
      case 'poor':
        totalAdjustment -= 3;
        adjustments.push({ 
          factor: 'Poor Diet Quality', 
          adjustment: -3, 
          type: 'negative',
          impact: 'medium'
        });
        break;
      case 'average':
        adjustments.push({ 
          factor: 'Average Diet', 
          adjustment: 0, 
          type: 'neutral',
          impact: 'none'
        });
        break;
      case 'good':
        totalAdjustment += 2;
        adjustments.push({ 
          factor: 'Balanced Healthy Diet', 
          adjustment: +2, 
          type: 'positive',
          impact: 'medium'
        });
        break;
      case 'excellent':
        totalAdjustment += 4;
        adjustments.push({ 
          factor: 'Excellent Diet (Mediterranean-style)', 
          adjustment: +4, 
          type: 'positive',
          impact: 'high'
        });
        break;
    }
  }

  // === STRESS LEVELS ===
  // Chronic stress impacts cortisol and cardiovascular health
  switch (stressLevel) {
    case 'low':
      totalAdjustment += 2;
      adjustments.push({ 
        factor: 'Low Stress Levels', 
        adjustment: +2, 
        type: 'positive',
        impact: 'medium'
      });
      break;
    case 'moderate':
      // Normal stress levels
      adjustments.push({ 
        factor: 'Moderate Stress', 
        adjustment: 0, 
        type: 'neutral',
        impact: 'none'
      });
      break;
    case 'high':
      totalAdjustment -= 2;
      adjustments.push({ 
        factor: 'High Chronic Stress', 
        adjustment: -2, 
        type: 'negative',
        impact: 'medium'
      });
      break;
    case 'extreme':
      totalAdjustment -= 4;
      adjustments.push({ 
        factor: 'Extreme Chronic Stress', 
        adjustment: -4, 
        type: 'negative',
        impact: 'high'
      });
      break;
  }

  // === SLEEP QUALITY ===
  // Sleep is crucial for immune function and cellular repair
  switch (sleepQuality) {
    case 'poor':
      // Less than 6 hours or very poor quality
      totalAdjustment -= 3;
      adjustments.push({ 
        factor: 'Poor Sleep Quality', 
        adjustment: -3, 
        type: 'negative',
        impact: 'medium'
      });
      break;
    case 'fair':
      // 6-7 hours, some quality issues
      totalAdjustment -= 1;
      adjustments.push({ 
        factor: 'Fair Sleep Quality', 
        adjustment: -1, 
        type: 'negative',
        impact: 'low'
      });
      break;
    case 'good':
      // 7-8 hours, good quality
      totalAdjustment += 1;
      adjustments.push({ 
        factor: 'Good Sleep Quality', 
        adjustment: +1, 
        type: 'positive',
        impact: 'low'
      });
      break;
    case 'excellent':
      // 8+ hours, excellent quality
      totalAdjustment += 3;
      adjustments.push({ 
        factor: 'Excellent Sleep Quality', 
        adjustment: +3, 
        type: 'positive',
        impact: 'medium'
      });
      break;
  }

  // === MENTAL OUTLOOK ===
  // Psychological studies show optimism correlates with longevity
  // NOTE: case values match factor-outlook's <option value> exactly (was
  // 'neutral'/'very-positive', which never matched the HTML's
  // 'realistic'/'very-optimistic').
  switch (mentalOutlook) {
    case 'pessimistic':
      totalAdjustment -= 2;
      adjustments.push({
        factor: 'Pessimistic Outlook',
        adjustment: -2,
        type: 'negative',
        impact: 'medium'
      });
      break;
    case 'realistic':
      adjustments.push({
        factor: 'Realistic Mental Outlook',
        adjustment: 0,
        type: 'neutral',
        impact: 'none'
      });
      break;
    case 'optimistic':
      totalAdjustment += 2;
      adjustments.push({
        factor: 'Optimistic Outlook',
        adjustment: +2,
        type: 'positive',
        impact: 'medium'
      });
      break;
    case 'very-optimistic':
      totalAdjustment += 3;
      adjustments.push({
        factor: 'Very Optimistic Outlook',
        adjustment: +3,
        type: 'positive',
        impact: 'medium'
      });
      break;
  }

  // === SOCIAL & MENTAL WELLBEING ===
  // Social connections impact
  if (socialConnections) {
    switch (socialConnections) {
      case 'isolated':
        totalAdjustment -= 4;
        adjustments.push({ 
          factor: 'Social Isolation', 
          adjustment: -4, 
          type: 'negative',
          impact: 'high'
        });
        break;
      case 'few-friends':
        totalAdjustment -= 1;
        adjustments.push({ 
          factor: 'Limited Social Circle', 
          adjustment: -1, 
          type: 'negative',
          impact: 'low'
        });
        break;
      case 'moderate-social':
        totalAdjustment += 1;
        adjustments.push({ 
          factor: 'Moderate Social Connections', 
          adjustment: +1, 
          type: 'positive',
          impact: 'low'
        });
        break;
      case 'very-social':
        totalAdjustment += 3;
        adjustments.push({ 
          factor: 'Strong Social Network', 
          adjustment: +3, 
          type: 'positive',
          impact: 'medium'
        });
        break;
    }
  }
  
  // Work-life balance
  if (workLifeBalance) {
    switch (workLifeBalance) {
      case 'poor':
        totalAdjustment -= 2;
        adjustments.push({ 
          factor: 'Poor Work-Life Balance', 
          adjustment: -2, 
          type: 'negative',
          impact: 'medium'
        });
        break;
      case 'fair':
        totalAdjustment -= 0.5;
        adjustments.push({ 
          factor: 'Fair Work-Life Balance', 
          adjustment: -0.5, 
          type: 'negative',
          impact: 'low'
        });
        break;
      case 'good':
        totalAdjustment += 1;
        adjustments.push({ 
          factor: 'Good Work-Life Balance', 
          adjustment: +1, 
          type: 'positive',
          impact: 'low'
        });
        break;
      case 'excellent':
        totalAdjustment += 2;
        adjustments.push({ 
          factor: 'Excellent Work-Life Balance', 
          adjustment: +2, 
          type: 'positive',
          impact: 'medium'
        });
        break;
    }
  }
  
  // Life satisfaction
  if (lifeSatisfaction) {
    switch (lifeSatisfaction) {
      case 'very-low':
        totalAdjustment -= 3;
        adjustments.push({ 
          factor: 'Very Low Life Satisfaction', 
          adjustment: -3, 
          type: 'negative',
          impact: 'high'
        });
        break;
      case 'low':
        totalAdjustment -= 1.5;
        adjustments.push({ 
          factor: 'Low Life Satisfaction', 
          adjustment: -1.5, 
          type: 'negative',
          impact: 'medium'
        });
        break;
      case 'moderate':
        // Neutral
        break;
      case 'high':
        totalAdjustment += 2;
        adjustments.push({ 
          factor: 'High Life Satisfaction', 
          adjustment: +2, 
          type: 'positive',
          impact: 'medium'
        });
        break;
      case 'very-high':
        totalAdjustment += 3;
        adjustments.push({ 
          factor: 'Very High Life Satisfaction', 
          adjustment: +3, 
          type: 'positive',
          impact: 'high'
        });
        break;
    }
  }
  
  // Sense of purpose
  if (purpose) {
    switch (purpose) {
      case 'none':
        totalAdjustment -= 2;
        adjustments.push({ 
          factor: 'No Sense of Purpose', 
          adjustment: -2, 
          type: 'negative',
          impact: 'medium'
        });
        break;
      case 'little':
        totalAdjustment -= 0.5;
        adjustments.push({ 
          factor: 'Little Sense of Purpose', 
          adjustment: -0.5, 
          type: 'negative',
          impact: 'low'
        });
        break;
      case 'some':
        totalAdjustment += 0.5;
        adjustments.push({ 
          factor: 'Some Sense of Purpose', 
          adjustment: +0.5, 
          type: 'positive',
          impact: 'low'
        });
        break;
      case 'strong':
        totalAdjustment += 2;
        adjustments.push({ 
          factor: 'Strong Sense of Purpose', 
          adjustment: +2, 
          type: 'positive',
          impact: 'medium'
        });
        break;
      case 'very-strong':
        totalAdjustment += 3;
        adjustments.push({ 
          factor: 'Very Strong Sense of Purpose', 
          adjustment: +3, 
          type: 'positive',
          impact: 'high'
        });
        break;
    }
  }
  
  // Meditation practice
  if (meditation) {
    switch (meditation) {
      case 'never':
        // Neutral, no adjustment
        break;
      case 'rarely':
        totalAdjustment += 0.5;
        adjustments.push({ 
          factor: 'Occasional Mindfulness', 
          adjustment: +0.5, 
          type: 'positive',
          impact: 'low'
        });
        break;
      case 'weekly':
        totalAdjustment += 1.5;
        adjustments.push({ 
          factor: 'Weekly Meditation Practice', 
          adjustment: +1.5, 
          type: 'positive',
          impact: 'medium'
        });
        break;
      case 'daily':
        totalAdjustment += 2.5;
        adjustments.push({ 
          factor: 'Daily Meditation Practice', 
          adjustment: +2.5, 
          type: 'positive',
          impact: 'high'
        });
        break;
    }
  }
  
  // === HEALTH MAINTENANCE ===
  // Regular medical checkups
  if (medicalCheckups) {
    switch (medicalCheckups) {
      case 'never':
        totalAdjustment -= 2;
        adjustments.push({ 
          factor: 'No Regular Checkups', 
          adjustment: -2, 
          type: 'negative',
          impact: 'medium'
        });
        break;
      case 'few-years':
        totalAdjustment -= 0.5;
        adjustments.push({ 
          factor: 'Infrequent Medical Checkups', 
          adjustment: -0.5, 
          type: 'negative',
          impact: 'low'
        });
        break;
      case 'annually':
        totalAdjustment += 1;
        adjustments.push({ 
          factor: 'Annual Medical Checkups', 
          adjustment: +1, 
          type: 'positive',
          impact: 'medium'
        });
        break;
      case 'bi-annually':
        totalAdjustment += 2;
        adjustments.push({ 
          factor: 'Frequent Medical Monitoring', 
          adjustment: +2, 
          type: 'positive',
          impact: 'high'
        });
        break;
    }
  }
  
  // Preventive care
  if (preventiveCare) {
    switch (preventiveCare) {
      case 'none':
        totalAdjustment -= 1.5;
        adjustments.push({ 
          factor: 'No Preventive Care', 
          adjustment: -1.5, 
          type: 'negative',
          impact: 'medium'
        });
        break;
      case 'basic':
        totalAdjustment += 0.5;
        adjustments.push({ 
          factor: 'Basic Preventive Screenings', 
          adjustment: +0.5, 
          type: 'positive',
          impact: 'low'
        });
        break;
      case 'comprehensive':
        totalAdjustment += 2;
        adjustments.push({ 
          factor: 'Comprehensive Preventive Care', 
          adjustment: +2, 
          type: 'positive',
          impact: 'medium'
        });
        break;
      case 'very-comprehensive':
        totalAdjustment += 3;
        adjustments.push({ 
          factor: 'Proactive Health Management', 
          adjustment: +3, 
          type: 'positive',
          impact: 'high'
        });
        break;
    }
  }
  
  // Supplement usage
  if (supplements) {
    switch (supplements) {
      case 'none':
        // Neutral, no adjustment
        break;
      case 'basic-vitamins':
        totalAdjustment += 0.5;
        adjustments.push({ 
          factor: 'Basic Vitamin Supplementation', 
          adjustment: +0.5, 
          type: 'positive',
          impact: 'low'
        });
        break;
      case 'targeted':
        totalAdjustment += 1;
        adjustments.push({ 
          factor: 'Targeted Supplementation', 
          adjustment: +1, 
          type: 'positive',
          impact: 'low'
        });
        break;
      case 'comprehensive':
        totalAdjustment += 1.5;
        adjustments.push({ 
          factor: 'Comprehensive Supplement Regimen', 
          adjustment: +1.5, 
          type: 'positive',
          impact: 'medium'
        });
        break;
    }
  }
  
  // Dental care
  if (dentalCare) {
    switch (dentalCare) {
      case 'poor':
        totalAdjustment -= 1;
        adjustments.push({ 
          factor: 'Poor Dental Hygiene', 
          adjustment: -1, 
          type: 'negative',
          impact: 'low'
        });
        break;
      case 'fair':
        // Neutral
        break;
      case 'good':
        totalAdjustment += 0.5;
        adjustments.push({ 
          factor: 'Good Dental Care', 
          adjustment: +0.5, 
          type: 'positive',
          impact: 'low'
        });
        break;
      case 'excellent':
        totalAdjustment += 1;
        adjustments.push({ 
          factor: 'Excellent Dental Care', 
          adjustment: +1, 
          type: 'positive',
          impact: 'low'
        });
        break;
    }
  }

  // === AGE ADJUSTMENT ===
  // Younger people have more time to benefit from lifestyle changes
  if (currentAge > 0) {
    if (currentAge < 30) {
      // Young adults benefit most from healthy habits
      totalAdjustment *= 1.2;
      adjustments.push({ 
        factor: 'Young Age Advantage', 
        adjustment: '+20% to lifestyle factors', 
        type: 'positive',
        impact: 'modifier'
      });
    } else if (currentAge > 65) {
      // Older adults see reduced impact of lifestyle changes
      totalAdjustment *= 0.7;
      adjustments.push({ 
        factor: 'Advanced Age Factor', 
        adjustment: '-30% to lifestyle factors', 
        type: 'negative',
        impact: 'modifier'
      });
    }
  }

  // Calculate final lifespan
  const adjustedLifespan = Math.max(baseLifespan + totalAdjustment, 45); // Minimum 45 years
  const roundedLifespan = Math.round(adjustedLifespan * 10) / 10; // Round to 1 decimal

  // Calculate life expectancy categories
  let healthScore = 'average';
  if (totalAdjustment > 5) healthScore = 'excellent';
  else if (totalAdjustment > 2) healthScore = 'good';
  else if (totalAdjustment < -5) healthScore = 'poor';
  else if (totalAdjustment < -2) healthScore = 'below-average';

  // Generate personalized health recommendations
  const recommendations = generateHealthRecommendations(factors, {
    baseLifespan,
    adjustedLifespan: roundedLifespan,
    totalAdjustment: Math.round(totalAdjustment * 10) / 10,
    adjustments,
    healthScore,
    country,
    gender
  });

  return {
    baseLifespan,
    adjustedLifespan: roundedLifespan,
    totalAdjustment: Math.round(totalAdjustment * 10) / 10,
    adjustments,
    healthScore,
    country,
    gender,
    recommendations
  };
}

/**
 * Get BMI category and health implications
 */
function getBMIAnalysis(bmi) {
  if (!bmi || bmi <= 0) return null;
  
  if (bmi < 16) {
    return {
      category: 'Severely Underweight',
      health: 'High risk of malnutrition and health complications',
      color: '#e74c3c',
      recommendation: 'Consult healthcare provider immediately'
    };
  } else if (bmi < 18.5) {
    return {
      category: 'Underweight',
      health: 'May indicate malnutrition or underlying health issues',
      color: '#3498db',
      recommendation: 'Consider consulting healthcare provider'
    };
  } else if (bmi <= 24.9) {
    return {
      category: 'Normal Weight',
      health: 'Optimal weight range for health',
      color: '#27ae60',
      recommendation: 'Maintain current healthy lifestyle'
    };
  } else if (bmi <= 29.9) {
    return {
      category: 'Overweight',
      health: 'Increased risk of heart disease and diabetes',
      color: '#f39c12',
      recommendation: 'Consider lifestyle changes for weight management'
    };
  } else if (bmi <= 34.9) {
    return {
      category: 'Class I Obesity',
      health: 'Moderate health risks',
      color: '#e67e22',
      recommendation: 'Consult healthcare provider for weight management plan'
    };
  } else if (bmi <= 39.9) {
    return {
      category: 'Class II Obesity',
      health: 'High health risks',
      color: '#d35400',
      recommendation: 'Medical supervision recommended for weight loss'
    };
  } else {
    return {
      category: 'Class III Obesity',
      health: 'Very high health risks',
      color: '#c0392b',
      recommendation: 'Immediate medical intervention recommended'
    };
  }
}

/**
 * Generate personalized health recommendations
 */
function generateHealthRecommendations(factors, calculationResult) {
  const recommendations = [];
  
  // BMI recommendations
  if (factors.bmi) {
    const bmiAnalysis = getBMIAnalysis(factors.bmi);
    if (bmiAnalysis && bmiAnalysis.category !== 'Normal Weight') {
      recommendations.push({
        category: 'Weight Management',
        suggestion: bmiAnalysis.recommendation,
        priority: factors.bmi > 30 ? 'critical' : 'high'
      });
    }
  }
  
  // Exercise recommendations
  // exerciseFrequency's real values are '0'/'1-2'/'3-4'/'5-6'/'7+' (see the
  // <select> in life-factors.html) - the 'never'/'rarely' this used to check
  // against never matched, so only the fitnessLevel half of each OR ever
  // fired for anyone whose fitnessLevel didn't happen to line up too.
  if (factors.exerciseFrequency === '0' || factors.fitnessLevel === 'sedentary') {
    recommendations.push({
      category: 'Physical Activity',
      suggestion: 'Start with 10-15 minutes of daily walking, gradually increase to 150 minutes per week',
      priority: 'critical'
    });
  } else if (factors.exerciseFrequency === '1-2' || factors.fitnessLevel === 'light') {
    recommendations.push({
      category: 'Physical Activity',
      suggestion: 'Increase to 3-4 exercise sessions per week, aim for 150 minutes of moderate activity',
      priority: 'high'
    });
  } else if (!factors.exerciseType || factors.exerciseType === 'cardio') {
    recommendations.push({
      category: 'Physical Activity',
      suggestion: 'Add strength training 2-3 times per week to complement your cardio routine',
      priority: 'medium'
    });
  }
  
  // Daily steps recommendations
  if (factors.dailySteps === 'under-3k') {
    recommendations.push({
      category: 'Daily Movement',
      suggestion: 'Aim for at least 5,000 daily steps - take stairs, park farther, walk during breaks',
      priority: 'high'
    });
  } else if (factors.dailySteps === '3k-5k') {
    recommendations.push({
      category: 'Daily Movement',
      suggestion: 'Great start! Try to reach 8,000-10,000 steps daily for optimal health benefits',
      priority: 'medium'
    });
  }
  
  // Smoking recommendations
  if (factors.smoking) {
    recommendations.push({
      category: 'Smoking Cessation',
      suggestion: 'Consider smoking cessation programs - quitting at any age provides immediate health benefits',
      priority: 'critical'
    });
  }
  
  // Nutrition recommendations
  if (factors.fruitsVegetables === '0-1') {
    recommendations.push({
      category: 'Nutrition',
      suggestion: 'Increase fruits and vegetables to 5+ servings daily - start by adding one extra serving per meal',
      priority: 'high'
    });
  }
  
  if (factors.processedFood === 'daily' || factors.processedFood === 'few-times-week') {
    recommendations.push({
      category: 'Nutrition',
      suggestion: 'Reduce processed foods - cook more meals at home using whole, unprocessed ingredients',
      priority: 'high'
    });
  }
  
  if (factors.waterIntake === 'under-4') {
    recommendations.push({
      category: 'Hydration',
      suggestion: 'Increase water intake to 6-8 glasses daily - keep a water bottle nearby as a reminder',
      priority: 'medium'
    });
  }
  
  if (factors.mealRegularity === 'irregular') {
    recommendations.push({
      category: 'Nutrition',
      suggestion: 'Establish regular meal times - eating at consistent times improves metabolism and energy',
      priority: 'medium'
    });
  }
  
  // Social & Mental Health recommendations
  if (factors.socialConnections === 'isolated') {
    recommendations.push({
      category: 'Social Wellbeing',
      suggestion: 'Build social connections through community groups, volunteering, or shared interest activities',
      priority: 'high'
    });
  }
  
  if (factors.workLifeBalance === 'poor') {
    recommendations.push({
      category: 'Work-Life Balance',
      suggestion: 'Set boundaries between work and personal time - consider discussing workload with supervisor',
      priority: 'high'
    });
  }
  
  if (factors.lifeSatisfaction === 'very-low' || factors.lifeSatisfaction === 'low') {
    recommendations.push({
      category: 'Mental Health',
      suggestion: 'Consider speaking with a counselor or therapist to address life satisfaction concerns',
      priority: 'high'
    });
  }
  
  if (factors.purpose === 'none' || factors.purpose === 'little') {
    recommendations.push({
      category: 'Purpose & Meaning',
      suggestion: 'Explore volunteer work, creative pursuits, or mentoring to find deeper meaning and purpose',
      priority: 'medium'
    });
  }
  
  if (factors.meditation === 'never') {
    recommendations.push({
      category: 'Stress Management',
      suggestion: 'Try 5-10 minutes of daily meditation or mindfulness - use apps like Headspace or Calm to start',
      priority: 'medium'
    });
  }
  
  // Health Maintenance recommendations
  if (factors.medicalCheckups === 'never' || factors.medicalCheckups === 'few-years') {
    recommendations.push({
      category: 'Preventive Care',
      suggestion: 'Schedule annual medical checkups - early detection is key to preventing serious health issues',
      priority: 'high'
    });
  }
  
  if (factors.preventiveCare === 'none') {
    recommendations.push({
      category: 'Preventive Care',
      suggestion: 'Discuss age-appropriate screenings with your doctor (blood pressure, cholesterol, cancer screenings)',
      priority: 'high'
    });
  }
  
  if (factors.dentalCare === 'poor') {
    recommendations.push({
      category: 'Dental Health',
      suggestion: 'Schedule dental cleanings every 6 months and maintain daily brushing and flossing routine',
      priority: 'medium'
    });
  }
  
  // Legacy recommendations for older form fields
  if (factors.dietQuality === 'poor' && !factors.fruitsVegetables) {
    recommendations.push({
      category: 'Nutrition',
      suggestion: 'Focus on whole foods, vegetables, and reducing processed food intake',
      priority: 'high'
    });
  }
  
  // Stress management
  if (factors.stressLevel === 'high' || factors.stressLevel === 'extreme') {
    recommendations.push({
      category: 'Stress Management',
      suggestion: 'Consider stress reduction techniques: meditation, therapy, exercise, or time management strategies',
      priority: 'medium'
    });
  }
  
  // Sleep improvement
  if (factors.sleepQuality === 'poor') {
    recommendations.push({
      category: 'Sleep Hygiene',
      suggestion: 'Establish consistent sleep schedule, aim for 7-9 hours nightly, limit screens before bed',
      priority: 'medium'
    });
  }
  
  // Alcohol recommendations
  if (factors.alcoholConsumption === 'heavy' || factors.alcoholConsumption === 'regular') {
    recommendations.push({
      category: 'Alcohol Consumption',
      suggestion: 'Consider reducing alcohol intake - speak with healthcare provider about safe consumption levels',
      priority: factors.alcoholConsumption === 'heavy' ? 'high' : 'medium'
    });
  }
  
  // If no major issues, provide positive reinforcement
  if (recommendations.length === 0) {
    recommendations.push({
      category: 'Lifestyle Maintenance',
      suggestion: 'Great job maintaining healthy lifestyle habits! Continue your current routine for optimal longevity',
      priority: 'low'
    });
  }
  
  // Sort recommendations by priority
  const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return recommendations;
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateAdvancedLifeExpectancy,
    getBMIAnalysis,
    generateHealthRecommendations,
    LIFE_EXPECTANCY_DATABASE
  };
}
