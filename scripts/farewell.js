// Farewell (post-uninstall feedback) page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('farewell-form');
  if (!form) return;

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    const reason = document.getElementById('farewell-reason').value;
    const details = document.getElementById('farewell-details').value;

    fetch('https://formspree.io/f/xyzwrkja', {
      method: 'POST',
      body: JSON.stringify({
        '_subject': 'Ashes Farewell Feedback',
        'Reason': reason,
        'Details': details
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Formspree responded with ${response.status}`);
        }
        document.getElementById('feedback-form-container').style.display = 'none';
        document.getElementById('confirmation-message').classList.add('active');
      })
      .catch(error => {
        console.error('Error submitting farewell feedback:', error);
        alert('Sorry, that could not be sent right now.');
      });
  });
});
