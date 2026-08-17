if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('load', function () {
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }
});

document.querySelectorAll('video').forEach(function (v) {
  v.loop = true;
  v.muted = true;
  v.addEventListener('ended', function () { v.currentTime = 0; v.play().catch(function () {}); });
  var tryPlay = function () { v.play().catch(function () {}); };
  tryPlay();
  document.addEventListener('click', tryPlay, { once: true });
});

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
