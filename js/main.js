/* ===========================
   RKService — Main JavaScript
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

  // --- Particles Canvas ---
  const canvas = document.getElementById('particlesCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const hero = canvas.closest('.hero');
    let particles = [];
    let mouse = { x: null, y: null, radius: 120 };
    const particleCount = window.innerWidth < 768 ? 40 : 80;
    const connectionDistance = 140;

    function resizeCanvas() {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    hero.style.pointerEvents = 'auto';
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    hero.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.baseAlpha = Math.random() * 0.5 + 0.3;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        if (mouse.x !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += dx / dist * force * 2;
            this.y += dy / dist * force * 2;
          }
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212, 43, 43, ' + this.baseAlpha + ')';
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(126, 200, 227, ' + alpha + ')';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawConnections();
      requestAnimationFrame(animate);
    }
    animate();
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
