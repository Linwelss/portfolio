// script2.js — everything for this page: nav scroll-state toggle + hero.
// Kept as a single file on purpose.

// --- Navigation: toggles between its two Figma states -----------------
// - default ("1136"): flat bar at the very top of the page
// - .is-scrolled ("1137"): floating glass pill once the page has scrolled
(function () {
  var nav = document.querySelector('.site-nav');
  if (!nav) return;

  var THRESHOLD = 24; // px scrolled before switching states

  function updateNavState() {
    var scrolled = window.scrollY > THRESHOLD;
    nav.classList.toggle('is-scrolled', scrolled);
  }

  updateNavState();
  window.addEventListener('scroll', updateNavState, { passive: true });
})();

// --- Cookie consent: Google Analytics only loads after explicit opt-in.
// Toggle + Speichern instead of two competing buttons — status is
// persistent (visible on the icon) and can be revisited/changed anytime.
(function () {
  var STORAGE_KEY = 'cookie-consent'; // 'accepted' | 'declined'
  var GA_ID = 'G-L7R7JNY2FM';

  var banner = document.getElementById('cookie-banner');
  var main = document.getElementById('cookie-banner-main');
  var confirmBox = document.getElementById('cookie-banner-confirm');
  var confirmText = document.getElementById('cookie-confirm-text');
  var toggleInput = document.getElementById('cookie-toggle-input');
  var saveBtn = document.getElementById('cookie-save');
  var iconStatus = document.getElementById('cookie-icon-status');
  var settingsBtn = document.getElementById('cookie-icon');

  var CONFIRM_MESSAGES = {
    accepted: {
      de: 'Gespeichert. Du kannst das jederzeit über das Cookie-Icon ändern.',
      en: 'Saved. You can change this anytime via the cookie icon.'
    },
    declined: {
      de: 'Alles klar, bleibt aus. Änderbar jederzeit über das Cookie-Icon.',
      en: 'Got it, staying off. Changeable anytime via the cookie icon.'
    }
  };

  function loadGoogleAnalytics() {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  }

  function setIconStatus(state) {
    if (!iconStatus) return;
    iconStatus.classList.remove('status-accepted', 'status-declined');
    if (state === 'accepted') iconStatus.classList.add('status-accepted');
    if (state === 'declined') iconStatus.classList.add('status-declined');
    // 'neutral' -> no extra class, base amber color from CSS
  }

  function resetToMainView() {
    if (confirmBox) confirmBox.classList.remove('visible');
    if (main) main.classList.remove('is-hidden');
  }

  function showBanner() {
    if (!banner) return;
    resetToMainView();
    var stored = localStorage.getItem(STORAGE_KEY);
    if (toggleInput) toggleInput.checked = stored === 'accepted';
    banner.classList.add('visible');
  }

  function hideBanner() {
    if (banner) banner.classList.remove('visible');
  }

  function currentLangCode() {
    // Mirrors the "currentLang" variable set up by the language switcher
    // further down in this file (used for the confirmation message).
    return typeof currentLang !== 'undefined' ? currentLang : 'de';
  }

  function handleSave() {
    var accepted = !!(toggleInput && toggleInput.checked);
    var state = accepted ? 'accepted' : 'declined';

    localStorage.setItem(STORAGE_KEY, state);
    if (accepted) loadGoogleAnalytics();
    setIconStatus(state);

    // Swap to confirmation view
    if (confirmText) {
      var lang = currentLangCode();
      confirmText.textContent = CONFIRM_MESSAGES[state][lang] || CONFIRM_MESSAGES[state].de;
    }
    if (main) main.classList.add('is-hidden');
    if (confirmBox) confirmBox.classList.add('visible');

    // Auto-close after a moment, then reset the view for next time
    setTimeout(function () {
      hideBanner();
      setTimeout(resetToMainView, 300);
    }, 1800);
  }

  // Initial state on page load
  var stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'accepted') {
    loadGoogleAnalytics();
    setIconStatus('accepted');
  } else if (stored === 'declined') {
    setIconStatus('declined');
  } else {
    setIconStatus('neutral');
    showBanner();
  }

  if (saveBtn) saveBtn.addEventListener('click', handleSave);
  if (settingsBtn) settingsBtn.addEventListener('click', showBanner);
})();

