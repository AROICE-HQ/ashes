// About page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Add back to top button
  const backToTopButton = document.createElement('button');
  backToTopButton.textContent = '↑';
  backToTopButton.classList.add('back-to-top');
  backToTopButton.title = 'Back to Top';
  backToTopButton.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(backToTopButton);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopButton.classList.add('visible');
    } else {
      backToTopButton.classList.remove('visible');
    }
  });

  backToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});
