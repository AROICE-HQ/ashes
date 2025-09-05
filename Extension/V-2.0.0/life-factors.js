// Life Factors Page JavaScript
const STORAGE_KEY = 'ashes-settings';

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  console.log('Life Factors page loading...');
  
  // Check if required elements exist
  const requiredElements = ['current-lifespan', 'current-age', 'years-remaining'];
  const missingElements = requiredElements.filter(id => !document.getElementById(id));
  if (missingElements.length > 0) {
    console.error('Missing required elements:', missingElements);
  }
  
  // Check if calculation function is available
  if (typeof calculateAdvancedLifeExpectancy === 'function') {
    console.log('Life expectancy calculation function is available');
  } else {
    console.error('Life expectancy calculation function is NOT available');
  }
  
  loadCurrentSettings();
  setupEventListeners();
  setupRadioButtons();
  updateCalculation();
  
  console.log('Life Factors page initialized');
});

// Load current settings from storage
function loadCurrentSettings() {
  chrome.storage.local.get(STORAGE_KEY, (result) => {
    const settings = result[STORAGE_KEY] || {};
    
    // Populate basic form fields
    if (settings.dob) {
      document.getElementById('factor-dob').value = settings.dob;
    }
    if (settings.gender) {
      document.getElementById('factor-gender').value = settings.gender;
    }
    if (settings.country) {
      document.getElementById('factor-country').value = settings.country;
    }
    if (settings.height) {
      document.getElementById('factor-height').value = settings.height;
    }
    if (settings.weight) {
      document.getElementById('factor-weight').value = settings.weight;
    }
    if (settings.fitnessLevel) {
      document.getElementById('factor-fitness').value = settings.fitnessLevel;
    }
    if (settings.dietQuality) {
      document.getElementById('factor-diet').value = settings.dietQuality;
    }
    if (settings.sleepQuality) {
      document.getElementById('factor-sleep').value = settings.sleepQuality;
    }
    
    // Load exercise & activity fields
    if (settings.exerciseFrequency && document.getElementById('factor-exercise-frequency')) {
      document.getElementById('factor-exercise-frequency').value = settings.exerciseFrequency;
    }
    if (settings.exerciseType && document.getElementById('factor-exercise-type')) {
      document.getElementById('factor-exercise-type').value = settings.exerciseType;
    }
    if (settings.exerciseDuration && document.getElementById('factor-exercise-duration')) {
      document.getElementById('factor-exercise-duration').value = settings.exerciseDuration;
    }
    if (settings.dailySteps && document.getElementById('factor-daily-steps')) {
      document.getElementById('factor-daily-steps').value = settings.dailySteps;
    }
    
    // Load nutrition fields
    if (settings.waterIntake && document.getElementById('factor-water-intake')) {
      document.getElementById('factor-water-intake').value = settings.waterIntake;
    }
    if (settings.fruitsVegetables && document.getElementById('factor-fruits-vegetables')) {
      document.getElementById('factor-fruits-vegetables').value = settings.fruitsVegetables;
    }
    if (settings.processedFood && document.getElementById('factor-processed-food')) {
      document.getElementById('factor-processed-food').value = settings.processedFood;
    }
    if (settings.mealRegularity && document.getElementById('factor-meal-regularity')) {
      document.getElementById('factor-meal-regularity').value = settings.mealRegularity;
    }
    
    // Load social & mental health fields
    if (settings.socialConnections && document.getElementById('factor-social-connections')) {
      document.getElementById('factor-social-connections').value = settings.socialConnections;
    }
    if (settings.workLifeBalance && document.getElementById('factor-work-life-balance')) {
      document.getElementById('factor-work-life-balance').value = settings.workLifeBalance;
    }
    if (settings.lifeSatisfaction && document.getElementById('factor-life-satisfaction')) {
      document.getElementById('factor-life-satisfaction').value = settings.lifeSatisfaction;
    }
    if (settings.purpose && document.getElementById('factor-purpose')) {
      document.getElementById('factor-purpose').value = settings.purpose;
    }
    if (settings.meditation && document.getElementById('factor-meditation')) {
      document.getElementById('factor-meditation').value = settings.meditation;
    }
    
    // Load health maintenance fields
    if (settings.medicalCheckups && document.getElementById('factor-medical-checkups')) {
      document.getElementById('factor-medical-checkups').value = settings.medicalCheckups;
    }
    if (settings.preventiveCare && document.getElementById('factor-preventive-care')) {
      document.getElementById('factor-preventive-care').value = settings.preventiveCare;
    }
    if (settings.supplements && document.getElementById('factor-supplements')) {
      document.getElementById('factor-supplements').value = settings.supplements;
    }
    if (settings.dentalCare && document.getElementById('factor-dental-care')) {
      document.getElementById('factor-dental-care').value = settings.dentalCare;
    }
    if (settings.smokingStatus !== undefined) {
      const smokingRadios = document.querySelectorAll('input[name="factor-smoking"]');
      smokingRadios.forEach(radio => {
        const isSelected = radio.value === settings.smokingStatus;
        radio.checked = isSelected;
        
        // Update visual state
        const option = radio.closest('.radio-option');
        if (isSelected) {
          option.classList.add('selected');
        } else {
          option.classList.remove('selected');
        }
      });
      
      // Show/hide smoking details based on status
      toggleSmokingDetails(settings.smokingStatus);
      
      // Load smoking details
      if (settings.packsPerDay) {
        document.getElementById('factor-packs-per-day').value = settings.packsPerDay;
      }
      if (settings.smokingYears) {
        document.getElementById('factor-smoking-years').value = settings.smokingYears;
      }
    }
    if (settings.alcoholConsumption) {
      document.getElementById('factor-alcohol').value = settings.alcoholConsumption;
    }
    if (settings.stressLevel) {
      document.getElementById('factor-stress').value = settings.stressLevel;
    }
    if (settings.mentalOutlook) {
      document.getElementById('factor-outlook').value = settings.mentalOutlook;
    }
    
    // Update BMI and calculation
    updateBMI();
    updateCalculation();
  });
}