// --- Mobile nav: hamburger opens/closes the full-screen drawer,
// closes on link click or Escape, locks page scroll while open.
(function () {
  var burger = document.getElementById('nav-burger');
  var drawer = document.getElementById('mobile-nav');
  var closeBtn = document.getElementById('mobile-nav-close');
  if (!burger || !drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', function () {
    if (drawer.classList.contains('open')) closeDrawer();
    else openDrawer();
  });
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  drawer.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });
})();

// --- Scrollspy: highlights whichever section is currently in view,
// so the nav always shows "you are here". Scroll-position-based (not
// IntersectionObserver) so it works reliably in both scroll directions
// without gaps, same approach used elsewhere on this site.
(function () {
  var navLinks = document.querySelectorAll('.nav-link');
  if (!navLinks.length) return;

  var sections = [];
  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && href.charAt(0) === '#' && href.length > 1) {
      var el = document.querySelector(href);
      if (el) sections.push({ id: href.slice(1), el: el, link: link });
    }
  });
  if (!sections.length) return;

  var REF_OFFSET = 140; // px below the top of the viewport used as the "which section am I in" line

  function updateActiveNav() {
    var refLine = window.scrollY + REF_OFFSET;
    var current = null;
    sections.forEach(function (s) {
      if (s.el.offsetTop <= refLine) current = s;
    });
    sections.forEach(function (s) {
      s.link.classList.toggle('is-active', s === current);
    });
  }

  updateActiveNav();
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  window.addEventListener('resize', updateActiveNav);
  window.addEventListener('load', updateActiveNav);
})();

// --- Clicking the name (nav logo) always takes you to the very top of
// the page, smoothly, instead of reloading — even if you're already home.
(function () {
  var navLogo = document.getElementById('nav-logo');
  if (!navLogo) return;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  navLogo.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
})();

// --- Hero -----------------------------------------------------------------
// The hero itself is intentionally free of JS dependencies:
// - "CV herunterladen" is a real download link (a[download])
// - "Über mich" and the scroll indicator are real anchor links
// - scroll-behavior: smooth in styles2.css handles smooth scrolling with no JS
//
// This space is ready for future interactions (e.g. highlighting the active
// nav item while scrolling) once more page sections are added.

// --- Entrance animation: measure exactly where the nav logo sits, so the
// traveling name-pill can dock pixel-perfectly into that spot regardless
// of viewport width. Sets --pill-dock-x / --pill-dock-y, read by the
// pill-journey keyframes in styles2.css.
(function () {
  var navLogo = document.getElementById('nav-logo');
  if (!navLogo) return;

  function setDockPosition() {
    var rect = navLogo.getBoundingClientRect();
    document.documentElement.style.setProperty('--pill-dock-x', rect.left + 'px');
    document.documentElement.style.setProperty('--pill-dock-y', (rect.top + rect.height / 2) + 'px');
  }

  setDockPosition();
  window.addEventListener('resize', setDockPosition);

  // Web fonts (Inter) often finish loading a beat after this script runs.
  // If the nav logo's font swaps in afterward, its measured position can
  // shift slightly — re-measure once fonts are actually ready so the pill
  // docks against the FINAL rendered position, not a fallback-font guess.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setDockPosition);
  }
  window.addEventListener('load', setDockPosition);
})();

