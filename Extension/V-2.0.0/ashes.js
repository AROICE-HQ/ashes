// This file powers the countdown timer and UI elements
// Been using PNG images since SVGs were causing some weird rendering glitches
document.addEventListener('DOMContentLoaded', () => {
  const logoContainer = document.querySelector('.ashes-logo');
  if (logoContainer) {
    const logoImg = document.createElement('img');
    logoImg.src = 'assets/flame.png';
    // logoImg.src = 'logo/icon-64x64.png';
    logoImg.alt = 'Ashes Logo';
    logoImg.width = 64;
    logoImg.height = 64;
    logoContainer.appendChild(logoImg);
  }
});

// Default settings - went with 80 years as average lifespan
const DEFAULT_LIFESPAN = 80; // years
const STORAGE_KEY = 'ashes-settings';

// Handle theme switching between dark/light/minimal
function applyTheme(theme) {
  // Need to remove existing themes first to prevent CSS conflicts
  document.body.classList.remove('theme-dark', 'theme-light', 'theme-minimal');
  
  // Apply the selected theme
  if (theme === 'light') {
    document.body.classList.add('theme-light');
  } else if (theme === 'minimal') {
    document.body.classList.add('theme-minimal');
  }
  // Default is dark theme (no class needed as it's the root variables)
}

function getSettings(callback) {
  chrome.storage.local.get(STORAGE_KEY, (result) => {
    callback(result[STORAGE_KEY] || null);
  });
}

function saveSettings(settings) {
  chrome.storage.local.set({[STORAGE_KEY]: settings});
}

function getDOBAndLifespan(callback) {
  getSettings((settings) => {
    let dob = settings?.dob ? new Date(settings.dob) : null;
    // Use the calculated lifespan from advanced settings, fallback to simple lifespan or default
    const lifespan = settings?.lifespan || DEFAULT_LIFESPAN;
    callback(dob, lifespan);
  });
}

function getTimeLeft(dob, lifespan) {
  // Figure out when time's up based on birthdate and expected lifespan
  const targetDate = new Date(dob);
  targetDate.setFullYear(targetDate.getFullYear() + lifespan);
  // Get current time based on user's clock
  const now = new Date();

  // How many seconds left? (never show negative numbers)
  let diff = Math.floor((targetDate - now) / 1000);
  if (diff < 0) diff = 0;
  // Convert seconds to years (including leap years - that's why it's 365.25)
  const secondsPerYear = Math.floor(365.25 * 24 * 60 * 60);
  const years = Math.floor(diff / secondsPerYear);
  let remainingSeconds = diff % secondsPerYear;
  // Break down the rest into days/hours/minutes/seconds
  const days = Math.floor(remainingSeconds / (24 * 60 * 60));
  remainingSeconds %= (24 * 60 * 60);

  const hours = Math.floor(remainingSeconds / (60 * 60));
  remainingSeconds %= (60 * 60);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return { years, days, hours, minutes, seconds };
}

// Track if timer has ended globally
let timerHasEnded = false;

