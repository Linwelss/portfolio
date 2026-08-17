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

  function handleToggle(btn) {
    current = current === 'de' ? 'en' : 'de';
    var count = apply(current);
    btn.textContent = current === 'de' ? 'EN' : 'DE';
    document.documentElement.setAttribute('lang', current);
    if (count === 0) {
      current = current === 'de' ? 'en' : 'de';
    }
  }

  document.addEventListener('click', function (e) {
    var path = e.composedPath ? e.composedPath() : [e.target];
    var btn = null;
    for (var i = 0; i < path.length; i++) {
      if (path[i] && path[i].id === 'lang-toggle') { btn = path[i]; break; }
    }
    if (!btn) return;
    handleToggle(btn);
  });
})();
