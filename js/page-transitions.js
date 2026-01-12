/**
 * Page Transitions using Barba.js
 * Smooth fade transitions between pages
 */

(function() {
  'use strict';

  // Initial page fade-in on first load
  // CSS starts container at opacity: 0, JS fades it in
  function initPageFadeIn() {
    var container = document.querySelector('[data-barba="container"]');
    if (container) {
      // Small delay to ensure styles are applied, then fade in
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          container.style.opacity = '1';
        });
      });
    }
  }

  // Run initial fade-in as soon as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageFadeIn);
  } else {
    initPageFadeIn();
  }

  // Initialize Barba.js when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    
    // Check if Barba is available
    if (typeof barba === 'undefined') {
      console.warn('Barba.js not loaded');
      return;
    }

    barba.init({
      // Prevent transitions on same-page anchors and external links
      prevent: function({ el }) {
        // Skip if link has data-barba-prevent attribute
        if (el.hasAttribute('data-barba-prevent')) return true;
        
        // Skip external links
        if (el.hostname !== window.location.hostname) return true;
        
        // Skip anchor links on same page
        if (el.pathname === window.location.pathname && el.hash) return true;
        
        // Skip links with target="_blank"
        if (el.target === '_blank') return true;
        
        return false;
      },

      transitions: [{
        name: 'fade',
        
        // Leave animation - fade out current page
        leave: function(data) {
          return new Promise(function(resolve) {
            var current = data.current.container;
            current.style.transition = 'opacity 400ms ease';
            current.style.opacity = '0';
            
            // Wait for CSS transition to complete
            setTimeout(function() {
              resolve();
            }, 400);
          });
        },

        // Enter animation - fade in new page
        enter: function(data) {
          return new Promise(function(resolve) {
            var next = data.next.container;
            
            // Start with opacity 0
            next.style.opacity = '0';
            next.style.transition = 'opacity 400ms ease';
            
            // Trigger reflow to ensure transition works
            next.offsetHeight;
            
            // Fade in
            requestAnimationFrame(function() {
              next.style.opacity = '1';
            });
            
            // Wait for CSS transition to complete
            setTimeout(function() {
              next.style.opacity = '';
              next.style.transition = '';
              resolve();
            }, 400);
          });
        },

        // After transition completes
        after: function(data) {
          // Scroll to top of page
          window.scrollTo(0, 0);
          
          // Reinitialize any scripts that need to run on new page
          reinitializeScripts();
        }
      }]
    });

    /**
     * Reinitialize scripts after page transition
     * Add any page-specific initialization here
     */
    function reinitializeScripts() {
      // Reset mobile nav menu state - remove any stuck inline styles
      var navMenus = document.querySelectorAll('.w-nav-menu');
      navMenus.forEach(function(menu) {
        menu.style.display = '';
        menu.style.transform = '';
        menu.style.height = '';
      });
      
      // Reset nav button state
      var navButtons = document.querySelectorAll('.w-nav-button');
      navButtons.forEach(function(button) {
        button.classList.remove('w--open');
      });
      
      // Reinitialize Webflow interactions if available
      if (window.Webflow) {
        window.Webflow.destroy();
        window.Webflow.ready();
        // Reinitialize nav module
        if (window.Webflow.require) {
          try {
            window.Webflow.require('ix2').init();
          } catch (e) {
            // ix2 may not be available on all pages
          }
        }
      }

      // Reinitialize any Lottie players
      var lottiePlayers = document.querySelectorAll('dotlottie-player, lottie-player');
      lottiePlayers.forEach(function(player) {
        if (player.load) {
          player.load();
        }
      });

      // Reinitialize video backgrounds
      var videos = document.querySelectorAll('video[autoplay]');
      videos.forEach(function(video) {
        video.play().catch(function() {
          // Autoplay may be blocked, that's okay
        });
      });

      // Reinitialize Lucide icons
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }
    }

  });
})();

