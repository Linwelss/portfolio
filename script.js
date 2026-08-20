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
