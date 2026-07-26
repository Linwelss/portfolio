/* ===================================================
   sameSpot — Case Study, schlanke Version
   VERSION-MARKER: samespot2-lean-v1
=================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Top-Nav Schatten/Hintergrund bei Scroll */
  const topnav = document.getElementById('topnav');
  function updateNav() {
    if (topnav) topnav.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* Reveal-on-scroll */
  const revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => observer.observe(el));
  }

  /* Core-Flow / Play-Button Platzhalter-Verhalten */
  const playButtons = document.querySelectorAll('.core-flow__play');
  playButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      console.info('Play-Button geklickt, hier später echten Prototyp-/Video-Embed einhängen.');
    });
  });

});
