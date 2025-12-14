/**
 * Contact Form Handler
 * Handles form submission and sends data to API endpoint
 */

(function() {
  'use strict';

  let formInitialized = false;

  function initContactForm() {
    // Prevent duplicate initialization
    if (formInitialized) {
      const form = document.getElementById('contact-form');
      if (form && form.dataset.handlerAttached) {
        return;
      }
    }

    const form = document.getElementById('contact-form');
    if (!form) {
      console.error('Contact form not found!');
      return;
    }

    // Mark as initialized
    form.dataset.handlerAttached = 'true';
    formInitialized = true;
    console.log('Contact form handler initialized');

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.innerHTML : 'Send message';
    const messageContainer = document.getElementById('form-message');

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('Form submitted');

      // Get form data
      const formData = new FormData(form);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message') || ''
      };
      console.log('Form data:', data);

      // Validate
      if (!data.name || !data.email) {
        showMessage('Please fill in all required fields.', 'error');
        return;
      }

      // Show loading state
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = 'Sending...';
        submitButton.style.opacity = '0.6';
        submitButton.style.cursor = 'not-allowed';
      }

      // Hide previous messages
      if (messageContainer) {
        messageContainer.style.display = 'none';
      }

      try {
        console.log('Sending request to /api/contact');
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response data:', result);

        if (response.ok && result.success) {
          // Success
          showMessage(result.message || 'Thank you! Your message has been sent successfully.', 'success');
          form.reset();
        } else {
          // Error from API
          showMessage(result.error || 'Something went wrong. Please try again.', 'error');
        }
      } catch (error) {
        // Network or other error
        console.error('Form submission error:', error);
        showMessage('Network error. Please check your connection and try again.', 'error');
      } finally {
        // Reset button state
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonText;
          submitButton.style.opacity = '1';
          submitButton.style.cursor = 'pointer';
        }
      }
    });

    function showMessage(text, type) {
      if (!messageContainer) return;

      messageContainer.textContent = text;
      messageContainer.className = 'form-message form-message--' + type;
      messageContainer.style.display = 'block';

      // Scroll to message if needed
      messageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Auto-hide success messages after 5 seconds
      if (type === 'success') {
        setTimeout(function() {
          messageContainer.style.display = 'none';
        }, 5000);
      }
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }

  // Reinitialize after Barba.js page transitions
  if (typeof barba !== 'undefined') {
    document.addEventListener('barba:after', function() {
      formInitialized = false;
      setTimeout(initContactForm, 100);
    });
  }
})();