// Setup event listeners
function setupEventListeners() {
  // Back button
  document.getElementById('back-to-main').addEventListener('click', () => {
    if (chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('ashes.html') });
    } else {
      window.location.href = 'ashes.html';
    }
  });
  
  // Recalculate button
  document.getElementById('recalculate-btn').addEventListener('click', () => {
    console.log('Recalculate button clicked');
    saveAndRecalculate();
  });
  
  // Form inputs - auto-save and recalculate
  const inputs = document.querySelectorAll('.form-input, .form-select, input[type="radio"]');
  inputs.forEach(input => {
    input.addEventListener('change', () => {
      if (input.id === 'factor-height' || input.id === 'factor-weight') {
        updateBMI();
      }
      saveAndRecalculate();
    });
  });
  
  // BMI inputs - real-time update
  document.getElementById('factor-height').addEventListener('input', updateBMI);
  document.getElementById('factor-weight').addEventListener('input', updateBMI);
}

// Enhanced radio button event handling
function setupRadioButtons() {
  const radioOptions = document.querySelectorAll('.radio-option');
  
  radioOptions.forEach(option => {
    option.addEventListener('click', function(e) {
      const radio = this.querySelector('input[type="radio"]');
      const radioName = radio.name;
      
      // Clear selection from all options with the same name
      const allOptions = document.querySelectorAll(`input[name="${radioName}"]`);
      allOptions.forEach(r => {
        r.closest('.radio-option').classList.remove('selected');
        r.checked = false;
      });
      
      // Select this option
      radio.checked = true;
      this.classList.add('selected');
      
      // Handle smoking details visibility
      if (radioName === 'factor-smoking') {
        toggleSmokingDetails(radio.value);
      }
      
      // Save and recalculate
      saveAndRecalculate();
    });
    
    // Handle keyboard navigation
    const radio = option.querySelector('input[type="radio"]');
    radio.addEventListener('change', function() {
      if (this.checked) {
        // Clear other selections
        const allOptions = document.querySelectorAll(`input[name="${this.name}"]`);
        allOptions.forEach(r => {
          r.closest('.radio-option').classList.remove('selected');
        });
        
        // Select this one
        this.closest('.radio-option').classList.add('selected');
        
        // Handle smoking details visibility
        if (this.name === 'factor-smoking') {
          toggleSmokingDetails(this.value);
        }
        
        saveAndRecalculate();
      }
    });
  });
}

