document.addEventListener('DOMContentLoaded', () => {

  // ---------- Scroll progress bar ----------
  const progressBar = document.getElementById('scrollProgress');
  function updateProgress() {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  // ---------- Accordion (Prozess komplett) ----------
  document.querySelectorAll('[data-accordion]').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      item.classList.toggle('open');
    });
  });

  // ---------- Build the "1 von 52" dot grid ----------
  const grid = document.getElementById('dotGrid');
  if (grid) {
    const total = 52;
    const perRow = 13;
    const highlightIndex = 25; // the single highlighted dot ("1 von 52")
    for (let r = 0; r < Math.ceil(total / perRow); r++) {
      const row = document.createElement('div');
      row.className = 'dot-row';
      for (let c = 0; c < perRow; c++) {
        const i = r * perRow + c;
        if (i >= total) break;
        const dot = document.createElement('span');
        if (i === highlightIndex) dot.classList.add('highlight');
        row.appendChild(dot);
      }
      grid.appendChild(row);
    }
  }

  // ---------- Sidebar scrollspy ----------
  const navLinks = Array.from(document.querySelectorAll('.nav a[data-nav]'));
  const chapterEls = Array.from(document.querySelectorAll('.nav .chapter'));
  const linkById = {};
  navLinks.forEach(link => {
    const id = link.getAttribute('href').slice(1);
    linkById[id] = link;
  });
  const chapterTargets = {
    widerspruch: chapterEls.find(c => c.dataset.chapterFor === 'widerspruch'),
    mechanik: chapterEls.find(c => c.dataset.chapterFor === 'mechanik'),
    rueckschlag: chapterEls.find(c => c.dataset.chapterFor === 'rueckschlag'),
    loesung: chapterEls.find(c => c.dataset.chapterFor === 'loesung'),
  };
  const watchIds = Object.keys(linkById).concat(Object.keys(chapterTargets));
  const observedEls = watchIds
    .map(id => ({ id, el: document.getElementById(id) }))
    .filter(o => o.el)
    .sort((a, b) => a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top);

  function clearActive() {
    navLinks.forEach(l => l.classList.remove('active'));
    chapterEls.forEach(c => c.classList.remove('active'));
  }
  function setActive(id) {
    clearActive();
    if (linkById[id]) linkById[id].classList.add('active');
    if (chapterTargets[id]) chapterTargets[id].classList.add('active');
  }

  const ACTIVATION_LINE = 140; // px from top of viewport that counts as "current section"
  let currentId = null;
  let ticking = false;

  function updateActiveSection() {
    ticking = false;

    // Near the very bottom of the page: always activate the last section.
    const atBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 4);
    if (atBottom && observedEls.length) {
      const lastId = observedEls[observedEls.length - 1].id;
      if (lastId !== currentId) { currentId = lastId; setActive(lastId); }
      return;
    }

    // Otherwise: the active section is the last one whose top has crossed the activation line.
    let candidate = observedEls[0] ? observedEls[0].id : null;
    for (const { id, el } of observedEls) {
      const top = el.getBoundingClientRect().top;
      if (top <= ACTIVATION_LINE) {
        candidate = id;
      } else {
        break; // sections are in document order, so we can stop early
      }
    }
    if (candidate && candidate !== currentId) {
      currentId = candidate;
      setActive(candidate);
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateActiveSection);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateActiveSection();

  // ---------- Scroll-reveal for sections ----------
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  // ---------- Animate progress bars into view ----------
  const barFills = Array.from(document.querySelectorAll('.bar-fill[data-w]'));
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // slight delay so it fills just after the card fades in
        setTimeout(() => { el.style.width = el.dataset.w; }, 200);
        barObserver.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  barFills.forEach(el => barObserver.observe(el));

  // ================= 1. Custom cursor (dot -> ring on hover) =================
  const cursor = document.getElementById('customCursor');
  if (cursor && !window.matchMedia('(hover: none), (pointer: coarse)').matches) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      cursor.classList.add('visible');
    });
    document.addEventListener('mouseleave', () => cursor.classList.remove('visible'));
    document.addEventListener('mouseenter', () => cursor.classList.add('visible'));

    const hoverTargets = 'a, button, .phone-card, .concept-card, .ia-card, .uebersicht-card, .persona-card, .quote-card, .safety-item, .color-list-row, .accordion-trigger, .swatch-compact, .feat-dark, .b-shot-wrap img';
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
    document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
    document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));
  }

  // ================= 3. Back to top =================
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    function toggleBackToTop() {
      backToTop.classList.toggle('visible', window.scrollY > 700);
    }
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ================= 4. Lightbox for phone screens + Bausteine screenshots =================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  function openLightbox(src, alt) {
    if (!lightbox || !src) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  document.querySelectorAll('.phone-card').forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('.phone-frame img');
      if (img) openLightbox(img.src, img.alt);
    });
  });
  document.querySelectorAll('.b-shot-wrap img').forEach(img => {
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  // ================= 5. Gentle parallax on big numbers =================
  const parallaxEls = Array.from(document.querySelectorAll('.pfx-inner'));
  let parallaxTicking = false;
  function updateParallax() {
    parallaxTicking = false;
    const vh = window.innerHeight;
    parallaxEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      const centerOffset = (rect.top + rect.height / 2) - vh / 2;
      let shift = centerOffset * -0.05;
      shift = Math.max(-8, Math.min(8, shift)); // hard clamp: never large enough to overlap neighbouring text
      el.style.transform = `translateY(${shift}px)`;
    });
  }
  window.addEventListener('scroll', () => {
    if (!parallaxTicking) { parallaxTicking = true; requestAnimationFrame(updateParallax); }
  }, { passive: true });
  updateParallax();

  // ================= 6. Typewriter effect for quote cards =================
  const typeTargets = document.querySelectorAll('.quote-card .q');
  const typeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      typeObserver.unobserve(el);
      const fullText = el.textContent;
      el.textContent = '';
      el.style.visibility = 'visible';
      const cursorSpan = document.createElement('span');
      cursorSpan.className = 'typewriter-cursor';
      el.appendChild(document.createTextNode(''));
      el.appendChild(cursorSpan);
      let i = 0;
      const speed = 28;
      function typeNext() {
        if (i <= fullText.length) {
          el.firstChild.textContent = fullText.slice(0, i);
          i++;
          setTimeout(typeNext, speed);
        } else {
          cursorSpan.remove();
        }
      }
      typeNext();
    });
  }, { threshold: 0.5 });
  typeTargets.forEach(el => typeObserver.observe(el));
});


