if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.addEventListener('load', function () {
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }
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