// Toggle smoking details based on selection
function toggleSmokingDetails(smokingStatus) {
  const smokingDetails = document.getElementById('smoking-details');
  const smokingYearsGroup = document.getElementById('smoking-years-group');
  
  if (smokingStatus === 'true' || smokingStatus === 'former') {
    smokingDetails.style.display = 'block';
    smokingYearsGroup.style.display = 'block';
  } else {
    smokingDetails.style.display = 'none';
    smokingYearsGroup.style.display = 'none';
  }
}

// Update BMI calculation
function updateBMI() {
  const height = parseFloat(document.getElementById('factor-height').value);
  const weight = parseFloat(document.getElementById('factor-weight').value);
  
  const bmiValueElement = document.getElementById('factor-bmi-value');
  const bmiCategoryElement = document.getElementById('factor-bmi-category');
  
  if (height && weight) {
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    
    bmiValueElement.textContent = bmi.toFixed(1);
    
    let category = '';
    let color = '';
    if (bmi < 18.5) {
      category = 'Underweight';
      color = '#3498db';
    } else if (bmi <= 24.9) {
      category = 'Normal';
      color = '#27ae60';
    } else if (bmi <= 29.9) {
      category = 'Overweight';
      color = '#f39c12';
    } else {
      category = 'Obese';
      color = '#e74c3c';
    }
    
    bmiCategoryElement.textContent = category;
    bmiCategoryElement.style.color = color;
  } else {
    bmiValueElement.textContent = '--';
    bmiCategoryElement.textContent = '--';
    bmiCategoryElement.style.color = '';
  }
}