function renderTimer() {
  getDOBAndLifespan((dob, lifespan) => {
    // No birth date? Just show the current time instead
    if (!dob || isNaN(dob)) {
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      const dateString = now.toLocaleDateString();
      document.getElementById('ashes-timer').textContent = `${dateString} ${timeString}`;
      return;
    }
    
    const { years, days, hours, minutes, seconds } = getTimeLeft(dob, lifespan);
    const timerContainer = document.querySelector('.ashes-container');
    const postTimerContainer = document.getElementById('post-timer-container');
    
    // Check if timer has reached zero
    const isTimerZero = years === 0 && days === 0 && hours === 0 && minutes === 0 && seconds === 0;
    
    if (isTimerZero && !timerHasEnded) {
      // Timer has just reached zero
      timerHasEnded = true;
      handleTimerEnd();
      return;
    } else if (isTimerZero) {
      // Timer remains at zero, maintain post-timer state
      return;
    } else if (timerHasEnded) {
      // Timer was reset from zero
      timerHasEnded = false;
      timerContainer.classList.remove('post-timer');
      postTimerContainer.classList.remove('active');
      document.getElementById('ashes-timer').style.display = 'block';
      document.querySelector('.ashes-tagline').style.display = 'block';
    }
    
    // Get display format and theme from settings
    getSettings((settings) => {      // Apply theme if settings exist
      if (settings) {
        applyTheme(settings.theme || 'dark');
        
        // Toggle animations based on settings
        const logoContainer = document.querySelector('.ashes-logo');
        if (settings.animationEnabled === false) {
          logoContainer.style.animation = 'none';
          if (logoContainer.querySelector('img')) {
            logoContainer.querySelector('img').style.filter = 'none';
          }
        } else {
          logoContainer.style.animation = 'ember-glow 2s infinite alternate';
          if (logoContainer.querySelector('img')) {
            logoContainer.querySelector('img').style.filter = 'drop-shadow(0 0 8px var(--accent-secondary))';
          }
        }
        
        // Show timer context if user has completed advanced onboarding
        const timerContext = document.getElementById('timer-context');
        if (settings.hasCompletedOnboarding && settings.dob) {
          timerContext.style.display = 'block';
        } else {
          timerContext.style.display = 'none';
        }
      }
      
      let format = settings?.displayFormat || 'years_days_hours_minutes_seconds';
      let timerText = '';
        switch(format) {
        case 'years_days':
          timerText = `${years}y ${days}d left`;
          break;
        case 'years_days_hours_minutes':
          timerText = `${years}y ${days}d ${hours}h ${minutes}m left`;
          break;
        case 'just_days':
          // Calculate total days (years * 365.25 + days) for "Just Days" format
          const totalDays = Math.floor(years * 365.25) + days;
          timerText = `${totalDays}d left`;
          break;
        default:
          timerText = `${years}y ${days}d ${hours}h ${minutes}m ${seconds}s left`;
      }
      
      document.getElementById('ashes-timer').textContent = timerText;
    });
  });
}

// Handle the timer ending with staged messages
function handleTimerEnd() {
  const timerContainer = document.querySelector('.ashes-container');
  const timerElement = document.getElementById('ashes-timer');
  const taglineElement = document.querySelector('.ashes-tagline');
  const postTimerContainer = document.getElementById('post-timer-container');
  const firstMessage = document.getElementById('post-timer-message');
  const secondMessage = document.getElementById('post-timer-second-message');
  const optionsElement = document.getElementById('post-timer-options');
  
  // Apply special styling for post-timer state
  timerContainer.classList.add('post-timer');
  
  // Hide the regular timer and tagline
  timerElement.style.display = 'none';
  taglineElement.style.display = 'none';
  
  // Show the post-timer container with first message
  postTimerContainer.classList.add('active');
  firstMessage.style.opacity = '0.7'; // "Still here?"
  
  // After 3 seconds, show the second message
  setTimeout(() => {
    secondMessage.style.opacity = '1'; // "Make it count."
    
    // After another 7 seconds (10 total), show the options
    setTimeout(() => {
      optionsElement.style.opacity = '1';
    }, 7000);
  }, 3000);
}

// Update the timer every second to make it feel alive
setInterval(renderTimer, 1000); // refresh every second
renderTimer();

// First time using the app? Let's help them set it up with guided onboarding
getSettings((settings) => {
  const hasOnboarded = settings?.hasCompletedOnboarding;
  
  // Only show onboarding if user has never completed it
  if (!hasOnboarded) {
    setTimeout(() => {
      showOnboardingFlow();
    }, 800); // Slight delay for better UX
  }
});

// Onboarding Flow Management
let onboardingData = {
  dob: null,
  gender: null,
  country: null,
  height: null,
  weight: null,
  bmi: null,
  fitnessLevel: null,
  smoking: false,
  alcoholConsumption: 'never'
};

let currentStep = 0;
const totalSteps = 8;

function showOnboardingFlow() {
  const modal = document.getElementById('onboarding-modal');
  modal.classList.add('active');
  showStep('welcome');
  updateProgress();
}