// --- Entrance animation: click ripple + comet trail ------------------------
// Timed to match the pill-journey keyframes in styles2.css (2s total):
// click happens at 44% (~0.88s), travel runs from 54% to 88% (~1.08s-1.76s).
(function () {
  var pill = document.getElementById('name-pill');
  if (!pill) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  var DURATION = 2600;
  var CLICK_AT = DURATION * 0.44;
  var TRAVEL_START = DURATION * 0.54;
  var TRAVEL_END = DURATION * 0.80;

  function spawnRipple(x, y) {
    var ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.width = '90px';
    ripple.style.height = '90px';
    document.body.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 750);
  }

  function spawnTrailDot(x, y) {
    var dot = document.createElement('div');
    dot.className = 'trail-dot';
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
    document.body.appendChild(dot);
    setTimeout(function () { dot.remove(); }, 650);
  }

  // Ripple, once, right at the click moment
  setTimeout(function () {
    var rect = pill.getBoundingClientRect();
    spawnRipple(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }, CLICK_AT);

  // Trail dots sampled at intervals while the pill travels (not before)
  var travelInterval;
  setTimeout(function () {
    travelInterval = setInterval(function () {
      var rect = pill.getBoundingClientRect();
      spawnTrailDot(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }, 70);
  }, TRAVEL_START);

  setTimeout(function () {
    if (travelInterval) clearInterval(travelInterval);
  }, TRAVEL_END);
})();

// --- Custom cursor: dark green dot that grows into a ring over clickable
// elements. Desktop/mouse only (guarded by CSS pointer:fine already
// hiding the native cursor; here we just skip the JS work on touch too). -
(function () {
  var cursor = document.getElementById('live-cursor');
  if (!cursor) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  window.addEventListener('mousemove', function (e) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  }, { passive: true });

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest('a, button')) {
      cursor.classList.add('is-hovering');
    }
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest('a, button')) {
      cursor.classList.remove('is-hovering');
    }
  });
})();

// --- Stats count-up: numbers animate from 0 to their target value once
// they're revealed, timed to match the .stat entrance delays in styles2.css.
(function () {
  var nums = document.querySelectorAll('.stat-num[data-count]');
  if (!nums.length) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (prefersReducedMotion || isNaN(target)) {
      el.textContent = target;
      return;
    }
    var duration = 900;
    var start = null;
    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(step);
  }

  // Matches the .stat:nth-child delays already set in styles2.css
  var delays = [3180, 3270, 3360];
  nums.forEach(function (el, i) {
    setTimeout(function () { animateCount(el); }, prefersReducedMotion ? 0 : (delays[i] || 2570));
  });
})();

// --- Below-the-fold behaviors, ported 1:1 from the main index.html --------

// Icons (inline SVG, injected via data-icon attributes used throughout
// the ported sections: expertise cards, timeline tags, footer socials...)
const ICONS = {
  'star':'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  'layout-grid':'<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  'zap':'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  'sparkles':'<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"/>',
  'search':'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  'pen-tool':'<path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z"/><path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18"/><path d="m2.3 2.3 7.286 7.286"/><circle cx="11" cy="11" r="2"/>',
  'printer':'<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect width="12" height="8" x="6" y="14" rx="1"/>',
  'layers':'<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  'user':'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  'briefcase':'<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  'graduation-cap':'<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  'award':'<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
  'book-open':'<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  'map-pin':'<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  'calendar':'<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  'pen-line':'<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>',
  'folder-open':'<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
  'footprints':'<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4"/><path d="M4 13h4"/>',
  'download':'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  'mail':'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  'external-link':'<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  'linkedin':'<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
  'instagram':'<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
  'dribbble':'<circle cx="12" cy="12" r="10"/><path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94"/><path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32"/><path d="M8.56 2.75c4.37 6 6 9.42 8 17.72"/>',
  'behance':'<path d="M7.5 7H3v10h4.5a3 3 0 0 0 0-6 2.5 2.5 0 0 0 0-4z"/><path d="M3 12h5"/><path d="M14 13a3 3 1 0 0 6 0 3 3 0 0 0-6 0z"/><path d="M15 7h4"/>'
};

function svgIcon(name, cls){
  const path = ICONS[name] || ICONS['star'];
  return '<svg class="lucide '+(cls||'')+'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'+path+'</svg>';
}