// Save current settings and recalculate
function saveAndRecalculate() {
  // Add visual feedback
  const calcDisplay = document.querySelector('.calculation-display');
  calcDisplay.classList.add('calculating');
  
  setTimeout(() => {
    calcDisplay.classList.remove('calculating');
  }, 500);
  
  // Collect all form data
  const smokingStatus = document.querySelector('input[name="factor-smoking"]:checked')?.value;
  
  // Helper function to safely get element value
  const getValue = (id) => {
    const element = document.getElementById(id);
    return element ? element.value : '';
  };
  
  const settings = {
    // Basic information
    dob: getValue('factor-dob'),
    gender: getValue('factor-gender'),
    country: getValue('factor-country'),
    height: parseFloat(getValue('factor-height')) || null,
    weight: parseFloat(getValue('factor-weight')) || null,
    
    // Fitness and diet
    fitnessLevel: getValue('factor-fitness'),
    dietQuality: getValue('factor-diet'),
    sleepQuality: getValue('factor-sleep'),
    
    // Exercise & Activity
    exerciseFrequency: getValue('factor-exercise-frequency'),
    exerciseType: getValue('factor-exercise-type'),
    exerciseDuration: getValue('factor-exercise-duration'),
    dailySteps: getValue('factor-daily-steps'),
    
    // Nutrition
    waterIntake: getValue('factor-water-intake'),
    fruitsVegetables: getValue('factor-fruits-vegetables'),
    processedFood: getValue('factor-processed-food'),
    mealRegularity: getValue('factor-meal-regularity'),
    
    // Social & Mental Health
    socialConnections: getValue('factor-social-connections'),
    workLifeBalance: getValue('factor-work-life-balance'),
    lifeSatisfaction: getValue('factor-life-satisfaction'),
    purpose: getValue('factor-purpose'),
    meditation: getValue('factor-meditation'),
    
    // Health Maintenance
    medicalCheckups: getValue('factor-medical-checkups'),
    preventiveCare: getValue('factor-preventive-care'),
    supplements: getValue('factor-supplements'),
    dentalCare: getValue('factor-dental-care'),
    
    // Smoking and drinking
    smoking: smokingStatus === 'true' || smokingStatus === 'former',
    smokingStatus: smokingStatus,
    packsPerDay: getValue('factor-packs-per-day'),
    smokingYears: parseFloat(getValue('factor-smoking-years')) || 0,
    alcoholConsumption: getValue('factor-alcohol'),
    stressLevel: getValue('factor-stress'),
    mentalOutlook: getValue('factor-outlook')
  };
  
  // Calculate BMI if height and weight are provided
  if (settings.height && settings.weight) {
    const heightM = settings.height / 100;
    settings.bmi = settings.weight / (heightM * heightM);
  }
  
  // Get existing settings and merge
  chrome.storage.local.get(STORAGE_KEY, (result) => {
    const existingSettings = result[STORAGE_KEY] || {};
    const updatedSettings = { ...existingSettings, ...settings };
    
    // Update the calculation
    if (settings.dob) {
      const dob = new Date(settings.dob);
      const currentAge = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
      if (currentAge > 0 && currentAge < 120) { // Sanity check for age
        const factors = {
          gender: settings.gender || 'male',
          country: settings.country || 'us',
          currentAge: currentAge,
          bmi: settings.bmi,
          smoking: settings.smoking || false,
          packsPerDay: parseFloat(settings.packsPerDay) || (settings.smoking ? 1 : 0),
          smokingYears: settings.smokingYears || (settings.smoking ? Math.max(currentAge - 18, 0) : 0),
          alcoholConsumption: settings.alcoholConsumption || 'never',
          fitnessLevel: settings.fitnessLevel || 'moderate',
          dietQuality: settings.dietQuality || 'average',
          stressLevel: settings.stressLevel || 'moderate',
          sleepQuality: settings.sleepQuality || 'good',
          mentalOutlook: settings.mentalOutlook || 'optimistic',
          // New comprehensive factors
          exerciseFrequency: settings.exerciseFrequency || '',
          exerciseType: settings.exerciseType || '',
          exerciseDuration: settings.exerciseDuration || '',
          dailySteps: settings.dailySteps || '',
          waterIntake: settings.waterIntake || '',
          fruitsVegetables: settings.fruitsVegetables || '',
          processedFood: settings.processedFood || '',
          mealRegularity: settings.mealRegularity || '',
          socialConnections: settings.socialConnections || '',
          workLifeBalance: settings.workLifeBalance || '',
          lifeSatisfaction: settings.lifeSatisfaction || '',
          purpose: settings.purpose || '',
          meditation: settings.meditation || '',
          medicalCheckups: settings.medicalCheckups || '',
          preventiveCare: settings.preventiveCare || '',
          supplements: settings.supplements || '',
          dentalCare: settings.dentalCare || '',
          // Additional Mental Health & Habits
          resilience: settings.resilience || '',
          gratitude: settings.gratitude || '',
          learning: settings.learning || '',
          creativity: settings.creativity || '',
          screenTime: settings.screenTime || '',
          natureTime: settings.natureTime || '',
          morningRoutine: settings.morningRoutine || '',
          eveningRoutine: settings.eveningRoutine || '',
          hobbies: settings.hobbies || '',
          volunteering: settings.volunteering || '',
          spiritualPractice: settings.spiritualPractice || ''
        };
        
        try {
          // Check if the calculation function exists
          if (typeof calculateAdvancedLifeExpectancy === 'function') {
            const result = calculateAdvancedLifeExpectancy(factors);
            updatedSettings.lifespan = Math.round(result.adjustedLifespan);
            
            // Update display
            const lifespanEl = document.getElementById('current-lifespan');
            const ageEl = document.getElementById('current-age');
            const remainingEl = document.getElementById('years-remaining');
            
            if (lifespanEl && ageEl && remainingEl) {
              lifespanEl.textContent = updatedSettings.lifespan;
              ageEl.textContent = currentAge;
              remainingEl.textContent = Math.max(updatedSettings.lifespan - currentAge, 0);
            } else {
              console.error('Could not find calculation display elements');
            }
            
            // Update recommendations
            updateRecommendations(result.recommendations);
            
            console.log('Life expectancy calculated:', result.adjustedLifespan, 'years');
          } else {
            console.error('calculateAdvancedLifeExpectancy function not found');
            // Use fallback calculation
            const baseLifespan = settings.gender === 'female' ? 81 : 76;
            updatedSettings.lifespan = baseLifespan;
            
            const lifespanEl = document.getElementById('current-lifespan');
            const ageEl = document.getElementById('current-age');
            const remainingEl = document.getElementById('years-remaining');
            
            if (lifespanEl && ageEl && remainingEl) {
              lifespanEl.textContent = baseLifespan;
              ageEl.textContent = currentAge;
              remainingEl.textContent = Math.max(baseLifespan - currentAge, 0);
            }
          }
        } catch (error) {
          console.error('Error calculating life expectancy:', error);
          // Use fallback calculation
          const baseLifespan = settings.gender === 'female' ? 81 : 76;
          updatedSettings.lifespan = baseLifespan;
          
          const lifespanEl = document.getElementById('current-lifespan');
          const ageEl = document.getElementById('current-age');
          const remainingEl = document.getElementById('years-remaining');
          
          if (lifespanEl && ageEl && remainingEl) {
            lifespanEl.textContent = baseLifespan;
            ageEl.textContent = currentAge;
            remainingEl.textContent = Math.max(baseLifespan - currentAge, 0);
          }
        }
      } else {
        console.error('Invalid age calculated:', currentAge);
      }
    } else {
      console.log('Date of birth not provided');
      // Show placeholder values
      document.getElementById('current-lifespan').textContent = '--';
      document.getElementById('current-age').textContent = '--';
      document.getElementById('years-remaining').textContent = '--';
    }
    
    // Save to storage
    chrome.storage.local.set({ [STORAGE_KEY]: updatedSettings });
  });
}

