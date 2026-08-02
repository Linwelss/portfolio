document.addEventListener('DOMContentLoaded', () => {

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
  const observedEls = watchIds.map(id => document.getElementById(id)).filter(Boolean);

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
    const visible = entries.filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible.length > 0) {
      const id = visible[0].target.id;
      if (id !== currentId) { currentId = id; setActive(id); }
    }
  }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });

  observedEls.forEach(el => observer.observe(el));
  if (observedEls[0]) setActive(observedEls[0].id);

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
});
