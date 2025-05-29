// Theme switching functionality
document.addEventListener('DOMContentLoaded', () => {
  // Update copyright year
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
  
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
  
  // FAQ Accordion functionality
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      // Toggle active class on clicked item
      const isActive = item.classList.contains('active');
      
      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });
      
      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
    });
  });
  
  // Category filtering
  const categoryButtons = document.querySelectorAll('.category-button');
  const faqSections = document.querySelectorAll('.faq-section');
  
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');
      
      // Update active button
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
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
  }
});