// Update calculation display without saving
function updateCalculation() {
  chrome.storage.local.get(STORAGE_KEY, (result) => {
    const settings = result[STORAGE_KEY] || {};
    
    if (settings.dob && settings.lifespan) {
      const dob = new Date(settings.dob);
      const currentAge = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
      if (currentAge > 0 && currentAge < 120) { // Sanity check
        document.getElementById('current-lifespan').textContent = settings.lifespan;
        document.getElementById('current-age').textContent = currentAge;
        document.getElementById('years-remaining').textContent = Math.max(settings.lifespan - currentAge, 0);
      } else {
        console.log('Invalid age or no valid data for calculation');
        document.getElementById('current-lifespan').textContent = '--';
        document.getElementById('current-age').textContent = '--';
        document.getElementById('years-remaining').textContent = '--';
      }
    } else {
      console.log('Missing date of birth or lifespan data');
      // Set default values if no data exists
      document.getElementById('current-lifespan').textContent = '--';
      document.getElementById('current-age').textContent = '--';
      document.getElementById('years-remaining').textContent = '--';
    }
  });
}

// Update health recommendations
function updateRecommendations(recommendations) {
  const recommendationsContainer = document.getElementById('recommendations-content');
  
  if (!recommendations || recommendations.length === 0) {
    recommendationsContainer.innerHTML = '<p class="recommendations-placeholder">Complete your profile above to receive personalized health recommendations based on scientific research.</p>';
    return;
  }
  
  const recommendationsHTML = recommendations.map(rec => `
    <div class="recommendation-item priority-${rec.priority}">
      <h4><i class="fas fa-${getRecommendationIcon(rec.category)}"></i> ${rec.category}</h4>
      <p>${rec.suggestion}</p>
    </div>
  `).join('');
  
  recommendationsContainer.innerHTML = recommendationsHTML;
}

// Get icon for recommendation category
function getRecommendationIcon(category) {
  const icons = {
    'Weight Management': 'weight',
    'Physical Activity': 'running',
    'Smoking Cessation': 'ban',
    'Nutrition': 'apple-alt',
    'Stress Management': 'leaf',
    'Sleep Hygiene': 'bed',
    'exercise': 'running',
    'diet': 'apple-alt',
    'sleep': 'bed',
    'stress': 'leaf',
    'smoking': 'ban',
    'alcohol': 'glass-whiskey',
    'weight': 'weight',
    'general': 'lightbulb'
  };
  return icons[category] || 'lightbulb';
}
