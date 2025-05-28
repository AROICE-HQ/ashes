// Theme switching functionality
document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
    const theme = btn.dataset.theme;
    
    // Remove existing theme classes
    document.body.classList.remove('theme-dark', 'theme-light', 'theme-minimal');
    
    // Apply new theme
    if (theme === 'light') {
        document.body.classList.add('theme-light');
    } else if (theme === 'minimal') {
        document.body.classList.add('theme-minimal');
    }
    
    // Update active button
    document.querySelectorAll('.theme-btn').forEach(button => {
        button.classList.remove('active');
    });
    btn.classList.add('active');
    
    // Save theme preference in local storage
    localStorage.setItem('ashes-theme', theme);
    });
});

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