/* ================= Werkstatt: klickbarer Prototyp ================= */
(function(){
  var data = document.getElementById('protoData');
  var phone = document.getElementById('protoPhone');
  if(!data || !phone) return;
  var steps;
  try{ steps = JSON.parse(data.textContent); }catch(e){ return; }

  var shot = document.getElementById('protoShot');
  var tap = document.getElementById('protoTap');
  var num = document.getElementById('protoNum');
  var cap = document.getElementById('protoCaption');
  var next = document.getElementById('protoNext');
  var list = document.getElementById('protoSteps');
  var reset = document.getElementById('protoReset');
  var i = 0;

  steps.forEach(function(s){ var p = new Image(); p.src = s[0]; });

  function render(){
    var s = steps[i];
    phone.classList.add('is-turning');
    setTimeout(function(){
      shot.src = s[0];
      phone.classList.remove('is-turning');
    }, 110);
    tap.className = 'proto-tap' + (s[3] === 'mid' ? ' at-mid' : s[3] === 'nav' ? ' at-nav' : '');
    num.textContent = '0' + (i + 1);
    cap.textContent = s[1];
    next.textContent = s[2];
    Array.prototype.forEach.call(list.querySelectorAll('button'), function(b, n){
      b.classList.toggle('is-current', n === i);
    });
  }
  function go(n){ i = (n + steps.length) % steps.length; render(); }

  phone.addEventListener('click', function(){ go(i + 1); });
  list.addEventListener('click', function(e){
    var b = e.target.closest('button[data-step]');
    if(b) go(parseInt(b.getAttribute('data-step'), 10));
  });
  if(reset) reset.addEventListener('click', function(){ go(0); });
  phone.addEventListener('keydown', function(e){
    if(e.key === 'ArrowRight'){ e.preventDefault(); go(i + 1); }
    if(e.key === 'ArrowLeft'){ e.preventDefault(); go(i - 1); }
  });
  render();
})();


