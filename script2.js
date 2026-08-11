(function(){
  var words = ["Interfaces", "Nutzererlebnisse", "digitale Produkte", "Case Studies"];
  var i = 0;
  var el = document.getElementById('rotating-word');
  if (!el) return;
  setInterval(function(){
    i = (i + 1) % words.length;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.textContent = words[i];
    el.style.animation = 'rotateWordIn .5s cubic-bezier(.22,1,.36,1)';
  }, 2200);
})();
