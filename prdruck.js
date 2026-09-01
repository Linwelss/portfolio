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

  // ---------- Sidebar scrollspy ----------
  const navLinks = Array.from(document.querySelectorAll('.nav a[data-nav]'));
  const chapterEls = Array.from(document.querySelectorAll('.nav .chapter'));
  const linkById = {};
  navLinks.forEach(link => { linkById[link.getAttribute('href').slice(1)] = link; });
  const chapterTargets = {};
  chapterEls.forEach(c => { chapterTargets[c.dataset.chapterFor] = c; });

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

  const ACTIVATION_LINE = 140;
  let currentId = null, ticking = false;

  function updateActiveSection() {
    ticking = false;
    const atBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 4);
    if (atBottom && observedEls.length) {
      const lastId = observedEls[observedEls.length - 1].id;
      if (lastId !== currentId) { currentId = lastId; setActive(lastId); }
      return;
    }
    let candidate = observedEls[0] ? observedEls[0].id : null;
    for (const { id, el } of observedEls) {
      const top = el.getBoundingClientRect().top;
      if (top <= ACTIVATION_LINE) candidate = id; else break;
    }
    if (candidate && candidate !== currentId) { currentId = candidate; setActive(candidate); }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(updateActiveSection); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateActiveSection();

  // ---------- Scroll-reveal for sections ----------
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); revealObserver.unobserve(entry.target); }
    });
  }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  // ---------- Chain-step reveal (01 Ausgangslage) ----------
  const chainSteps = document.querySelectorAll('.chain-step');
  if (chainSteps.length) {
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .2 });
    chainSteps.forEach((el, i) => { el.style.transitionDelay = (i * .06) + 's'; io.observe(el); });
  }

  // ---------- Custom cursor ----------
  const cursor = document.getElementById('customCursor');
  if (cursor && !window.matchMedia('(hover: none), (pointer: coarse)').matches) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      cursor.classList.add('visible');
    });
    document.addEventListener('mouseleave', () => cursor.classList.remove('visible'));
    document.addEventListener('mouseenter', () => cursor.classList.add('visible'));
    const hoverTargets = 'a, button, .fid-shot img, .proof-shot img, .concept-card, .ia-card, .quote-card, .safety-item, .b-shot-wrap img';
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
  }

  // ---------- Back to top ----------
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    function toggleBackToTop() { backToTop.classList.toggle('visible', window.scrollY > 700); }
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ---------- Lightbox for fidelity + proof screenshots ----------
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  function openLightbox(src, alt) {
    if (!lightbox || !src) return;
    lightboxImg.src = src; lightboxImg.alt = alt || '';
    lightbox.classList.add('open'); document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open'); document.body.style.overflow = '';
  }
  document.querySelectorAll('.fid-shot img, .proof-shot img').forEach(img => {
    img.addEventListener('click', () => {
      if (img.closest('.proof-shot, .fid-step')?.classList.contains('is-empty')) return;
      openLightbox(img.src, img.alt);
    });
  });
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  // ---------- DE/EN toggle ----------
  let current = 'de';
  function applyLang(lang) {
    const found = document.querySelectorAll('[data-' + lang + ']');
    found.forEach(el => { el.innerHTML = el.getAttribute('data-' + lang); });
    return found.length;
  }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#lang-toggle');
    if (!btn) return;
    const next = current === 'de' ? 'en' : 'de';
    const count = applyLang(next);
    if (count > 0) { current = next; btn.textContent = current === 'de' ? 'EN' : 'DE'; document.documentElement.setAttribute('lang', current); }
  });

  // ---------- Dark-behind body toggle (for topbar contrast, if a dark chapter sits at top) ----------
  const pill = document.querySelector('.topbar-inner');
  function updateTopbarContrast() {
    // No scroll-linked dark hero on this page, so topbar stays in its light state.
  }
  updateTopbarContrast();
});

// ---------- Sidebar erscheint erst nach dem Hero ----------
(function(){
  var hero = document.getElementById('ueberblick');
  if(!hero) return;
  function update(){
    var rect = hero.getBoundingClientRect();
    var pastHero = rect.bottom < window.innerHeight * 0.5;
    document.body.classList.toggle('side-on', pastHero);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// ---------- Alt/Neu Vergleich: synchrones Scrollen ----------
(function(){
  var viewports = document.querySelectorAll('.compare-viewport');
  if (viewports.length < 2) return;
  var syncing = false;
  viewports.forEach(function(vp){
    vp.addEventListener('scroll', function(){
      if (syncing) return;
      syncing = true;
      var range = vp.scrollHeight - vp.clientHeight;
      var pct = range > 0 ? vp.scrollTop / range : 0;
      viewports.forEach(function(other){
        if (other === vp) return;
        var otherRange = other.scrollHeight - other.clientHeight;
        other.scrollTop = pct * otherRange;
      });
      syncing = false;
    }, { passive: true });
  });
})();