// ================= Prozess-Visuals: Pin-Highlight + Lightbox =================
(function(){
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightboxImg');
  function open(src, alt){
    if(!lb || !src) return;
    lbImg.src = src; lbImg.alt = alt || '';
    lb.classList.add('open'); document.body.style.overflow = 'hidden';
  }
  document.querySelectorAll('.fid-shot img, .annot-phone > img').forEach(function(img){
    img.addEventListener('click', function(){ open(img.src, img.alt); });
  });
  document.querySelectorAll('.proof-shot img').forEach(function(img){
    img.addEventListener('click', function(){
      if(img.closest('.proof-shot').classList.contains('is-empty')) return;
      open(img.src, img.alt);
    });
  });

  var items = Array.prototype.slice.call(document.querySelectorAll('.annot-item'));
  var pins = Array.prototype.slice.call(document.querySelectorAll('.annot-pin'));
  function setActive(id){
    items.forEach(function(it){ it.classList.toggle('is-active', it.dataset.pin === id); });
    pins.forEach(function(p){ p.classList.toggle('is-active', p.dataset.pin === id); });
  }
  function clear(){ setActive(null); }
  items.concat(pins).forEach(function(el){
    el.addEventListener('mouseenter', function(){ setActive(el.dataset.pin); });
    el.addEventListener('mouseleave', clear);
  });

})();


