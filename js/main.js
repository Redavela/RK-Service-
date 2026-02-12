/* ===========================
   RK-Service — Main JavaScript
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- Navbar scroll effect ---
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // --- Mobile menu toggle ---
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });

    // Close menu with ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('open');
      }
    });
  }

  // --- Scroll animations (fade-up) ---
  const fadeElements = document.querySelectorAll('.fade-up');
  if (fadeElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => observer.observe(el));
  }

  // --- Multi-step form ---
  const devisForm = document.getElementById('devisForm');
  const successMessage = document.getElementById('successMessage');

  if (devisForm) {
    const steps = devisForm.querySelectorAll('.form-step');
    const indicators = document.querySelectorAll('.step-indicator');
    let currentStep = 1;

    function goToStep(stepNumber) {
      // Hide all steps
      steps.forEach(step => step.classList.remove('active'));
      // Show target step
      const targetStep = devisForm.querySelector(`.form-step[data-step="${stepNumber}"]`);
      if (targetStep) targetStep.classList.add('active');

      // Update indicators
      indicators.forEach(ind => {
        const indStep = parseInt(ind.dataset.step);
        ind.classList.remove('active', 'completed');
        if (indStep === stepNumber) {
          ind.classList.add('active');
        } else if (indStep < stepNumber) {
          ind.classList.add('completed');
        }
      });

      currentStep = stepNumber;
    }

    // Validate current step fields
    function validateStep(stepNumber) {
      const currentStepEl = devisForm.querySelector(`.form-step[data-step="${stepNumber}"]`);
      const requiredFields = currentStepEl.querySelectorAll('[required]');
      let valid = true;

      requiredFields.forEach(field => {
        field.classList.remove('field-error');
        if (!field.value.trim()) {
          field.classList.add('field-error');
          valid = false;
        }
        if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          field.classList.add('field-error');
          valid = false;
        }
      });

      return valid;
    }

    // Next buttons
    devisForm.querySelectorAll('.btn-next').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextStep = parseInt(btn.dataset.next);
        if (validateStep(currentStep)) {
          goToStep(nextStep);
        }
      });
    });

    // Previous buttons
    devisForm.querySelectorAll('.btn-prev').forEach(btn => {
      btn.addEventListener('click', () => {
        const prevStep = parseInt(btn.dataset.prev);
        goToStep(prevStep);
      });
    });

    // Clear error on input
    devisForm.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('input', () => {
        field.classList.remove('field-error');
      });
    });

    // Form submission via Web3Forms
    devisForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateStep(currentStep)) return;

      const submitBtn = devisForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Envoi en cours...';
      submitBtn.disabled = true;

      const formData = new FormData(devisForm);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            devisForm.style.display = 'none';
            document.querySelector('.form-steps-indicator').style.display = 'none';
            if (successMessage) {
              successMessage.classList.add('active');
            }
          } else {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            alert('Une erreur est survenue. Veuillez réessayer ou me contacter directement par email.');
          }
        })
        .catch(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          alert('Erreur de connexion. Veuillez réessayer ou me contacter directement par email.');
        });
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
