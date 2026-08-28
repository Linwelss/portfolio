(function () {
  'use strict';

  document.documentElement.classList.add('js-ready');

  /* ---------- Scroll progress bar ---------- */
  var progressEl = document.getElementById('scrollProgress');
  function updateProgress() {
    if (!progressEl) return;
    var h = document.documentElement;
    var scrollTop = h.scrollTop || document.body.scrollTop;
    var scrollHeight = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
    var pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressEl.style.width = pct + '%';
  }

  /* ---------- Back to top ---------- */
  var backToTop = document.getElementById('backToTop');
  function updateBackToTop() {
    if (!backToTop) return;
    if (window.scrollY > 480) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  window.addEventListener('scroll', function () {
    updateProgress();
    updateBackToTop();
  }, { passive: true });
  updateProgress();
  updateBackToTop();

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add('in-view'); });
    }, 3000);
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  var chainSteps = document.querySelectorAll('.chain-step');
  if ('IntersectionObserver' in window && chainSteps.length) {
    var ioChain = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          ioChain.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    chainSteps.forEach(function (el) { ioChain.observe(el); });
  } else {
    chainSteps.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Scrollspy: highlight active nav link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[data-nav]'));
  var sections = navLinks
    .map(function (a) {
      var id = a.getAttribute('href');
      if (!id || id.charAt(0) !== '#') return null;
      var el = document.querySelector(id);
      return el ? { link: a, el: el } : null;
    })
    .filter(Boolean);

  function updateActiveNav() {
    if (!sections.length) return;
    var scrollPos = window.scrollY + window.innerHeight * 0.28;
    var current = sections[0];
    sections.forEach(function (s) {
      if (s.el.offsetTop <= scrollPos) current = s;
    });
    navLinks.forEach(function (a) { a.classList.remove('active'); });
    current.link.classList.add('active');
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  /* ---------- Language toggle (DE / EN) ---------- */
  var langBtn = document.getElementById('lang-toggle');
  var isEnglish = false;
  var i18nEls = document.querySelectorAll('[data-de][data-en]');

  function applyLanguage(lang) {
    document.documentElement.setAttribute('lang', lang);
    i18nEls.forEach(function (el) {
      var val = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-de');
      if (val !== null) el.innerHTML = val;
    });
    if (langBtn) langBtn.textContent = lang === 'en' ? 'DE' : 'EN';
  }

  if (langBtn) {
    langBtn.addEventListener('click', function () {
      isEnglish = !isEnglish;
      applyLanguage(isEnglish ? 'en' : 'de');
    });
  }

  /* ---------- Custom cursor (desktop only) ---------- */
  var cursor = document.getElementById('customCursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    var cx = 0, cy = 0, shown = false;
    window.addEventListener('mousemove', function (e) {
      cx = e.clientX; cy = e.clientY;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      if (!shown) { cursor.classList.add('visible'); shown = true; }
    }, { passive: true });

    var hoverTargets = 'a, button, .phone-card, .fid-shot, [role="button"]';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(hoverTargets)) {
        cursor.classList.add('hovering');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(hoverTargets)) {
        cursor.classList.remove('hovering');
      }
    });
  } else if (cursor) {
    cursor.style.display = 'none';
  }
})();
