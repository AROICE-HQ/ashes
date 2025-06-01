/**
 * Security Header Validator
 * 
 * This script validates that all security headers are properly implemented
 * across the website. It logs results to the console for debugging.
 */

(function() {
  const validateSecurityHeaders = () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 SECURITY HEADERS VALIDATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Required security headers
    const requiredHeaders = [
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Permissions-Policy'
    ];
    
    let allHeadersPresent = true;
    
    // Check each required header
    requiredHeaders.forEach(headerName => {
      const metaTag = document.querySelector(`meta[http-equiv="${headerName}"]`);
      
      if (metaTag) {
        console.log(`✅ ${headerName}: ${metaTag.getAttribute('content').substring(0, 50)}...`);
      } else {
        console.log(`❌ ${headerName}: Missing!`);
        allHeadersPresent = false;
      }
    });
    
    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (allHeadersPresent) {
      console.log('✅ All security headers are properly implemented');
    } else {
      console.warn('⚠️ Some security headers are missing! Check implementation.');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  };

  // Run validation when document is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', validateSecurityHeaders);
  } else {
    validateSecurityHeaders();
  }
})();
