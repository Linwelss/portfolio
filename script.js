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
  var btn = document.getElementById('lang-toggle');
  if (!btn) return;
  var current = 'de';

  function apply(lang) {
    document.querySelectorAll('[data-' + lang + ']').forEach(function (el) {
      el.innerHTML = el.getAttribute('data-' + lang);
    });
  }

  btn.addEventListener('click', function () {
    current = current === 'de' ? 'en' : 'de';
    apply(current);
    btn.textContent = current === 'de' ? 'EN' : 'DE';
    document.documentElement.setAttribute('lang', current);
  });
})();