// ================= Hero-Stage: Screens wandern in den Loop =================
(function(){
  var track = document.querySelector('.hero-scroll');
  var stage = document.getElementById('heroStage');
  if(!track || !stage) return;

  var mid = document.getElementById('slotMid');
  var wl  = document.getElementById('slotWL');
  var wr  = document.getElementById('slotWR');
  var shots = Array.prototype.slice.call(stage.querySelectorAll('.hp-shot'));
  var beats = Array.prototype.slice.call(stage.querySelectorAll('.hero-beats .hb'));

  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    stage.style.setProperty('--loop-o','1');
    var s = stage.querySelector('.hp-shot.s3'); if(s) s.classList.add('is-on');
    return;
  }

  var clamp01 = function(v){ return v<0?0:v>1?1:v; };
  var seg = function(p,a,b){ return clamp01((p-a)/(b-a)); };
  var lerp = function(a,b,t){ return a + (b-a)*t; };
  var easeOut = function(t){ return 1 - Math.pow(1-t,3); };
  var easeInOut = function(t){ return t<.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; };
  var spring = function(t){ return t>=1 ? 1 : 1 - Math.pow(2,-9*t) * Math.cos(t*Math.PI*2.1); };

  var geo = {};
  function measure(){
    var sw = stage.clientWidth, sh = stage.clientHeight;
    var slotW = mid.offsetWidth || 200, slotH = mid.offsetHeight || 404;
    var caps = Array.prototype.slice.call(stage.querySelectorAll('.hp-cap'));
    // Bildunterschriften werden gegen die Slot-Skalierung zurückgerechnet:
    // ihre sichtbare Höhe entspricht der gemessenen Höhe.
    var capH = 0;
    caps.forEach(function(c){ capH = Math.max(capH, c.offsetHeight); });
    capH = (capH || 84) + 40;
    var headEl = document.getElementById('loopHead');
    // tatsaechlicher Unterrand des Kopfs innerhalb der Buehne (Top-Offset inklusive)
    var headBottom = 136;
    if(headEl){
      headBottom = headEl.getBoundingClientRect().bottom - stage.getBoundingClientRect().top;
      if(!(headBottom > 0)) headBottom = headEl.offsetTop + headEl.offsetHeight;
    }
    var headH = headBottom + 18;
    // Header: Gerät so groß wie die Bühne es zulässt
    geo.heroS  = Math.max(.3, Math.min(.68, Math.min((sh * 0.80) / slotH, (sw * 0.34) / slotW)));
    // Loop: drei Spalten, Platz für Kopfzeile UND Bildunterschrift
    var availH = sh - headH - capH - 20;
    geo.loopS  = Math.max(.20, Math.min(geo.heroS, Math.min(availH / slotH, (sw * 0.235) / slotW)));
    // Geraete nie kleiner als ~96px Breite rendern
    geo.loopS  = Math.min(geo.heroS, Math.max(geo.loopS, 96 / slotW));
    geo.heroX  = Math.min(sw * 0.26, 340);
    // Spaltenabstand: mindestens so breit, dass die Bildunterschriften nicht kollidieren
    geo.spread = Math.min(sw * 0.31, Math.max(slotW * geo.loopS * 1.34, 250));
    // Bildunterschrift im Verhaeltnis zum gerenderten Geraet, nie breiter als die Spalte
    geo.capW   = Math.round(Math.min(geo.spread - 24, Math.max(slotW * geo.loopS * 1.7, 150)));
    caps.forEach(function(c){
      c.style.setProperty('--cap-inv', (1 / geo.loopS).toFixed(4));
      c.style.setProperty('--cap-w', Math.round(geo.capW) + 'px');
      c.style.setProperty('--cap-gap', Math.round(16 / geo.loopS) + 'px');
    });
    // Geräte so setzen, dass die Bildunterschrift vollständig in der Bühne bleibt
    var half = (slotH * geo.loopS) / 2;
    // Oberkante der Geraete nie oberhalb des Kopf-Unterrands
    var minY = headH + 16 + half - sh/2;
    geo.loopY  = Math.round(Math.max(minY, Math.min(sh * 0.04, sh/2 - half - capH)));
  }

  function setSlot(el, x, y, s, rx, ry, rz, o, cap){
    var st = el.style;
    st.setProperty('--x', x.toFixed(1) + 'px');
    st.setProperty('--y', y.toFixed(1) + 'px');
    st.setProperty('--s', s.toFixed(3));
    st.setProperty('--rx', rx.toFixed(2) + 'deg');
    st.setProperty('--ry', ry.toFixed(2) + 'deg');
    st.setProperty('--rz', rz.toFixed(2) + 'deg');
    st.setProperty('--o', o.toFixed(3));
    st.setProperty('--cap-o', cap.toFixed(3));
  }

  var raf = null, lastP = -1;
  function frame(){
    raf = null;
    var rect = track.getBoundingClientRect();
    var total = track.offsetHeight - window.innerHeight;
    var p = clamp01((-rect.top) / Math.max(total,1));
    if(Math.abs(p - lastP) < 0.0004) return;
    lastP = p;
    var S = stage.style;

    // Beat 1 (0 → .20): Icon-Grid öffnet, Gerät richtet sich auf
    var rise = spring(seg(p,0,.24));
    S.setProperty('--app-s', (1 + Math.sin(clamp01(seg(p,.03,.15))*Math.PI) * 0.5).toFixed(3));
    var open = seg(p,.08,.20);
    S.setProperty('--board-o', (1 - easeInOut(open)).toFixed(3));
    S.setProperty('--board-s', lerp(1,1.8,easeOut(open)).toFixed(3));
    S.setProperty('--island-s', (1 + Math.sin(clamp01(seg(p,.14,.24))*Math.PI) * 0.35).toFixed(3));
    S.setProperty('--gloss-x', lerp(-70,90,easeInOut(seg(p,.20,.52))).toFixed(1) + '%');

    // Beat 2 (.20 → .44): kippen, Glas, Screens im Gerät
    var tilt = easeInOut(seg(p,0,.44));

    // Beat 3 (.44 → .78): Reise in die Loop-Anordnung
    var t = easeInOut(seg(p,.44,.78));
    var tw = easeInOut(seg(p,.46,.80));
    var sc = lerp(geo.heroS, geo.loopS, t);
    var capO = easeOut(seg(p,.80,.90));

    // Mittelgerät → linke Spalte (Schritt 01)
    setSlot(mid,
      lerp(geo.heroX, -geo.spread, t),
      lerp(lerp(44,0,rise), geo.loopY, t),
      sc,
      lerp(14,-3,tilt) * (1-t),
      lerp(lerp(-24,9,tilt), 0, t),
      lerp(0,-2.2,tilt) * (1-t),
      lerp(0.9,1,easeOut(seg(p,0,.10))),
      capO);

    // Flügel: erscheinen erst zur Reise – deckend, ohne Halbtransparenz
    setSlot(wl,
      lerp(geo.heroX - geo.spread*0.30, 0, tw),
      lerp(geo.loopY + 26, geo.loopY, tw),
      lerp(geo.loopS*0.86, geo.loopS, tw),
      0,
      lerp(-12, 0, tw),
      0,
      easeOut(seg(p,.63,.73)),
      capO);
    setSlot(wr,
      lerp(geo.heroX + geo.spread*0.30, geo.spread, tw),
      lerp(geo.loopY + 26, geo.loopY, tw),
      lerp(geo.loopS*0.86, geo.loopS, tw),
      0,
      lerp(12, 0, tw),
      0,
      easeOut(seg(p,.65,.75)),
      capO);

    // Kopfzeilen: Header-Copy raus, Loop-Kopf rein
    S.setProperty('--copy-y', lerp(0,-80,easeInOut(seg(p,.34,.66))).toFixed(1) + 'px');
    S.setProperty('--copy-o', (1 - easeInOut(seg(p,.36,.58))).toFixed(3));
    var loopIn = easeOut(seg(p,.62,.76));
    S.setProperty('--loop-o', loopIn.toFixed(3));
    S.setProperty('--loop-y', lerp(24,0,loopIn).toFixed(1) + 'px');
    S.setProperty('--loop-pe', loopIn > .6 ? 'auto' : 'none');
    S.setProperty('--hint-o', (1 - easeOut(seg(p,0,.08))).toFixed(3));
    S.setProperty('--beats-o', (1 - easeOut(seg(p,.46,.58))).toFixed(3));
    S.setProperty('--glow-o', (Math.sin(clamp01(seg(p,.12,.88))*Math.PI) * .8).toFixed(3));
    S.setProperty('--glow-s', lerp(.7,1.05,easeOut(seg(p,.16,.7))).toFixed(3));

    // Screens im Mittelgerät: weiche Überblendungen aus dem Scrollfortschritt
    var band = function(inA,inB,outA,outB){
      return clamp01(seg(p,inA,inB)) * (1 - clamp01(seg(p,outA,outB)));
    };
    var op = shots.length > 1
      ? [band(.15,.21,.29,.35), band(.29,.35,.40,.46), band(.40,.46,2,3)]
      : [band(.14,.24,2,3)];
    shots.forEach(function(s,i){ s.style.opacity = (op[i] || 0).toFixed(3); });
    var bi = p < .22 ? 0 : p < .44 ? 1 : 2;
    beats.forEach(function(b,i){ b.classList.toggle('is-on', i === bi); });
  }

  function onScroll(){ if(!raf) raf = requestAnimationFrame(frame); }
  function onResize(){ measure(); lastP = -1; onScroll(); }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onResize);
  measure(); frame();
  window.addEventListener('load', onResize);
})();

