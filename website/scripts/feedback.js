// Feedback page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const feedbackForm = document.getElementById('feedback-form');
  const formContainer = document.getElementById('feedback-form-container');
  const confirmationMessage = document.getElementById('confirmation-message');
  const backToHomeButton = document.getElementById('back-to-home');
  const backToHomeConfirmation = document.getElementById('back-to-home-confirmation');
  
  // Form submission
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const feedbackType = document.getElementById('feedback-type').value;
      const message = document.getElementById('feedback-message').value;
      const email = document.getElementById('feedback-email').value;
      
      if (!message.trim()) {
        // Add validation error if message is empty
        const messageField = document.getElementById('feedback-message');
        messageField.classList.add('error');
        messageField.focus();
        
        // Remove error class on input
        messageField.addEventListener('input', function() {
          if (this.value.trim()) {
            this.classList.remove('error');
          }
        }, { once: true });
        
        return;
      }
      
      // For demonstration, just show the confirmation
      // In a real app, you would send this data to a server
      console.log({
        type: feedbackType,
        message: message,
        email: email
      });
      
      // Show confirmation
      formContainer.style.display = 'none';
      confirmationMessage.style.display = 'flex';
      
      // Optional: Analytics event
      // if (typeof gtag !== 'undefined') {
      //   gtag('event', 'submit_feedback', {
      //     'feedback_type': feedbackType
      //   });
      // }
    });
  }
  
  // Add animation to form elements
  const formGroups = document.querySelectorAll('.form-group');
  formGroups.forEach((group, index) => {
    group.style.opacity = '0';
    group.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      group.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      group.style.opacity = '1';
      group.style.transform = 'translateY(0)';
    }, 100 * (index + 1));
  });
  
  // Add input focus effects
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.classList.remove('focused');
    });
  });
  
  // Dynamic text area height
  const messageTextarea = document.getElementById('feedback-message');
  if (messageTextarea) {
    messageTextarea.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });
  }
});