function renderIcons(){
  document.querySelectorAll('[data-icon]').forEach(el => {
    if(el.querySelector('svg')) return;
    el.innerHTML = svgIcon(el.dataset.icon);
  });
}
renderIcons();

// Skills marquee banner (between hero and Projekte)
const skillsData = [
  {icon:'smartphone', de:'zu viele TikToks', en:'too many TikToks'},
  {icon:'package', de:'zu viele Umzüge', en:'too many moves'},
  {icon:'layout-grid', de:'zu viele Tabs offen', en:'too many tabs open'},
  {icon:'folder-open', de:'zu viele Screenshots', en:'too many screenshots'},
  {icon:'sparkles', de:'zu viele Ideen', en:'too many ideas'},
  {icon:'star', de:'zu viele Favoriten gespeichert', en:'too many favourites saved'},
  {icon:'map-pin', de:'zu viele Städte auf der Liste', en:'too many cities on the list'},
  {icon:'footprints', de:'zu viele Routen zu Fuß gegangen', en:'too many routes walked'}
];
ICONS['smartphone'] = '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>';
ICONS['package'] = '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>';

let currentLang = 'de';
function buildBanner(lang){
  const marquee = document.getElementById('skills-marquee');
  if(!marquee) return;
  let group = '';
  skillsData.forEach(s => {
    group += '<span class="skill-item">'+svgIcon(s.icon)+(lang==='de'?s.de:s.en)+'</span>';
  });
  marquee.innerHTML = '<div class="skills-group">'+group+'</div><div class="skills-group">'+group+'</div><div class="skills-group">'+group+'</div><div class="skills-group">'+group+'</div>';
}
buildBanner('de');

// Language toggle — flips every data-de/data-en pair in the ported
// sections. The hero itself stays as-is (no data-de/data-en there),
// exactly as requested.
function toggleLang(){
  currentLang = currentLang === 'de' ? 'en' : 'de';
  const lbl = currentLang === 'de' ? 'EN' : 'DE';
  const lb = document.getElementById('lang-btn'); if(lb) lb.textContent = lbl;
  document.querySelectorAll('[data-de]').forEach(el => {
    const text = currentLang === 'de' ? el.dataset.de : el.dataset.en;
    if(text){ if(text.indexOf('<') !== -1){ el.innerHTML = text; } else { el.textContent = text; } }
  });
  buildBanner(currentLang);
  document.body.style.transition = 'opacity .2s';
  document.body.style.opacity = '.85';
  setTimeout(() => { document.body.style.opacity = '1'; }, 200);
}

// Ripple — only on the Kontakt buttons (hero buttons already have their
// own shine-sweep effect, wired above)
document.querySelectorAll('.contact-btn-primary,.contact-btn-outline').forEach(btn => {
  btn.addEventListener('click', function(e){
    const r = document.createElement('span');
    r.classList.add('ripple');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = size+'px';
    r.style.left = (e.clientX-rect.left-size/2)+'px';
    r.style.top = (e.clientY-rect.top-size/2)+'px';
    this.appendChild(r);
    setTimeout(() => r.remove(), 600);
  });
});

// Scroll reveal for everything below the hero (class "reveal" -> "visible",
// matching the ported CSS exactly)
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(en => { if(en.isIntersecting) en.target.classList.add('visible'); });
}, { threshold:0.08, rootMargin:'0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// Copy email on click (Kontakt section)
function copyEmail(e) {
  e.preventDefault();
  const email = 'lina-melissa@web.de';
  navigator.clipboard.writeText(email).then(() => {
    const btn = document.getElementById('mail-btn');
    const hint = document.getElementById('contact-email-hint');
    if (!btn || !hint) return;
    const original = btn.innerHTML;
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px"><polyline points="20 6 9 17 4 12"/></svg>Kopiert!';
    hint.classList.add('visible');
    setTimeout(() => {
      btn.innerHTML = original;
      hint.classList.remove('visible');
      renderIcons();
    }, 2000);
  });
}

// Smooth scroll for anchor links into the ported sections, offset for
// the fixed nav (the new nav is position:fixed same as the original)
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e){
    const id = this.getAttribute('href');
    if(id === '#' || id.length < 2) return;
    const target = document.querySelector(id);
    if(!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top:y, behavior:'smooth' });
  });
});