function showStep(stepName) {
  // Hide all steps
  document.querySelectorAll('.onboarding-step').forEach(step => {
    step.style.display = 'none';
  });
  
  // Show current step
  const currentStepElement = document.getElementById(`step-${stepName}`);
  if (currentStepElement) {
    currentStepElement.style.display = 'block';
    // Add animation
    currentStepElement.style.animation = 'none';
    setTimeout(() => {
      currentStepElement.style.animation = 'fadeInUp 0.4s ease';
    }, 10);
  }
}

function updateProgress() {
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  
  const percentage = (currentStep / totalSteps) * 100;
  progressFill.style.width = `${percentage}%`;
  progressText.textContent = `Step ${currentStep + 1} of ${totalSteps}`;
}

function nextStep() {
  currentStep++;
  updateProgress();
}

function prevStep() {
  currentStep--;
  updateProgress();
}

function calculateBMI(height, weight) {
  if (!height || !weight) return null;
  const heightM = height / 100; // Convert cm to meters
  return weight / (heightM * heightM);
}

function showBMIResult(bmi) {
  const bmiResult = document.getElementById('bmi-result');
  const calculatedBMI = document.getElementById('calculated-bmi');
  const bmiCategory = document.getElementById('bmi-category');
  
  if (bmi) {
    calculatedBMI.textContent = bmi.toFixed(1);
    
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
    
    bmiCategory.textContent = category;
    bmiCategory.style.color = color;
    bmiResult.style.display = 'block';
  } else {
    bmiResult.style.display = 'none';
  }
}

