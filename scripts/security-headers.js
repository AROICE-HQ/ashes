/**
 * Security Headers for GitHub Pages
 * 
 * This script checks if security headers are present as meta tags and adds them if missing.
 * Since GitHub Pages doesn't support server-side configuration, we implement security
 * headers through meta tags in the HTML.
 * 
 * This addresses the following security concerns:
 * - Content-Security-Policy: Prevents XSS attacks by controlling allowed content sources
 * - X-Frame-Options: Prevents clickjacking attacks 
 * - X-Content-Type-Options: Prevents MIME-sniffing
 * - Referrer-Policy: Controls referrer information
 * - Permissions-Policy: Restricts browser features/APIs
 */
document.addEventListener('DOMContentLoaded', function() {
  const HEAD = document.head;
  
  // Security headers to check for
  const securityHeaders = [
    {
      name: 'Content-Security-Policy',
      content: "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self';"
    },
    {
      name: 'X-Frame-Options',
      content: 'SAMEORIGIN'
    },
    {
      name: 'X-Content-Type-Options',
      content: 'nosniff'
    },
    {
      name: 'Referrer-Policy',
      content: 'strict-origin-when-cross-origin'
    },
    {
      name: 'Permissions-Policy',
      content: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    }
  ];

  // Check for existing security headers and add missing ones
  securityHeaders.forEach(header => {
    // Check if the header already exists
    const existingHeader = document.querySelector(`meta[http-equiv="${header.name}"]`);
    
    if (!existingHeader) {
      // Create and add the missing header
      const metaTag = document.createElement('meta');
      metaTag.setAttribute('http-equiv', header.name);
      metaTag.setAttribute('content', header.content);
      
      // Insert after charset meta tag if possible
      const charsetMeta = document.querySelector('meta[charset]');
      if (charsetMeta && charsetMeta.nextSibling) {
        HEAD.insertBefore(metaTag, charsetMeta.nextSibling);
      } else {
        HEAD.appendChild(metaTag);
      }
    }
  });
  
  // Add CSP-Report-Only for testing if needed
  // Uncomment this for testing new CSP rules without breaking functionality
  /*
  const reportOnlyMeta = document.createElement('meta');
  reportOnlyMeta.setAttribute('http-equiv', 'Content-Security-Policy-Report-Only');
  reportOnlyMeta.setAttribute('content', "default-src 'self'; report-uri https://your-report-collector.example.com");
  HEAD.appendChild(reportOnlyMeta);
  */
  
  console.log('Security headers have been implemented via meta tags.');
});
