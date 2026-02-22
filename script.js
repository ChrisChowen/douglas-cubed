/* ==========================================================================
   Douglas³ — The Thermodynamics of AI Creativity
   script.js — All interactions
   ========================================================================== */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- HERO PARTICLE CANVAS ----------
  const heroCanvas = document.getElementById('hero-canvas');
  const ctx = heroCanvas.getContext('2d');
  const heroSection = document.querySelector('.section--hero');
  let particles = [];
  let heroVisible = true;
  let mouseX = -9999;
  let mouseY = -9999;
  const PARTICLE_COUNT = 70;
  const COLORS = ['rgba(255,229,0,', 'rgba(255,140,0,', 'rgba(255,68,68,'];
  const CONNECT_DIST = 120;
  const REPEL_RADIUS = 130;

  function resizeCanvas() {
    heroCanvas.width = heroSection.offsetWidth;
    heroCanvas.height = heroSection.offsetHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * heroCanvas.width,
        y: Math.random() * heroCanvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.4 + 0.15,
      });
    }
  }

  function drawParticles() {
    if (!heroVisible) return;
    ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      // Mouse repulsion
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < REPEL_RADIUS && dist > 0) {
        const force = (REPEL_RADIUS - dist) / REPEL_RADIUS * 0.8;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // Friction
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < 0) p.x = heroCanvas.width;
      if (p.x > heroCanvas.width) p.x = 0;
      if (p.y < 0) p.y = heroCanvas.height;
      if (p.y > heroCanvas.height) p.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();

      // Connections
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const cdx = p.x - p2.x;
        const cdy = p.y - p2.y;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cdist < CONNECT_DIST) {
          const lineAlpha = (1 - cdist / CONNECT_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = 'rgba(255,229,0,' + lineAlpha + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawParticles);
  }

  if (!reducedMotion) {
    resizeCanvas();
    createParticles();
    requestAnimationFrame(drawParticles);

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });
    heroSection.addEventListener('mouseleave', () => {
      mouseX = -9999;
      mouseY = -9999;
    });

    // Pause when hero scrolls out
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        ([entry]) => { heroVisible = entry.isIntersecting; if (heroVisible) requestAnimationFrame(drawParticles); },
        { threshold: 0 }
      ).observe(heroSection);
    }

    window.addEventListener('resize', () => {
      resizeCanvas();
      createParticles();
    });
  }

  // ---------- SCROLL PROGRESS BAR ----------
  const progressBar = document.querySelector('.scroll-progress');

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = percent + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // ---------- SCROLL REVEAL (Intersection Observer) ----------
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: show everything immediately
    revealElements.forEach((el) => el.classList.add('revealed'));
  }

  // ---------- INTRO WORD REVEAL ----------
  document.querySelectorAll('[data-word-reveal]').forEach((el) => {
    const text = el.textContent.trim();
    el.textContent = '';
    text.split(/\s+/).forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'word-span';
      span.style.setProperty('--word-index', i);
      span.textContent = word;
      el.appendChild(span);
      // Add space between words
      el.appendChild(document.createTextNode(' '));
    });
  });

  // Reveal intro cards when they scroll into view
  const introCards = document.querySelectorAll('[data-intro]');
  if ('IntersectionObserver' in window && introCards.length) {
    const introObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          } else {
            entry.target.classList.remove('revealed');
          }
        });
      },
      { threshold: 0.5 }
    );
    introCards.forEach((card) => introObserver.observe(card));
  }

  // ---------- MOBILE MENU ----------
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = mobileMenu.querySelectorAll('a');

  function toggleMenu() {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isOpen);
    mobileMenu.setAttribute('aria-hidden', isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }

  function closeMenu() {
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', toggleMenu);
  mobileLinks.forEach((link) => link.addEventListener('click', closeMenu));

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
      closeDouglases();
    }
  });

  // ---------- SMOOTH SCROLL FOR NAV LINKS ----------
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.site-header').offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---------- "DON'T PANIC" EASTER EGG ----------
  const dontPanic = document.querySelector('.dont-panic');
  let lastScrollY = window.scrollY;
  let lastScrollTime = Date.now();
  let panicTimeout = null;
  let panicCooldown = false;

  function checkScrollVelocity() {
    const now = Date.now();
    const dt = now - lastScrollTime;
    const dy = Math.abs(window.scrollY - lastScrollY);

    if (dt > 0 && dt < 200) {
      const velocity = dy / dt; // px per ms
      if (velocity > 8 && !panicCooldown) {
        panicCooldown = true;
        dontPanic.classList.add('visible');
        clearTimeout(panicTimeout);
        panicTimeout = setTimeout(() => {
          dontPanic.classList.remove('visible');
          setTimeout(() => { panicCooldown = false; }, 5000);
        }, 1200);
      }
    }

    lastScrollY = window.scrollY;
    lastScrollTime = now;
  }

  // Only enable on non-reduced-motion
  if (!reducedMotion) {
    window.addEventListener('scroll', checkScrollVelocity, { passive: true });
  }

  // ---------- THREE DOUGLASES EASTER EGG ----------
  const douglasesEgg = document.querySelector('.douglases-egg');
  const douglasesClose = document.querySelector('.douglases-close');

  function openDouglases() {
    douglasesEgg.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDouglases() {
    douglasesEgg.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Clicking any sup "3" in a logo triggers the easter egg
  document.querySelectorAll('.logo sup, .hero-brand sup').forEach((sup) => {
    sup.style.cursor = 'pointer';
    sup.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openDouglases();
    });
  });

  if (douglasesClose) {
    douglasesClose.addEventListener('click', closeDouglases);
  }
  douglasesEgg.addEventListener('click', (e) => {
    if (e.target === douglasesEgg) closeDouglases();
  });

  // ---------- SKIP LINK ----------
  const skipLink = document.createElement('a');
  skipLink.href = '#neologisms';
  skipLink.className = 'skip-link';
  skipLink.textContent = 'Skip to neologisms';
  document.body.prepend(skipLink);

  // ---------- FLOATING TERM COUNTER ----------
  const termCounter = document.querySelector('.term-counter');
  const termCounterCurrent = document.querySelector('.term-counter-current');
  const termCards = document.querySelectorAll('.term-card');
  const neologismsSection = document.querySelector('.section--neologisms');

  if ('IntersectionObserver' in window && termCounter && termCards.length) {
    // Show/hide counter based on neologisms section visibility
    new IntersectionObserver(
      ([entry]) => {
        termCounter.classList.toggle('visible', entry.isIntersecting);
      },
      { threshold: 0 }
    ).observe(neologismsSection);

    // Track which card is in view
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(termCards).indexOf(entry.target);
            if (index >= 0) {
              termCounterCurrent.textContent = String(index + 1).padStart(2, '0');
            }
          }
        });
      },
      { threshold: 0.3, rootMargin: '-20% 0px -60% 0px' }
    );
    termCards.forEach((card) => cardObserver.observe(card));
  }

  // ---------- ACTIVE NAV HIGHLIGHTING ----------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav a');

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              link.style.color =
                link.getAttribute('href') === '#' + id
                  ? 'var(--color-primary)'
                  : '';
            });
          }
        });
      },
      { threshold: 0.2, rootMargin: '-20% 0px -60% 0px' }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  // ---------- HEADER HIDE ON SCROLL ----------
  const siteHeader = document.querySelector('.site-header');
  let prevScrollY = window.scrollY;

  function handleHeaderScroll() {
    const currentY = window.scrollY;
    if (currentY > 100 && currentY > prevScrollY) {
      siteHeader.classList.add('header-hidden');
    } else {
      siteHeader.classList.remove('header-hidden');
    }
    prevScrollY = currentY;
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  // ---------- CUSTOM CURSOR (Desktop Only) ----------
  const customCursor = document.querySelector('.custom-cursor');
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (isFinePointer && customCursor && !reducedMotion) {
    document.body.classList.add('cursor-active');
    let cursorX = 0, cursorY = 0;
    let actualX = 0, actualY = 0;

    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
    });

    function animateCursor() {
      actualX += (cursorX - actualX) * 0.15;
      actualY += (cursorY - actualY) * 0.15;
      customCursor.style.left = actualX + 'px';
      customCursor.style.top = actualY + 'px';
      requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);

    // Hover state on interactive elements
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, summary, [role="button"], .term-card')) {
        customCursor.classList.add('cursor-hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, summary, [role="button"], .term-card')) {
        customCursor.classList.remove('cursor-hover');
      }
    });
  }

  // ---------- KEYBOARD NAVIGATION (j/k) ----------
  const allTermCards = Array.from(document.querySelectorAll('.term-card'));
  let currentTermIndex = -1;

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const header = document.querySelector('.site-header');
    const headerH = header ? header.offsetHeight : 0;

    if (e.key === 'j') {
      if (allTermCards.length === 0) return;
      e.preventDefault();
      currentTermIndex = Math.min(currentTermIndex + 1, allTermCards.length - 1);
      const top = allTermCards[currentTermIndex].getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    } else if (e.key === 'k') {
      if (allTermCards.length === 0) return;
      e.preventDefault();
      currentTermIndex = Math.max(currentTermIndex - 1, 0);
      const top = allTermCards[currentTermIndex].getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
})();