// Onboarding Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Welcome step
  document.getElementById('start-onboarding')?.addEventListener('click', () => {
    nextStep();
    showStep('dob');
  });
  
  document.getElementById('skip-onboarding')?.addEventListener('click', () => {
    nextStep();
    showStep('simple-setup');
  });
  
  document.getElementById('use-clock-only')?.addEventListener('click', () => {
    completeOnboardingWithClockOnly();
  });
  
  // Date of Birth step
  const dobInput = document.getElementById('onboarding-dob');
  const nextDobBtn = document.getElementById('next-dob');
  
  dobInput?.addEventListener('change', () => {
    if (dobInput.value) {
      onboardingData.dob = dobInput.value;
      nextDobBtn.disabled = false;
    } else {
      nextDobBtn.disabled = true;
    }
  });
  
  document.getElementById('prev-dob')?.addEventListener('click', () => {
    prevStep();
    showStep('welcome');
  });
  
  nextDobBtn?.addEventListener('click', () => {
    nextStep();
    showStep('gender');
  });
  
  // Gender step
  const genderOptions = document.querySelectorAll('#step-gender .option-btn');
  const nextGenderBtn = document.getElementById('next-gender');
  
  genderOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      genderOptions.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      onboardingData.gender = btn.dataset.value;
      nextGenderBtn.disabled = false;
    });
  });
  
  document.getElementById('prev-gender')?.addEventListener('click', () => {
    prevStep();
    showStep('dob');
  });
  
  nextGenderBtn?.addEventListener('click', () => {
    nextStep();
    showStep('country');
  });
  
  // Simple Setup step (for users who skipped advanced)
  const simpleDobInput = document.getElementById('simple-dob');
  const nextSimpleBtn = document.getElementById('next-simple');
  
  simpleDobInput?.addEventListener('change', () => {
    if (simpleDobInput.value) {
      nextSimpleBtn.disabled = false;
    } else {
      nextSimpleBtn.disabled = true;
    }
  });
  
  document.getElementById('prev-simple')?.addEventListener('click', () => {
    prevStep();
    showStep('welcome');
  });
  
  nextSimpleBtn?.addEventListener('click', () => {
    // Calculate age and use 80 year default lifespan
    const dob = new Date(simpleDobInput.value);
    const currentAge = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    
    const settings = {
      dob: simpleDobInput.value,
      lifespan: 80, // Default 80 years
      theme: 'dark',
      displayFormat: 'years_days_hours_minutes_seconds',
      animationEnabled: true,
      notificationEnabled: false,
      shortcutEnabled: false,
      hasCompletedOnboarding: true
    };
    
    saveSettings(settings);
    document.getElementById('onboarding-modal').classList.remove('active');
    renderTimer();
  });
  
  // Country step
  const countrySelect = document.getElementById('onboarding-country');
  const nextCountryBtn = document.getElementById('next-country');
  
  countrySelect?.addEventListener('change', () => {
    if (countrySelect.value) {
      onboardingData.country = countrySelect.value;
      nextCountryBtn.disabled = false;
    } else {
      nextCountryBtn.disabled = true;
    }
  });
  
  document.getElementById('prev-country')?.addEventListener('click', () => {
    prevStep();
    showStep('gender');
  });
  
  nextCountryBtn?.addEventListener('click', () => {
    nextStep();
    showStep('health');
  });
  
  // Health step (BMI)
  const heightInput = document.getElementById('onboarding-height');
  const weightInput = document.getElementById('onboarding-weight');
  const nextHealthBtn = document.getElementById('next-health');
  
  function updateBMI() {
    const height = parseFloat(heightInput.value);
    const weight = parseFloat(weightInput.value);
    
    if (height && weight) {
      onboardingData.height = height;
      onboardingData.weight = weight;
      onboardingData.bmi = calculateBMI(height, weight);
      showBMIResult(onboardingData.bmi);
      nextHealthBtn.disabled = false;
    } else {
      nextHealthBtn.disabled = true;
      showBMIResult(null);
    }
  }
  
  heightInput?.addEventListener('input', updateBMI);
  weightInput?.addEventListener('input', updateBMI);
  
  document.getElementById('prev-health')?.addEventListener('click', () => {
    prevStep();
    showStep('country');
  });
  
  nextHealthBtn?.addEventListener('click', () => {
    nextStep();
    showStep('lifestyle');
  });
  
  // Lifestyle step
  const lifestyleOptions = document.querySelectorAll('#step-lifestyle .option-btn');
  const nextLifestyleBtn = document.getElementById('next-lifestyle');
  
  lifestyleOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      lifestyleOptions.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      onboardingData.fitnessLevel = btn.dataset.value;
      nextLifestyleBtn.disabled = false;
    });
  });
  
  document.getElementById('prev-lifestyle')?.addEventListener('click', () => {
    prevStep();
    showStep('health');
  });
  
  nextLifestyleBtn?.addEventListener('click', () => {
    nextStep();
    showStep('habits');
  });
  
  // Habits step
  const habitButtons = document.querySelectorAll('#step-habits .option-btn');
  const nextHabitsBtn = document.getElementById('next-habits');
  let selectedHabits = { smoking: false, alcohol: false };
  
  habitButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const habit = btn.dataset.habit;
      const value = btn.dataset.value;
      
      // Remove selection from same habit group
      document.querySelectorAll(`[data-habit="${habit}"]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      
      if (habit === 'smoking') {
        onboardingData.smoking = value === 'true';
        selectedHabits.smoking = true;
      } else if (habit === 'alcohol') {
        onboardingData.alcoholConsumption = value;
        selectedHabits.alcohol = true;
      }
      
      // Enable next button when both habits are selected
      if (selectedHabits.smoking && selectedHabits.alcohol) {
        nextHabitsBtn.disabled = false;
      }
    });
  });
  
  document.getElementById('prev-habits')?.addEventListener('click', () => {
    prevStep();
    showStep('lifestyle');
  });
  
  nextHabitsBtn?.addEventListener('click', () => {
    nextStep();
    showStep('results');
    calculateAndShowResults();
  });
  
  // Results step
  document.getElementById('prev-results')?.addEventListener('click', () => {
    prevStep();
    showStep('habits');
  });
  
  document.getElementById('complete-onboarding')?.addEventListener('click', () => {
    completeOnboarding();
  });
});

function calculateAndShowResults() {
  // Validate that we have the required onboarding data
  if (!onboardingData.dob || !onboardingData.gender || !onboardingData.country) {
    console.error('Missing required onboarding data:', onboardingData);
    return;
  }

  const dob = new Date(onboardingData.dob);
  const currentAge = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  
  const factors = {
    gender: onboardingData.gender,
    country: onboardingData.country,
    currentAge: currentAge,
    bmi: onboardingData.bmi,
    smoking: onboardingData.smoking,
    packsPerDay: onboardingData.smoking ? 1 : 0, // Assume 1 pack if smoking
    smokingYears: onboardingData.smoking ? Math.max(currentAge - 18, 0) : 0,
    alcoholConsumption: onboardingData.alcoholConsumption,
    fitnessLevel: onboardingData.fitnessLevel,
    dietQuality: 'average', // Default assumption
    stressLevel: 'moderate', // Default assumption
    sleepQuality: 'good', // Default assumption
    mentalOutlook: 'optimistic' // Default assumption
  };
  
  const result = calculateAdvancedLifeExpectancy(factors);
  const yearsRemaining = Math.max(result.adjustedLifespan - currentAge, 0);
  
  // Display the result - show both total lifespan and years remaining
  document.getElementById('final-lifespan').textContent = result.adjustedLifespan;
  
  // Add years remaining display
  const resultsDisplay = document.querySelector('.results-display');
  let remainingDisplay = resultsDisplay.querySelector('.remaining-years');
  if (!remainingDisplay) {
    remainingDisplay = document.createElement('div');
    remainingDisplay.className = 'remaining-years';
    remainingDisplay.innerHTML = `
      <div class="remaining-text">
        <span class="remaining-number">${Math.round(yearsRemaining)}</span>
        <span class="remaining-label">years remaining</span>
      </div>
      <div class="age-context">
        You are currently ${currentAge} years old
      </div>
    `;
    resultsDisplay.appendChild(remainingDisplay);
  } else {
    remainingDisplay.querySelector('.remaining-number').textContent = Math.round(yearsRemaining);
    remainingDisplay.querySelector('.age-context').textContent = `You are currently ${currentAge} years old`;
  }
  
  // Show breakdown
  const breakdown = document.getElementById('result-breakdown');
  const countryDisplay = onboardingData.country ? onboardingData.country.toUpperCase() : 'UNKNOWN';
  const genderDisplay = onboardingData.gender || 'Unknown';
  let breakdownHtml = `<div class="breakdown-item">
    <span>Base expectancy (${countryDisplay}, ${genderDisplay}):</span>
    <span>${result.baseLifespan} years</span>
  </div>`;
  
  result.adjustments.forEach(adj => {
    if (adj.impact !== 'modifier') {
      const className = adj.type === 'positive' ? 'breakdown-positive' : 
                      adj.type === 'negative' ? 'breakdown-negative' : 'breakdown-neutral';
      const sign = adj.adjustment > 0 ? '+' : '';
      breakdownHtml += `<div class="breakdown-item ${className}">
        <span>${adj.factor}:</span>
        <span>${sign}${adj.adjustment} years</span>
      </div>`;
    }
  });
  
  breakdownHtml += `<div class="breakdown-item" style="border-top: 1px solid var(--border-color); margin-top: 0.5rem; padding-top: 0.5rem; font-weight: bold;">
    <span>Total adjustment:</span>
    <span class="${result.totalAdjustment > 0 ? 'breakdown-positive' : 'breakdown-negative'}">
      ${result.totalAdjustment > 0 ? '+' : ''}${result.totalAdjustment} years
    </span>
  </div>`;
  
  breakdownHtml += `<div class="breakdown-summary" style="margin-top: 1rem; padding: 0.8rem; background: var(--accent-primary)20; border-radius: 6px;">
    <div><strong>Your Life Expectancy: ${result.adjustedLifespan} years</strong></div>
    <div><strong>Time Remaining: ${Math.round(yearsRemaining)} years</strong></div>
    <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 0.3rem;">
      This is what your countdown timer will show
    </div>
  </div>`;
  
  breakdown.innerHTML = breakdownHtml;
  
  // Store the calculated lifespan
  onboardingData.calculatedLifespan = Math.round(result.adjustedLifespan);
}

function completeOnboarding() {
  // Save all the collected data
  const settings = {
    dob: onboardingData.dob,
    gender: onboardingData.gender,
    country: onboardingData.country,
    bmi: onboardingData.bmi,
    smoking: onboardingData.smoking,
    packsPerDay: onboardingData.smoking ? 1 : 0,
    smokingYears: onboardingData.smoking ? Math.max(25 - 18, 0) : 0, // Estimate
    alcoholConsumption: onboardingData.alcoholConsumption,
    fitnessLevel: onboardingData.fitnessLevel,
    dietQuality: 'average',
    stressLevel: 'moderate',
    sleepQuality: 'good',
    mentalOutlook: 'optimistic',
    lifespan: onboardingData.calculatedLifespan || 80,
    theme: 'dark',
    displayFormat: 'years_days_hours_minutes_seconds',
    animationEnabled: true,
    notificationEnabled: false,
    shortcutEnabled: false,
    hasCompletedOnboarding: true
  };
  
  saveSettings(settings);
  
  // Close modal and refresh timer
  document.getElementById('onboarding-modal').classList.remove('active');
  renderTimer();
}

function completeOnboardingWithDefaults() {
  const settings = {
    dob: null,
    lifespan: 80,
    theme: 'dark',
    displayFormat: 'years_days_hours_minutes_seconds',
    animationEnabled: true,
    notificationEnabled: false,
    shortcutEnabled: false,
    hasCompletedOnboarding: true
  };
  
  saveSettings(settings);
  document.getElementById('onboarding-modal').classList.remove('active');
  renderTimer();
}

function completeOnboardingWithClockOnly() {
  const settings = {
    dob: null, // No DOB = shows current time/date
    lifespan: 80,
    theme: 'dark',
    displayFormat: 'years_days_hours_minutes_seconds',
    animationEnabled: true,
    notificationEnabled: false,
    shortcutEnabled: false,
    hasCompletedOnboarding: true
  };
  
  saveSettings(settings);
  document.getElementById('onboarding-modal').classList.remove('active');
  renderTimer();
}

// Hamburger menu functionality
const menuBtn = document.getElementById('menu-btn');
const dropdownMenu = document.getElementById('dropdown-menu');

menuBtn.onclick = (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle('active');
};

// Hide menu when user clicks somewhere else
document.body.addEventListener('click', () => {
  dropdownMenu.classList.remove('active');
});

// Quick settings popup handling
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const dobInput = document.getElementById('dob-input');
const lifespanInput = document.getElementById('lifespan-input');
const saveBtn = document.getElementById('save-settings');
const closeBtn = document.getElementById('close-settings');

settingsBtn.onclick = () => {
  dropdownMenu.classList.remove('active');
  getSettings((settings) => {
    dobInput.value = settings?.dob || '2000-01-01';
    lifespanInput.value = settings?.lifespan || DEFAULT_LIFESPAN;
    settingsModal.classList.add('active');
  });
};

closeBtn.onclick = () => settingsModal.classList.remove('active');

saveBtn.onclick = () => {
  getSettings((currentSettings) => {
    let updatedSettings = currentSettings || {};
    updatedSettings.dob = dobInput.value;
    updatedSettings.lifespan = parseInt(lifespanInput.value) || DEFAULT_LIFESPAN;
    
    saveSettings(updatedSettings);
    settingsModal.classList.remove('active');
    renderTimer();
  });
};

// Re-run onboarding button
const rerunOnboardingBtn = document.getElementById('rerun-onboarding');
rerunOnboardingBtn.onclick = () => {
  settingsModal.classList.remove('active');
  
  // Reset onboarding data
  onboardingData = {
    dob: null,
    gender: null,
    country: null,
    height: null,
    weight: null,
    bmi: null,
    fitnessLevel: null,
    smoking: false,
    alcoholConsumption: 'never'
  };
  currentStep = 0;
  
  // Show onboarding flow
  setTimeout(() => {
    showOnboardingFlow();
  }, 300);
};

// Click outside the popup to dismiss it
settingsModal.onclick = (e) => {
  if (e.target === settingsModal) settingsModal.classList.remove('active');
};

// Open the full settings page
const advancedSettingsBtn = document.getElementById('advanced-settings-btn');
advancedSettingsBtn.onclick = () => {
  dropdownMenu.classList.remove('active');
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
};

// Open the life factors page
const lifeFactorsBtn = document.getElementById('life-factors-btn');
lifeFactorsBtn.onclick = () => {
  dropdownMenu.classList.remove('active');
  if (chrome.tabs) {
    chrome.tabs.create({ url: chrome.runtime.getURL('life-factors.html') });
  } else {
    window.open(chrome.runtime.getURL('life-factors.html'));
  }
};

// About me dialog
const aboutBtn = document.getElementById('about-btn');
const aboutModal = document.getElementById('about-modal');
const closeAboutBtn = document.getElementById('close-about');

aboutBtn.onclick = () => {
  dropdownMenu.classList.remove('active');
  aboutModal.classList.add('active');
};

closeAboutBtn.onclick = () => {
  aboutModal.classList.remove('active');
};

aboutModal.onclick = (e) => {
  if (e.target === aboutModal) aboutModal.classList.remove('active');
};

// Changelog popup
const updatesBtn = document.getElementById('updates-btn');
const updatesModal = document.getElementById('updates-modal');
const closeUpdatesBtn = document.getElementById('close-updates');

updatesBtn.onclick = () => {
  dropdownMenu.classList.remove('active');
  updatesModal.classList.add('active');
};

closeUpdatesBtn.onclick = () => {
  updatesModal.classList.remove('active');
};

updatesModal.onclick = (e) => {
  if (e.target === updatesModal) updatesModal.classList.remove('active');
};

// Feedback functionality
const feedbackBtn = document.getElementById('feedback-btn');
// Feedback button now redirects to external feedback page
feedbackBtn.onclick = () => {
  dropdownMenu.classList.remove('active');
  
  // Open the feedback page in a new tab
  chrome.tabs.create({ url: 'https://ashes.aroice.in/feedback' });
};

// Background script might want to change theme
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'apply-theme') {
    applyTheme(message.theme);
    sendResponse({success: true});
  }
  return true; // Need this for async responses
});

// Collection of memento mori quotes
const mementoMoriQuotes = [
  "Life is short, but it is wide. This too shall pass.",
  "What we do in life echoes in eternity.",
  "Memento mori - remember you must die.",
  "Time is the fire in which we burn.",
  "Each day is a gift, not a guarantee.",
  "Live as if you were to die tomorrow. Learn as if you were to live forever.",
  "Time is the most valuable coin in your life.",
  "The fear of death follows from the fear of life. One who lives fully is prepared to die at any time.",
  "Death smiles at us all; all we can do is smile back.",
  "You could leave life right now. Let that determine what you do and say and think.",
  "Remember that you are dust, and to dust you shall return.",
  "Do not act as if you were going to live ten thousand years. Death hangs over you."
];

// Confirmation quotes after adding years
const confirmationQuotes = [
  "Remember to embrace the time you have, for it is the most precious currency.",
  "We must use time wisely and forever realize that the time is always ripe to do right.",
  "Time you enjoy wasting is not wasted time.",
  "Time is what we want most, but what we use worst.",
  "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
  "Yesterday is gone. Tomorrow has not yet come. We have only today."
];

// Get random quote from array
function getRandomQuote(quoteArray) {
  const randomIndex = Math.floor(Math.random() * quoteArray.length);
  return quoteArray[randomIndex];
}

// Timer end handlers
const resetTimerBtn = document.getElementById('reset-timer-btn');
const reflectBtn = document.getElementById('reflect-btn');
const comingSoonElement = document.getElementById('coming-soon');
const addYearsModal = document.getElementById('add-years-modal');
const confirmationModal = document.getElementById('confirmation-modal');
const closeAddYearsBtn = document.getElementById('close-add-years');
const closeConfirmationBtn = document.getElementById('close-confirmation');

// Reset timer button - show year options modal
resetTimerBtn.addEventListener('click', () => {
  // Show add years modal with random memento mori quote
  document.querySelector('.memento-quote').textContent = getRandomQuote(mementoMoriQuotes);
  addYearsModal.classList.add('active');
});

// Close add years modal button
closeAddYearsBtn.addEventListener('click', () => {
  addYearsModal.classList.remove('active');
});

// Close the modal when clicking outside
addYearsModal.addEventListener('click', (e) => {
  if (e.target === addYearsModal) {
    addYearsModal.classList.remove('active');
  }
});

// Close confirmation modal button
closeConfirmationBtn.addEventListener('click', () => {
  confirmationModal.classList.remove('active');
  
  // Reset the timer UI
  timerHasEnded = false;
  document.getElementById('post-timer-container').classList.remove('active');
  document.getElementById('ashes-timer').style.display = 'block';
  document.querySelector('.ashes-tagline').style.display = 'block';
  document.querySelector('.ashes-container').classList.remove('post-timer');
  
  // Refresh the timer display
  renderTimer();
});

// Close the confirmation modal when clicking outside
confirmationModal.addEventListener('click', (e) => {
  if (e.target === confirmationModal) {
    confirmationModal.classList.remove('active');
  }
});

// Handler for each "Add Years" button
function handleAddYears(yearsToAdd) {
  // Get current settings
  getSettings((settings) => {
    if (!settings || !settings.lifespan) {
      settings = { lifespan: DEFAULT_LIFESPAN };
    }
    
    // Add years to lifespan
    settings.lifespan = parseInt(settings.lifespan) + yearsToAdd;
    
    // Save updated settings
    saveSettings(settings);
    
    // Close add years modal
    addYearsModal.classList.remove('active');
    
    // Set confirmation message and show confirmation modal
    document.getElementById('confirmation-title').textContent = `${yearsToAdd} Year${yearsToAdd > 1 ? 's' : ''} Added`;
    document.getElementById('confirmation-quote').textContent = getRandomQuote(confirmationQuotes);
    confirmationModal.classList.add('active');
  });
}

// Add event listeners for year buttons
document.getElementById('add-1-year').addEventListener('click', () => handleAddYears(1));
document.getElementById('add-3-years').addEventListener('click', () => handleAddYears(3));
document.getElementById('add-5-years').addEventListener('click', () => handleAddYears(5));

// Reflect button - show enhanced "coming soon" message with staggered animation
reflectBtn.addEventListener('click', () => {
  // Show the container first
  comingSoonElement.classList.add('active');
  
  // Get all the direct children of the coming-soon element
  const elements = comingSoonElement.children;
  
  // Hide all elements initially
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.opacity = '0';
    elements[i].style.transform = 'translateY(10px)';
    elements[i].style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  }
  
  // Show elements with a stagger effect
  setTimeout(() => {
    for (let i = 0; i < elements.length; i++) {
      setTimeout(() => {
        elements[i].style.opacity = '1';
        elements[i].style.transform = 'translateY(0)';
      }, i * 200); // Stagger by 200ms
    }
  }, 100);
  
  // Hide the message after 4 seconds
  setTimeout(() => {
    // Fade out the entire element
    comingSoonElement.style.opacity = '0';
    comingSoonElement.style.transform = 'translate(-50%, -50%) scale(0.95)';
    
    // Remove from DOM after fade
    setTimeout(() => {
      comingSoonElement.classList.remove('active');
      comingSoonElement.style.opacity = '';
      comingSoonElement.style.transform = '';
      
      // Reset all child elements
      for (let i = 0; i < elements.length; i++) {
        elements[i].style.opacity = '';
        elements[i].style.transform = '';
      }
    }, 500);
  }, 4000);
});

// Listen for storage changes to update timer when life factors change
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes[STORAGE_KEY]) {
    console.log('Settings changed, updating timer...');
    renderTimer(); // Re-render the timer with new lifespan data
  }
});
