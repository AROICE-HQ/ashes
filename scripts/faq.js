// FAQ page specific JavaScript
// Copyright year and theme toggle are already handled by script.js,
// which this page also loads — do not duplicate that logic here.
document.addEventListener('DOMContentLoaded', () => {
  // FAQ Accordion functionality
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item, index) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const answerId = `faq-answer-${index}`;

    // Accordion triggers are plain divs in the markup; give them the
    // keyboard/ARIA affordance of a real disclosure button.
    answer.id = answerId;
    question.setAttribute('role', 'button');
    question.setAttribute('tabindex', '0');
    question.setAttribute('aria-expanded', 'false');
    question.setAttribute('aria-controls', answerId);

    const toggleItem = () => {
      const isActive = item.classList.contains('active');

      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('active', !isActive);
      question.setAttribute('aria-expanded', String(!isActive));
    };

    question.addEventListener('click', toggleItem);
    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleItem();
      }
    });
  });
  
  // Category filtering
  const categoryButtons = document.querySelectorAll('.category-button');
  const faqSections = document.querySelectorAll('.faq-section');
  
  categoryButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));

    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');

      // Update active button
      categoryButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
      
      // Filter sections
      if (category === 'all') {
        faqSections.forEach(section => {
          section.style.display = 'block';
        });
      } else {
        faqSections.forEach(section => {
          if (section.getAttribute('data-category') === category) {
            section.style.display = 'block';
          } else {
            section.style.display = 'none';
          }
        });
      }
    });
  });
  
  // Search functionality
  const searchInput = document.getElementById('faq-search');
  const searchNoResults = document.getElementById('search-no-results');
  
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const searchTerm = searchInput.value.toLowerCase();
      let hasResults = false;
      
      if (searchTerm.length < 2) {
        // If search is empty or too short, show all items and categories
        faqSections.forEach(section => {
          section.style.display = 'block';
          
          const items = section.querySelectorAll('.faq-item');
          items.forEach(item => {
            item.style.display = 'block';
          });
        });
        
        categoryButtons.forEach(button => {
          button.disabled = false;
          button.style.opacity = 1;
        });
        
        if (searchNoResults) searchNoResults.style.display = 'none';
        return;
      }
      
      // Disable category filtering during search
      categoryButtons.forEach(button => {
        button.classList.remove('active');
        button.disabled = true;
        button.style.opacity = 0.5;
      });
      
      categoryButtons[0].classList.add('active'); // Keep "All" selected
      
      // Show all sections for searching
      faqSections.forEach(section => {
        section.style.display = 'block';
        
        // Search in question text
        const items = section.querySelectorAll('.faq-item');
        let sectionHasResults = false;
        
        items.forEach(item => {
          const question = item.querySelector('.faq-question').textContent.toLowerCase();
          const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
          
          if (question.includes(searchTerm) || answer.includes(searchTerm)) {
            item.style.display = 'block';
            sectionHasResults = true;
            hasResults = true;
          } else {
            item.style.display = 'none';
          }
        });
        
        // Hide sections with no matching questions
        if (!sectionHasResults) {
          section.style.display = 'none';
        }
      });
      
      // Show no results message if needed
      if (searchNoResults) {
        searchNoResults.style.display = hasResults ? 'none' : 'block';
      }
    });
  }
  
  // Back to top button
  const backToTopButton = document.getElementById('back-to-top');

  if (backToTopButton) {
    backToTopButton.setAttribute('role', 'button');
    backToTopButton.setAttribute('tabindex', '0');
    backToTopButton.setAttribute('aria-label', 'Back to top');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    });

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    backToTopButton.addEventListener('click', scrollToTop);
    backToTopButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToTop();
      }
    });
  }
});
