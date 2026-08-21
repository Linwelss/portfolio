(function () {
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  // CSS direkt injizieren, unabhängig von externer style.css
  var style = document.createElement('style');
  style.textContent =
    'html, body, a, button { cursor: none !important; }' +
    '#customCursor {' +
    '  position: fixed; top: 0; left: 0;' +
    '  width: 14px; height: 14px; margin: -7px 0 0 -7px;' +
    '  border-radius: 50%; background: #0A0A0A; border: 2px solid #0A0A0A;' +
    '  pointer-events: none; z-index: 2147483647;' +
    '  opacity: 0;' +
    '  transition: width .18s ease, height .18s ease, margin .18s ease, background .18s ease, border-color .18s ease, opacity .2s ease;' +
    '  will-change: transform;' +
    '}' +
    '#customCursor.visible { opacity: 1; }' +
    '#customCursor.hovering {' +
    '  width: 40px; height: 40px; margin: -20px 0 0 -20px;' +
    '  background: rgba(10,10,10,.1); border: 2px solid #0A0A0A;' +
    '}';
  document.head.appendChild(style);

  // Cursor-Element holen oder neu erzeugen
  var cursor = document.getElementById('customCursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.id = 'customCursor';
    document.body.appendChild(cursor);
  }
  cursor.className = 'custom-cursor';

  document.addEventListener('mousemove', function (e) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    cursor.classList.add('visible');
  });
  document.addEventListener('mouseleave', function () { cursor.classList.remove('visible'); });
  document.addEventListener('mouseenter', function () { cursor.classList.add('visible'); });
  document.addEventListener('mousedown', function () { cursor.classList.add('clicking'); });
  document.addEventListener('mouseup', function () { cursor.classList.remove('clicking'); });

  var hoverTargets = 'a, button, [style-hover]';
  function bindHover(el) {
    if (el.dataset.cursorBound) return;
    el.dataset.cursorBound = '1';
    el.addEventListener('mouseenter', function () { cursor.classList.add('hovering'); });
    el.addEventListener('mouseleave', function () { cursor.classList.remove('hovering'); });
  }
  document.querySelectorAll(hoverTargets).forEach(bindHover);

  if ('MutationObserver' in window) {
    var mo = new MutationObserver(function () {
      document.querySelectorAll(hoverTargets).forEach(bindHover);
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }
})();
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