// Lightbox
let lbCarouselCurrent = 0;
let lbCarouselSlides = [];

function openLightbox(type, src, slides) {
  const overlay = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const video = document.getElementById('lightbox-video');
  const carousel = document.getElementById('lightbox-carousel');
  const scrollWrap = document.getElementById('lightbox-scroll');
  const scrollImg = document.getElementById('lightbox-scroll-img');
  const track = document.getElementById('lightbox-carousel-track');
  const dots = document.getElementById('lightbox-carousel-dots');
  if (!overlay) return;

  img.style.display = 'none';
  video.style.display = 'none';
  carousel.style.display = 'none';
  scrollWrap.style.display = 'none';

  if (type === 'image') {
    img.src = src;
    img.style.display = 'block';
  } else if (type === 'video') {
    video.src = src;
    video.style.display = 'block';
    video.play();
  } else if (type === 'scroll') {
    scrollImg.src = src;
    scrollWrap.scrollTop = 0;
    scrollWrap.style.display = 'block';
  } else if (type === 'carousel') {
    lbCarouselSlides = slides;
    lbCarouselCurrent = 0;
    track.innerHTML = slides.map(s => `<img src="${s}" alt="">`).join('');
    dots.innerHTML = slides.map((_, i) => `<span class="${i===0?'active':''}" onclick="lightboxCarouselGoTo(${i})"></span>`).join('');
    carousel.style.display = 'block';
    track.style.transform = 'translateX(0)';
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox(e) {
  const overlay = document.getElementById('lightbox');
  if (!overlay) return;
  if (e && e.target !== overlay && !e.target.closest('.lightbox-close')) return;
  const video = document.getElementById('lightbox-video');
  overlay.classList.remove('open');
  video.pause();
  video.src = '';
  document.body.style.overflow = '';
}

function lightboxCarouselGoTo(i) {
  lbCarouselCurrent = (i + lbCarouselSlides.length) % lbCarouselSlides.length;
  document.getElementById('lightbox-carousel-track').style.transform = `translateX(-${lbCarouselCurrent * 100}%)`;
  document.querySelectorAll('#lightbox-carousel-dots span').forEach((d, idx) => d.classList.toggle('active', idx === lbCarouselCurrent));
}

function lightboxCarouselGo(dir) {
  lightboxCarouselGoTo(lbCarouselCurrent + dir);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const overlay = document.getElementById('lightbox');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (e.key === 'ArrowRight') lightboxCarouselGo(1);
  if (e.key === 'ArrowLeft') lightboxCarouselGo(-1);
});

// Wire up masonry cards
document.querySelectorAll('.masonry-card').forEach(card => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', (e) => {
    if (card.classList.contains('masonry-card-external')) {
      const href = card.dataset.href;
      if (href && !e.target.closest('.masonry-ext-link')) {
        window.open(href, '_blank', 'noopener');
      }
      return;
    }
    if (card.classList.contains('card-scroll')) {
      const si = card.querySelector('.scroll-img');
      if (si) { openLightbox('scroll', si.src); return; }
    }
    const vid = card.querySelector('.masonry-video');
    if (vid) { openLightbox('video', vid.src); return; }
    const mi = card.querySelector('.masonry-img');
    if (mi) { openLightbox('image', mi.src); return; }
  });
});

// Mobile: autoplay videos via IntersectionObserver
if (window.innerWidth <= 900) {
  const videos = document.querySelectorAll('.masonry-video');
  const videoObs = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) en.target.play(); else en.target.pause(); });
  }, { threshold: 0.3 });
  videos.forEach(v => { v.muted = true; v.loop = true; v.playsInline = true; videoObs.observe(v); });
}
