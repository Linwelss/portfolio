document.addEventListener('DOMContentLoaded', () => {

  // ---------- Scroll progress bar ----------
  const progressBar = document.getElementById('scrollProgress');
  function updateProgress() {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  // ---------- Accordion (Prozess komplett) ----------
  document.querySelectorAll('[data-accordion]').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      item.classList.toggle('open');
    });
  });

  // ---------- Build the "1 von 52" dot grid ----------
  const grid = document.getElementById('dotGrid');
  if (grid) {
    const total = 52;
    const perRow = 13;
    const highlightIndex = 25; // the single highlighted dot ("1 von 52")
    for (let r = 0; r < Math.ceil(total / perRow); r++) {
      const row = document.createElement('div');
      row.className = 'dot-row';
      for (let c = 0; c < perRow; c++) {
        const i = r * perRow + c;
        if (i >= total) break;
        const dot = document.createElement('span');
        if (i === highlightIndex) dot.classList.add('highlight');
        row.appendChild(dot);
      }
      grid.appendChild(row);
    }
  }

  // ---------- Sidebar scrollspy ----------
  const navLinks = Array.from(document.querySelectorAll('.nav a[data-nav]'));
  const chapterEls = Array.from(document.querySelectorAll('.nav .chapter'));
  const linkById = {};
  navLinks.forEach(link => {
    const id = link.getAttribute('href').slice(1);
    linkById[id] = link;
  });
  const chapterTargets = {
    widerspruch: chapterEls.find(c => c.dataset.chapterFor === 'widerspruch'),
    mechanik: chapterEls.find(c => c.dataset.chapterFor === 'mechanik'),
    rueckschlag: chapterEls.find(c => c.dataset.chapterFor === 'rueckschlag'),
    loesung: chapterEls.find(c => c.dataset.chapterFor === 'loesung'),
  };
  const watchIds = Object.keys(linkById).concat(Object.keys(chapterTargets));
  const observedEls = watchIds
    .map(id => ({ id, el: document.getElementById(id) }))
    .filter(o => o.el)
    .sort((a, b) => a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top);

  function clearActive() {
    navLinks.forEach(l => l.classList.remove('active'));
    chapterEls.forEach(c => c.classList.remove('active'));
  }
  function setActive(id) {
    clearActive();
    if (linkById[id]) linkById[id].classList.add('active');
    if (chapterTargets[id]) chapterTargets[id].classList.add('active');
  }

  const ACTIVATION_LINE = 140; // px from top of viewport that counts as "current section"
  let currentId = null;
  let ticking = false;

  function updateActiveSection() {
    ticking = false;

    // Near the very bottom of the page: always activate the last section.
    const atBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 4);
    if (atBottom && observedEls.length) {
      const lastId = observedEls[observedEls.length - 1].id;
      if (lastId !== currentId) { currentId = lastId; setActive(lastId); }
      return;
    }

    // Otherwise: the active section is the last one whose top has crossed the activation line.
    let candidate = observedEls[0] ? observedEls[0].id : null;
    for (const { id, el } of observedEls) {
      const top = el.getBoundingClientRect().top;
      if (top <= ACTIVATION_LINE) {
        candidate = id;
      } else {
        break; // sections are in document order, so we can stop early
      }
    }
    if (candidate && candidate !== currentId) {
      currentId = candidate;
      setActive(candidate);
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateActiveSection);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateActiveSection();

  // ---------- Scroll-reveal for sections ----------
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  // ---------- Animate progress bars into view ----------
  const barFills = Array.from(document.querySelectorAll('.bar-fill[data-w]'));
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // slight delay so it fills just after the card fades in
        setTimeout(() => { el.style.width = el.dataset.w; }, 200);
        barObserver.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  barFills.forEach(el => barObserver.observe(el));

  // ================= 1. Custom cursor (dot -> ring on hover) =================
  const cursor = document.getElementById('customCursor');
  if (cursor && !window.matchMedia('(hover: none), (pointer: coarse)').matches) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      cursor.classList.add('visible');
    });
    document.addEventListener('mouseleave', () => cursor.classList.remove('visible'));
    document.addEventListener('mouseenter', () => cursor.classList.add('visible'));

    const hoverTargets = 'a, button, .phone-card, .concept-card, .ia-card, .uebersicht-card, .persona-card, .quote-card, .safety-item, .color-list-row, .accordion-trigger, .swatch-compact, .feat-dark';
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
    document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
    document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));
  }

  // ================= 3. Back to top =================
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    function toggleBackToTop() {
      backToTop.classList.toggle('visible', window.scrollY > 700);
    }
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ================= 4. Lightbox for phone screens =================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  function openLightbox(src, alt) {
    if (!lightbox || !src) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  document.querySelectorAll('.phone-card').forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('.phone-frame img');
      if (img) openLightbox(img.src, img.alt);
    });
  });
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  // ================= 5. Gentle parallax on big numbers =================
  const parallaxEls = Array.from(document.querySelectorAll('.pfx-inner'));
  let parallaxTicking = false;
  function updateParallax() {
    parallaxTicking = false;
    const vh = window.innerHeight;
    parallaxEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      const centerOffset = (rect.top + rect.height / 2) - vh / 2;
      let shift = centerOffset * -0.05;
      shift = Math.max(-8, Math.min(8, shift)); // hard clamp: never large enough to overlap neighbouring text
      el.style.transform = `translateY(${shift}px)`;
    });
  }
  window.addEventListener('scroll', () => {
    if (!parallaxTicking) { parallaxTicking = true; requestAnimationFrame(updateParallax); }
  }, { passive: true });
  updateParallax();

  // ================= 6. Typewriter effect for quote cards =================
  const typeTargets = document.querySelectorAll('.quote-card .q');
  const typeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      typeObserver.unobserve(el);
      const fullText = el.textContent;
      el.textContent = '';
      el.style.visibility = 'visible';
      const cursorSpan = document.createElement('span');
      cursorSpan.className = 'typewriter-cursor';
      el.appendChild(document.createTextNode(''));
      el.appendChild(cursorSpan);
      let i = 0;
      const speed = 28;
      function typeNext() {
        if (i <= fullText.length) {
          el.firstChild.textContent = fullText.slice(0, i);
          i++;
          setTimeout(typeNext, speed);
        } else {
          cursorSpan.remove();
        }
      }
      typeNext();
    });
  }, { threshold: 0.5 });
  typeTargets.forEach(el => typeObserver.observe(el));
});
