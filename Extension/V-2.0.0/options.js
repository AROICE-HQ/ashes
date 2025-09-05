// Handles all the settings & configurations for Ashes

// Switched to PNG because it works better than SVG in this case
document.addEventListener('DOMContentLoaded', () => {
  const logoContainer = document.querySelector('.logo-container');
  if (logoContainer) {
    const logoImg = document.createElement('img');
    logoImg.src = 'assets/flame.png';
    logoImg.alt = 'Ashes Logo';
    logoImg.width = 64;
    logoImg.height = 64;
    logoContainer.appendChild(logoImg);
  }
});

// Our fallback settings
const DEFAULT_SETTINGS = {
  dob: null,
  lifespan: 80,
  gender: 'male',
  country: 'us',
  bmi: null,
  smoking: false,
  packsPerDay: 0,
  smokingYears: 0,
  alcoholConsumption: 'never',
  fitnessLevel: 'moderate',
  dietQuality: 'average',
  stressLevel: 'moderate',
  sleepQuality: 'good',
  mentalOutlook: 'optimistic',
  theme: 'dark',
  displayFormat: 'years_days_hours_minutes_seconds',
  animationEnabled: true,
  notificationEnabled: false,
  shortcutEnabled: false
};

// Storage keys
const STORAGE_KEY = 'ashes-settings';

// DOM elements - Basic settings (only elements that exist in options.html)
const dobInput = document.getElementById('dob-input');
const lifespanInput = document.getElementById('lifespan-input');
const genderSelect = document.getElementById('gender-select');
const countrySelect = document.getElementById('country-select');
const themeSelect = document.getElementById('theme-select');
const formatSelect = document.getElementById('format-select');
const animationToggle = document.getElementById('animation-toggle');
const notificationToggle = document.getElementById('notification-toggle');

// Action buttons
const saveButton = document.getElementById('save-button');
const resetButton = document.getElementById('reset-button');
const saveStatus = document.getElementById('save-status');
const versionNumber = document.getElementById('version-number');

// Simplified calculation for basic settings only
function updateBasicLifespan() {
  // Just update the base lifespan input if user changes basic settings
  // Advanced calculations are now handled in life-factors.html
  if (lifespanInput && lifespanInput.value) {
    const currentLifespan = parseInt(lifespanInput.value, 10);
    if (currentLifespan > 0 && currentLifespan <= 120) {
      // Valid lifespan, no changes needed
      return;
    }
  }
  
  // Set default based on gender and country if no valid input
  const gender = genderSelect.value || 'male';
  const country = countrySelect.value || 'us';
  
  // Basic life expectancy defaults
  const baseLifespans = {
    'male': { 'us': 76, 'uk': 79, 'india': 70, 'other': 75 },
    'female': { 'us': 81, 'uk': 83, 'india': 72, 'other': 80 },
    'other': { 'us': 78, 'uk': 81, 'india': 71, 'other': 77 }
  };
  
  const baseLifespan = baseLifespans[gender]?.[country] || baseLifespans[gender]?.['other'] || 75;
  lifespanInput.value = baseLifespan;
}

// Dynamically get version from manifest
fetch(chrome.runtime.getURL('manifest.json'))
  .then(response => response.json())
  .then(data => {
    versionNumber.textContent = data.version;
  })
  .catch(error => {
    console.error('Error loading version:', error);
    versionNumber.textContent = '1.4.0'; // Fallback version
  });

