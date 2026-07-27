/* ===================================================
   sameSpot — Case Study Header
   VERSION-MARKER: hat-a11y-trimmed-v38-phone-placeholders
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

  const countEls = document.querySelectorAll('[data-count-to]');

  function animateCount(el) {
    const target = parseFloat(el.getAttribute('data-count-to'));
    if (isNaN(target)) return;
    const duration = prefersReducedMotion ? 0 : 900;
    const start = performance.now();
    const suffix = '%';

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
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target + suffix;
        el.classList.add('is-done');
      }
    }
    requestAnimationFrame(tick);
  }

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  countEls.forEach((el) => countObserver.observe(el));

  const ageBars = document.querySelectorAll('.agebar-row__bar[data-target]');
  const dataBars = document.querySelectorAll('.data-bar__fill[data-target]');

  function animateBar(el) {
    const target = parseFloat(el.getAttribute('data-target'));
    if (isNaN(target)) return;
    requestAnimationFrame(() => {
      el.style.width = target + '%';
    });
  }

  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateBar(entry.target);
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  ageBars.forEach((el) => barObserver.observe(el));
  dataBars.forEach((el) => barObserver.observe(el));

  const threads = document.querySelectorAll('.section-thread');
  const threadObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        threadObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  threads.forEach((el) => threadObserver.observe(el));

  const quoteCards = document.querySelectorAll('.card--quote');
  const quoteObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        quoteObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  quoteCards.forEach((el) => quoteObserver.observe(el));

  const tocLinks = document.querySelectorAll('.toc__link[data-toc]');
  const tocMap = {};
  tocLinks.forEach((link) => {
    const id = link.getAttribute('href').replace('#', '');
    if (id) tocMap[id] = link;
  });

  const sectionsWithIds = Array.from(document.querySelectorAll('main > section[id]'));

  function setActiveTocLink(id) {
    tocLinks.forEach((l) => l.classList.remove('is-active'));
    const link = tocMap[id];
    if (link) link.classList.add('is-active');
  }

  if (sectionsWithIds.length) {
    const tocObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTocLink(entry.target.id);
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

    sectionsWithIds.forEach((section) => tocObserver.observe(section));
  }

  const statMinis = document.querySelectorAll('.stat-mini[data-stat]');
  const researchBlocks = document.querySelectorAll('.research__block[data-stat-trigger]');
  const statMap = {};
  statMinis.forEach((el) => { statMap[el.getAttribute('data-stat')] = el; });

  function setActiveStat(key) {
    statMinis.forEach((el) => {
      const isActive = el.getAttribute('data-stat') === key;
      const wasActive = el.classList.contains('is-active');
      el.classList.toggle('is-active', isActive);
      if (isActive && !wasActive && !prefersReducedMotion) {
        el.classList.add('is-switching');
        setTimeout(() => el.classList.remove('is-switching'), 520);
      }
    });
  }

  if (researchBlocks.length) {
    const researchObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const key = entry.target.getAttribute('data-stat-trigger');
          if (key) setActiveStat(key);
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    researchBlocks.forEach((block) => researchObserver.observe(block));
  }

  const dotGrid = document.getElementById('dotGrid');
  if (dotGrid) {
    const totalDots = 48;
    const accentIndex = 0;
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('span');
      dot.className = 'dot-grid__dot' + (i === accentIndex ? ' is-accent' : '');
      dotGrid.appendChild(dot);
    }
  }

  const ethikCards = document.querySelectorAll('.ethik-card');
  ethikCards.forEach((card) => {
    card.addEventListener('click', () => {
      if (window.matchMedia('(hover: none)').matches) {
        card.classList.toggle('is-tapped');
      }
    });
  });

  const playButtons = document.querySelectorAll('.lofi-card__play, .hifi-proto__play');
  playButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      console.info('Play-Button geklickt, hier später echten Prototyp/Video-Embed einhängen.');
    });
  });

});
