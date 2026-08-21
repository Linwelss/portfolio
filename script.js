(function () {
  var cursor = document.getElementById('customCursor');
  if (!cursor || window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  document.addEventListener('mousemove', function (e) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    cursor.classList.add('visible');
  });
  document.addEventListener('mouseleave', function () { cursor.classList.remove('visible'); });
  document.addEventListener('mouseenter', function () { cursor.classList.add('visible'); });

  var hoverTargets = 'a, button, .blog-card';
  document.querySelectorAll(hoverTargets).forEach(function (el) {
    el.addEventListener('mouseenter', function () { cursor.classList.add('hovering'); });
    el.addEventListener('mouseleave', function () { cursor.classList.remove('hovering'); });
  });
  document.addEventListener('mousedown', function () { cursor.classList.add('clicking'); });
  document.addEventListener('mouseup', function () { cursor.classList.remove('clicking'); });
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
