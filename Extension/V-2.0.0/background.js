// Background service worker - handles events and communication behind the scenes
let EXTENSION_VERSION = '1.3.1';
const STORAGE_KEY = 'ashes-settings';

// Dynamically get version from manifest when available
fetch(self.registration.scope + 'manifest.json')
  .then(response => response.json())
  .then(data => {
    EXTENSION_VERSION = data.version;
  })
  .catch(error => console.error('Error loading version in background:', error));

// Listen for storage changes to keep UI in sync across tabs
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes[STORAGE_KEY]) {
    const newSettings = changes[STORAGE_KEY].newValue;      // Regular updates happen on next timer tick
    // For theme changes though, let's update immediately for better UX
    if (newSettings && newSettings.theme) {
      chrome.tabs.query({url: chrome.runtime.getURL('ashes.html')}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {action: 'apply-theme', theme: newSettings.theme});
        });
      });
    }
    
    // Shortcut settings are now managed via chrome://extensions/shortcuts
  }
});

// Open options page when user clicks the extension icon in toolbar
chrome.action.onClicked.addListener(() => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});

// Track extension installations and updates
chrome.runtime.onInstalled.addListener((details) => {
  const currentVersion = chrome.runtime.getManifest().version;
  const reason = details.reason;
  
  console.log(`Ashes ${currentVersion} - ${reason}`);
  
  if (reason === 'install') {
    // First time installation
    chrome.storage.local.set({ 
      'installDate': Date.now(),
      'installVersion': currentVersion
    });
    
    // Open onboarding page on install
    chrome.tabs.create({ url: 'ashes.html' });  }   else if (reason === 'update') {
    // Extension was updated to a newer version
    const previousVersion = details.previousVersion;
    chrome.storage.local.set({ 
      'lastUpdateDate': Date.now(),
      'previousVersion': previousVersion
    });
    
    // TODO: Need to add a "what's new" feature for updates
  }
    // Shortcuts are now managed via chrome://extensions/shortcuts
  // No need to load settings for shortcuts
});

// Handle browser startup events
chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started with Ashes installed');
  
  // Update session counters
  chrome.storage.local.get(['sessionCount'], (result) => {
    const count = result.sessionCount || 0;
    chrome.storage.local.set({ 'sessionCount': count + 1 });
  });
    // Shortcuts are now managed via chrome://extensions/shortcuts
});

// Note: Shortcut handling is now managed via chrome://extensions/shortcuts directly
// No need for custom shortcut state management

// Listen for keyboard shortcut commands
chrome.commands.onCommand.addListener((command) => {
  if (command === '_execute_action') {
    // Check if shortcuts are enabled before handling the command
    chrome.storage.local.get(['shortcutEnabled', STORAGE_KEY], (result) => {
      // Get shortcutEnabled from direct property or from settings
      const shortcutEnabled = result.shortcutEnabled !== undefined 
        ? result.shortcutEnabled 
        : (result[STORAGE_KEY] && result[STORAGE_KEY].shortcutEnabled !== false);
      
      if (shortcutEnabled !== false) {
        // Execute the action only if shortcuts are enabled
        if (chrome.runtime.openOptionsPage) {
          chrome.runtime.openOptionsPage();
        } else {
          window.open(chrome.runtime.getURL('options.html'));
        }
      } else {
        console.log('Keyboard shortcut is disabled in settings');
      }
    });
  }
});

// Listen for messages from content/pages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getVersion') {
    sendResponse({ version: EXTENSION_VERSION });
    return true;
  }
});

