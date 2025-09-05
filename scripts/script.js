// Theme switching functionality
document.addEventListener('DOMContentLoaded', () => {
  // Update copyright year
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
  
  // Detect browser and update CTA button
  detectBrowserAndUpdateButton();
  
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  
  if (themeToggle) {
    // Check saved preference
    const savedTheme = localStorage.getItem('ashes-theme');
    
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial theme
    let isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    updateTheme(isDark);
    
    // Toggle theme on click
    themeToggle.addEventListener('click', () => {
      isDark = !isDark;
      updateTheme(isDark);
      localStorage.setItem('ashes-theme', isDark ? 'dark' : 'light');
    });
  }
    function updateTheme(isDark) {
    if (isDark) {
      document.body.classList.remove('theme-light');
      if (themeIcon) themeIcon.className = 'fas fa-sun';
    } else {
      document.body.classList.add('theme-light');
      if (themeIcon) themeIcon.className = 'fas fa-moon';
    }
  }
});

// Brave browser detection function
function isBraveBrowser() {
  return new Promise((resolve) => {
    // Check if navigator.brave is available
    if (navigator.brave && navigator.brave.isBrave) {
      navigator.brave.isBrave().then(result => {
        resolve(result);
      }).catch(() => {
        resolve(false);
      });
    } else {
      // Secondary check: look for Brave-specific features
      const isBrave = navigator.userAgent.includes('Chrome') && 
                     (window.navigator.plugins.length === 0 ||
                      window.navigator.languages.includes('U')) &&
                     !window.navigator.userActivation;
      resolve(isBrave);
    }
  });
}

// Function to detect browser and update the CTA button
async function detectBrowserAndUpdateButton() {
  const browserCTA = document.getElementById('browser-cta');
  const browserIcon = document.getElementById('browser-icon');
  const browserText = document.getElementById('browser-text');
  
  if (!browserCTA || !browserIcon || !browserText) return;
  
  // Default store URL
  let storeURL = "https://chromewebstore.google.com/detail/Ashes%20-%20New%20Tab/ldjabgmogbniabagofffdgkohdeemiim";
  
  
  const userAgent = navigator.userAgent;
  const isBrave = await isBraveBrowser();
  
  // Brave Browser
  if (isBrave) {
    browserText.textContent = "Add to Brave";
    browserIcon.className = "fab fa-chrome"; // Brave uses Chrome store
  }
  // Microsoft Edge
  else if (userAgent.indexOf("Edg") !== -1) {
      browserText.textContent = "Add to Edge";
      browserIcon.className = "fab fa-edge";
      storeURL = "https://microsoftedge.microsoft.com/addons/detail/ashes-new-tab/jaaaiofhkekngalfikbpidbgolncncao";
    }
    // Vivaldi
    else if (userAgent.indexOf("Vivaldi") !== -1) {
      browserText.textContent = "Add to Vivaldi";
      browserIcon.className = "fab fa-chrome"; // Vivaldi uses Chrome store
    }
    // Opera
    else if (userAgent.indexOf("OPR") !== -1 || userAgent.indexOf("Opera") !== -1) {
      browserText.textContent = "Add to Opera";
      browserIcon.className = "fab fa-opera";
    }
    // Firefox
    else if (userAgent.indexOf("Firefox") !== -1) {
      browserText.textContent = "Add to Firefox";
      browserIcon.className = "fab fa-firefox";
      storeURL = "https://addons.mozilla.org/firefox/addon/ashes-new-tab";
    }
    // Default to Chrome
    else {
      browserText.textContent = "Add to Chrome";
      browserIcon.className = "fab fa-chrome";
    }
    
    // Update the button URL
    browserCTA.href = storeURL;
  }
;

// Load saved theme if exists
const savedTheme = localStorage.getItem('ashes-theme');
if (savedTheme) {
    document.querySelectorAll('.theme-btn').forEach(btn => {
    if (btn.dataset.theme === savedTheme) {
        btn.click();
    }
    });
}
    // Form submission handling
document.getElementById('feedback-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const feedbackMessage = document.getElementById('feedback-message').value;
    
    if (!feedbackMessage || feedbackMessage.trim() === '') {
    alert('Please enter your feedback message before sending.');
    return;
    }
    
    // Get form data
    const feedbackType = document.getElementById('feedback-type').value;
    const email = document.getElementById('feedback-email').value;
    // Submit form data using fetch to formspree.io (which allows CORS)
    fetch('https://formspree.io/f/xyzwrkja', {
    method: 'POST',
    body: JSON.stringify({
        'Feedback Type': feedbackType,
        'Message': feedbackMessage,
        'Email': email
    }),
    headers: {
        'Content-Type': 'application/json'
    }
    })
    .then(response => {
    // Show confirmation message
    document.getElementById('feedback-form-container').style.display = 'none';
    document.getElementById('confirmation-message').classList.add('active');
    })      .catch(error => {
    console.error('Error submitting form:', error);
    // Still show the confirmation message to improve UX even if there's an error
    document.getElementById('feedback-form-container').style.display = 'none';
    document.getElementById('confirmation-message').classList.add('active');
    });
});

// Handle "Back to Ashes" links
document.getElementById('back-to-ashes').addEventListener('click', function(event) {
    event.preventDefault();
    window.close(); // Try to close the window first (works in some contexts)
    
    // For browsers that don't allow window.close(), try to redirect to parent extension
    // or go back to previous page if this is embedded in the extension
    if (window.history.length > 1) {
    window.history.back();
    } else if (window.parent && window.parent !== window) {
    window.parent.postMessage('closeAshesModal', '*');
    }
});

// Same functionality for confirmation message link
document.getElementById('back-to-ashes-confirmation').addEventListener('click', function(event) {
    event.preventDefault();
    window.close();
    
    if (window.history.length > 1) {
    window.history.back();
    } else if (window.parent && window.parent !== window) {
    window.parent.postMessage('closeAshesModal', '*');
    }
});