// Load user preferences from storage
function loadSettings() {
  chrome.storage.local.get(STORAGE_KEY, (result) => {
    let settings = result[STORAGE_KEY];

    // First-time user? Use our defaults
    if (!settings) {
      settings = DEFAULT_SETTINGS;
    }

    // Apply basic settings to form elements
    if (settings.dob) dobInput.value = settings.dob;
    lifespanInput.value = settings.lifespan || DEFAULT_SETTINGS.lifespan;
    genderSelect.value = settings.gender || DEFAULT_SETTINGS.gender;
    countrySelect.value = settings.country || DEFAULT_SETTINGS.country;
    themeSelect.value = settings.theme || DEFAULT_SETTINGS.theme;
    formatSelect.value = settings.displayFormat || DEFAULT_SETTINGS.displayFormat;
    animationToggle.checked = settings.animationEnabled !== false;
    notificationToggle.checked = settings.notificationEnabled === true;

    // Apply the theme
    applyTheme(settings.theme || DEFAULT_SETTINGS.theme);
    
    // Update basic lifespan calculation
    updateBasicLifespan();
  });

  // Set up shortcut settings button handler
  const shortcutButton = document.getElementById('shortcut-settings-button');
  if (shortcutButton) {
    shortcutButton.addEventListener('click', () => {
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    });
  }
}

// Update the visual theme
function applyTheme(theme) {
  // Clean up old themes first
  document.body.classList.remove('theme-dark', 'theme-light', 'theme-minimal');
  
  // Set the new theme
  if (theme === 'light') {
    document.body.classList.add('theme-light');
  } else if (theme === 'minimal') {
    document.body.classList.add('theme-minimal');
  }
  // Default is dark theme (no class needed as it's the root variables)
}

// Save all the user preferences (basic settings only)
function saveSettings() {
  // Get existing settings to preserve advanced factors
  chrome.storage.local.get(STORAGE_KEY, (result) => {
    const existingSettings = result[STORAGE_KEY] || {};
    
    // Update only basic settings, preserve advanced factors
    const settings = {
      ...existingSettings, // Keep all existing settings
      // Update only basic settings
      dob: dobInput.value,
      lifespan: parseInt(lifespanInput.value, 10) || DEFAULT_SETTINGS.lifespan,
      gender: genderSelect.value,
      country: countrySelect.value,
      theme: themeSelect.value,
      displayFormat: formatSelect.value,
      animationEnabled: animationToggle.checked,
      notificationEnabled: notificationToggle.checked,
      shortcutEnabled: false
    };

    // Update theme right away so user sees the change
    applyTheme(settings.theme);

    // Store everything in Chrome storage
    chrome.storage.local.set({[STORAGE_KEY]: settings}, () => {
      // Show success message
      saveStatus.textContent = 'Settings saved!';
      saveStatus.className = 'status-success';
      
      // Clear the message after 3 seconds
      setTimeout(() => {
        saveStatus.textContent = '';
        saveStatus.className = '';
      }, 3000);
    });
  });
}

// Reset everything back to square one (basic settings only)
function resetSettings() {
  // Double-check with user first
  if (confirm('Are you sure you want to reset all settings to default?')) {
    // Apply default settings to form (basic settings only)
    dobInput.value = '';
    lifespanInput.value = DEFAULT_SETTINGS.lifespan;
    genderSelect.value = DEFAULT_SETTINGS.gender;
    countrySelect.value = DEFAULT_SETTINGS.country;
    themeSelect.value = DEFAULT_SETTINGS.theme;
    formatSelect.value = DEFAULT_SETTINGS.displayFormat;
    animationToggle.checked = DEFAULT_SETTINGS.animationEnabled;
    notificationToggle.checked = DEFAULT_SETTINGS.notificationEnabled;
    
    // Save the default settings
    saveSettings();
    
    // Update basic lifespan calculation
    updateBasicLifespan();
    
    saveStatus.textContent = 'Settings reset to defaults!';
    saveStatus.className = 'status-success';
    
    // Clear the message after 3 seconds
    setTimeout(() => {
      saveStatus.textContent = '';
      saveStatus.className = '';
    }, 3000);
  }
}

// Event listeners
saveButton.addEventListener('click', saveSettings);
resetButton.addEventListener('click', resetSettings);

// Preview theme when selection changes
themeSelect.addEventListener('change', () => {
  applyTheme(themeSelect.value);
});

// Real-time calculation updates for basic settings
[genderSelect, countrySelect].forEach(element => {
  element.addEventListener('change', updateBasicLifespan);
});

// Load settings when page is loaded
document.addEventListener('DOMContentLoaded', loadSettings);
