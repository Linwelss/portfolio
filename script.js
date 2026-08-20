function copyMailAddress() {
  var EMAIL = 'Lina-Melissa@web.de';
  var btn = document.getElementById('mailBtn');
  var text = document.getElementById('mailBtnText');
  var icon = document.getElementById('mailBtnIcon');
  var note = document.getElementById('mailBtnNote');
  if (!btn || !text || !icon || !note) return;

  function afterCopy() {
    btn.style.background = '#0A0A0A';
    text.textContent = 'Kopiert!';
    icon.innerHTML = '<path d="M20 6 9 17l-5-5"></path>';
    note.style.opacity = '1';
    note.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(btn._mailResetTimer);
    btn._mailResetTimer = setTimeout(function () {
      btn.style.background = '#1F7A45';
      text.textContent = 'Mail me';
      icon.innerHTML = '<rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>';
      note.style.opacity = '0';
      note.style.transform = 'translateX(-50%) translateY(-4px)';
    }, 2400);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(EMAIL).then(afterCopy).catch(afterCopy);
  } else {
    var ta = document.createElement('textarea');
    ta.value = EMAIL;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    afterCopy();
  }
}

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('load', function () {
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }
});

(function () {
  var videos = Array.prototype.slice.call(document.querySelectorAll('video'));
  if (!videos.length) return;

  videos.forEach(function (v) {
    v.loop = true;
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.play().catch(function () {});
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          if (v.paused) v.play().catch(function () {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.1 });
    videos.forEach(function (v) { io.observe(v); });
  }

  function resumeVideos() {
    if (document.visibilityState !== 'visible') return;
    videos.forEach(function (v) {
      var r = v.getBoundingClientRect();
      var visible = r.bottom > 0 && r.top < window.innerHeight;
      if (visible && v.paused) v.play().catch(function () {});
    });
  }
  document.addEventListener('visibilitychange', resumeVideos);
  window.addEventListener('pageshow', resumeVideos);
  window.addEventListener('focus', resumeVideos);
})();

(function () {
  var current = 'de';
  function getRoot() {
    var xdc = document.querySelector('x-dc');
    if (xdc && xdc.shadowRoot) return xdc.shadowRoot;
    return document;
  }
  function apply(lang) {
    var root = getRoot();
    var found = root.querySelectorAll('[data-' + lang + ']');
    found.forEach(function (el) {
      el.innerHTML = el.getAttribute('data-' + lang);
    });
    return found.length;
  }
  function toggle(btn) {
    var next = current === 'de' ? 'en' : 'de';
    var count = apply(next);
    if (count > 0) {
      current = next;
      btn.textContent = current === 'de' ? 'EN' : 'DE';
      document.documentElement.setAttribute('lang', current);
    }
  }
  function handler(e) {
    var btn = null;
    if (e.composedPath) {
      var path = e.composedPath();
      for (var i = 0; i < path.length; i++) {
        if (path[i] && path[i].id === 'lang-toggle') { btn = path[i]; break; }
      }
    }
    if (!btn && e.target && e.target.id === 'lang-toggle') btn = e.target;
    if (!btn) return;
    toggle(btn);
  }
  document.addEventListener('click', handler, true);
  window.addEventListener('click', handler, true);
})();
