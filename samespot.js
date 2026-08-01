/* ===================================================
   sameSpot — Case Study Header
   VERSION-MARKER: v40-full-rebuild
=================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scrollProgress = document.getElementById('scrollProgress');
  const topnav = document.getElementById('topnav');

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scrollProgress) scrollProgress.style.width = pct + '%';
    if (topnav) topnav.classList.toggle('is-scrolled', scrollTop > 8);
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  function animateCount(el) {
    const target = parseFloat(el.getAttribute('data-count-to'));
    if (isNaN(target)) return;
    const duration = prefersReducedMotion ? 0 : 900;
    const start = performance.now();
    const suffix = el.hasAttribute('data-suffix') ? el.getAttribute('data-suffix') : '%';
    if (duration === 0) {
      el.textContent = target + suffix;
      el.classList.add('is-done');
      return;
    }
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else { el.textContent = target + suffix; el.classList.add('is-done'); }
    }
    requestAnimationFrame(tick);
  }
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { animateCount(entry.target); countObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-count-to]').forEach((el) => countObserver.observe(el));

  function animateBar(el) {
    const target = parseFloat(el.getAttribute('data-target'));
    if (isNaN(target)) return;
    requestAnimationFrame(() => { el.style.width = target + '%'; });
  }
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { animateBar(entry.target); barObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('[data-target]').forEach((el) => barObserver.observe(el));

  const threadObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); threadObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.section-thread').forEach((el) => threadObserver.observe(el));

  const quoteObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); quoteObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.card--quote').forEach((el) => quoteObserver.observe(el));

  // TOC active-link tracking (top-level + nested sub-sections)
  const tocLinks = document.querySelectorAll('.toc__link[href^="#"]');
  const tocMap = {};
  tocLinks.forEach((link) => {
    const id = link.getAttribute('href').replace('#', '');
    if (id) tocMap[id] = link;
  });
  const trackedSections = Array.from(document.querySelectorAll('[data-toc-section]'));
  function setActiveTocLink(id) {
    tocLinks.forEach((l) => l.classList.remove('is-active'));
    const link = tocMap[id];
    if (link) link.classList.add('is-active');
  }
  if (trackedSections.length) {
    const tocObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveTocLink(entry.target.getAttribute('data-toc-section'));
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    trackedSections.forEach((section) => tocObserver.observe(section));
  }

  // Generic accordion toggle (Material / Prozess komplett)
  document.querySelectorAll('.accordion-toggle').forEach((row) => {
    row.addEventListener('click', () => {
      const expanded = row.getAttribute('aria-expanded') === 'true';
      row.setAttribute('aria-expanded', String(!expanded));
    });
  });

});