// Sidebar: Andeutung, wenn die Nav bei flachen Fenstern nicht vollständig passt
(function(){
  var sb = document.querySelector('.sidebar');
  var nav = document.querySelector('.nav');
  if(!sb || !nav) return;
  if(!nav.querySelector('.nav-more')){
    var hint = document.createElement('span');
    hint.className = 'nav-more';
    hint.textContent = 'mehr ↓';
    nav.appendChild(hint);
  }
  function check(){
    sb.dataset.navOverflow = (nav.scrollHeight - nav.clientHeight > 4) ? '1' : '0';
  }
  window.addEventListener('resize', check);
  nav.addEventListener('scroll', function(){
    var atEnd = nav.scrollTop + nav.clientHeight >= nav.scrollHeight - 4;
    sb.dataset.navOverflow = atEnd ? '0' : (nav.scrollHeight - nav.clientHeight > 4 ? '1' : '0');
  }, {passive:true});
  check();
})();


// ================= Screens-Laufband: laeuft immer durch, keine Luecken =================
(function(){
  var rows = Array.prototype.slice.call(document.querySelectorAll('.marquee-row'));
  if(!rows.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  rows.forEach(function(row){
    var wrap = row.parentElement;
    // Originalsatz = erste Haelfte (das Markup enthaelt bereits eine Kopie)
    var kids = Array.prototype.slice.call(row.children);
    var setLen = Math.ceil(kids.length / 2);
    var set = kids.slice(0, setLen);
    // ueberzaehlige Kopien entfernen, danach exakt nachfuellen
    kids.slice(setLen).forEach(function(n){ n.remove(); });

    var anim = null;
    function build(){
      if(anim){ anim.cancel(); anim = null; }
      row.style.transform = 'none';
      Array.prototype.slice.call(row.children).slice(setLen).forEach(function(n){ n.remove(); });

      var gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      var setW = row.scrollWidth + gap;                 // Satzbreite inkl. folgender Luecke
      var need = Math.ceil(wrap.clientWidth / setW) + 2; // genug Saetze fuer beide Richtungen
      for(var i = 1; i < need; i++){
        set.forEach(function(n){ row.appendChild(n.cloneNode(true)); });
      }
      if(reduce) return;

      var right = row.classList.contains('dir-right');
      var frames = right
        ? [{transform:'translateX(-' + setW + 'px)'}, {transform:'translateX(0px)'}]
        : [{transform:'translateX(0px)'}, {transform:'translateX(-' + setW + 'px)'}];
      anim = row.animate(frames, {duration: setW / 42 * 1000, iterations: Infinity, easing: 'linear'});
    }

    build();
    // Klon-Karten oeffnen die Lightbox ueber Delegation
    wrap.addEventListener('click', function(e){
      var card = e.target.closest ? e.target.closest('.phone-card') : null;
      if(!card || set.indexOf(card) !== -1) return;
      var img = card.querySelector('.phone-frame img');
      var lb = document.getElementById('lightbox'), lbi = document.getElementById('lightboxImg');
      if(img && lb && lbi){
        lbi.src = img.src; lbi.alt = img.alt || '';
        lb.classList.add('open'); document.body.style.overflow = 'hidden';
      }
    });
    var t;
    window.addEventListener('resize', function(){ clearTimeout(t); t = setTimeout(build, 220); });
  });
})();


// ================= Uebergang dunkel -> hell =================
(function(){
  var dark = document.querySelector('.hero-scroll');
  var pill = document.querySelector('.topbar-inner');
  // Navigation erscheint mit dem Screens-Laufband
  var trigger = document.querySelector('.marquee-wrap');
  trigger = trigger ? trigger.closest('.section') : null;
  if(!dark) return;

  var cursor = document.querySelector('.custom-cursor');
  var mouseY = -1, edgeNow = 0, raf = null;

  function apply(){
    raf = null;
    var edge = dark.getBoundingClientRect().bottom;
    edgeNow = edge;

    if(trigger){
      var vh = window.innerHeight;
      var tr = trigger.getBoundingClientRect();
      // sichtbarer Anteil des Laufband-Abschnitts
      var vis = Math.min(Math.max((vh - tr.top) / tr.height, 0), 1);
      // ab 20% Sichtbarkeit faded der dunkle Block innerhalb von 12% aus
      var fade = 1 - Math.min(Math.max((vis - 0.20) / 0.12, 0), 1);
      document.documentElement.style.setProperty('--stage-fade', fade.toFixed(3));
      document.body.classList.toggle('side-on', fade <= 0.02);
    }
    if(pill){
      document.body.classList.toggle('dark-behind',
        edge > pill.getBoundingClientRect().top);
    }
    if(cursor && mouseY >= 0) cursor.classList.toggle('on-dark', mouseY < edge);
  }
  function tick(){ if(!raf) raf = requestAnimationFrame(apply); }

  window.addEventListener('scroll', tick, {passive:true});
  window.addEventListener('resize', tick);
  window.addEventListener('mousemove', function(e){
    mouseY = e.clientY;
    if(cursor) cursor.classList.toggle('on-dark', mouseY < edgeNow);
  }, {passive:true});
  apply();
})();


// ---------- 01 Widerspruch: Beweiskette einblenden ----------
(function(){
  const steps = document.querySelectorAll('.chain-step');
  if (!steps.length) return;
  const io = new IntersectionObserver((es)=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.2});
  steps.forEach((el,i)=>{ el.style.transitionDelay = (i*.06)+'s'; io.observe(el); });
})();
