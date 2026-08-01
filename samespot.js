// ===========================================================
// sameSpot — case study interactions
// ===========================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Accordion (Prozess komplett) ---------- */
  document.querySelectorAll('[data-accordion]').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      item.classList.toggle('open');
    });
  });

  /* ---------- Scrollspy for sidebar nav ---------- */
  const navLinks = Array.from(document.querySelectorAll('.nav a[data-nav]'));
  const chapterEls = Array.from(document.querySelectorAll('.nav .chapter'));

  // map: id -> nav link element
  const linkById = {};
  navLinks.forEach(link => {
    const id = link.getAttribute('href').slice(1);
    linkById[id] = link;
  });

  // targets we watch: every id referenced by a nav link + chapter section ids
  const chapterTargets = {
    widerspruch: chapterEls.find(c => c.dataset.chapterFor === 'widerspruch'),
    mechanik: chapterEls.find(c => c.dataset.chapterFor === 'mechanik'),
    rueckschlag: chapterEls.find(c => c.dataset.chapterFor === 'rueckschlag'),
    loesung: chapterEls.find(c => c.dataset.chapterFor === 'loesung'),
  };

  const watchIds = Object.keys(linkById).concat(Object.keys(chapterTargets));
  const observedEls = watchIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  function clearActive() {
    navLinks.forEach(l => l.classList.remove('active'));
    chapterEls.forEach(c => c.classList.remove('active'));
  }

  function setActive(id) {
    clearActive();
    if (linkById[id]) linkById[id].classList.add('active');
    if (chapterTargets[id]) chapterTargets[id].classList.add('active');
  }

  let currentId = null;

  const observer = new IntersectionObserver((entries) => {
    // pick the entry closest to top that is intersecting
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

    if (visible.length > 0) {
      const id = visible[0].target.id;
      if (id !== currentId) {
        currentId = id;
        setActive(id);
      }
    }
  }, {
    rootMargin: '-15% 0px -70% 0px',
    threshold: 0
  });

  observedEls.forEach(el => observer.observe(el));

  // set initial state
  if (observedEls[0]) setActive(observedEls[0].id);
});
