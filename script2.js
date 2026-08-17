class Component extends DCLogic {
  state = { c: [0, 0, 0], scrolled: false, active: '', chatOpen: false, nudge: false, badge: false, typing: false, opened: false, cvOpen: false, lb: null };

  componentDidMount() {
    const targets = [1, 4, 7];
    let start = null;
    const step = (ts) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / 1100);
      const e = 1 - Math.pow(1 - p, 3);
      this.setState({ c: targets.map(t => Math.round(t * e)) });
      if (p < 1) this._raf = requestAnimationFrame(step);
    };
    this._raf = requestAnimationFrame(step);

    this._t1 = setTimeout(() => {
      if (!this.state.chatOpen) this.setState({ nudge: true, badge: true });
    }, 3800);
    this._t2 = setTimeout(() => this.setState({ nudge: false }), 10500);

    this._esc = (e) => {
      if (e.key !== 'Escape') return;
      if (this.state.lb) this.setState({ lb: null });
      else if (this.state.chatOpen) this.setState({ chatOpen: false });
    };
    document.addEventListener('keydown', this._esc);

    const ids = ['projekte','antrieb','expertise','ueber-mich','blog','zwischendurch','kontakt'];
    const px = Array.from(document.querySelectorAll('[data-px]')).map(el => ({ el, base: el.style.transform || '' }));
    this._scroll = () => {
      const y = window.scrollY || 0;
      const scrolled = y > 40;
      let active = '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= window.innerHeight * 0.42 && r.bottom > window.innerHeight * 0.42) active = id;
      }
      if (scrolled !== this.state.scrolled || active !== this.state.active) this.setState({ scrolled, active });
      for (let i = 0; i < px.length; i++) {
        const el = px[i].el;
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) continue;
        const rel = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        el.style.transform = px[i].base + ' translateY(' + (rel * (i % 3 === 1 ? -26 : -14)).toFixed(1) + 'px)';
      }
    };
    window.addEventListener('scroll', this._scroll, { passive: true });
    this._scroll();

    if ('IntersectionObserver' in window) {
      const nodes = Array.from(document.querySelectorAll('section, footer, #kontakt')).filter(n => !n.closest('[role="dialog"]') && !n.hasAttribute('data-noreveal'));
      nodes.forEach(n => {
        n.style.opacity = '0';
        n.style.transform = 'translateY(22px)';
        n.style.transition = 'opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1)';
      });
      this._io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          e.target.style.opacity = '1';
          e.target.style.transform = 'none';
          this._io.unobserve(e.target);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.04 });
      nodes.forEach(n => this._io.observe(n));
    }
  }

  componentWillUnmount() {
    cancelAnimationFrame(this._raf);
    clearTimeout(this._t1);
    clearTimeout(this._t2);
    clearTimeout(this._t3);
    document.removeEventListener('keydown', this._esc);
    window.removeEventListener('scroll', this._scroll);
    if (this._io) this._io.disconnect();
  }

  openChat = () => {
    const first = !this.state.opened;
    this.setState({ chatOpen: true, opened: true, nudge: false, badge: false, typing: first });
    if (first) this._t3 = setTimeout(() => this.setState({ typing: false }), 1200);
  };

  renderVals() {
    const c = this.state.c;
    const a = this.state.active;
    const nav = {};
    [['projekte','Projekte'],['antrieb','Antrieb'],['expertise','Expertise'],['ueber-mich','UeberMich'],['blog','Blog'],['zwischendurch','Mehr']].forEach(([id, key]) => {
      const on = a === id;
      nav['navFg' + key] = on ? '#0A0A0A' : '#6E6E73';
      nav['navBg' + key] = on ? '#EDEDF0' : 'transparent';
    });
    return {
      ...nav,
      navScale: this.state.scrolled ? 0.94 : 1,
      c1: String(c[0]), c2: String(c[1]), c3: String(c[2]),
      chatOpen: this.state.chatOpen,
      chatClosed: !this.state.chatOpen,
      nudge: this.state.nudge && !this.state.chatOpen,
      badge: this.state.badge,
      typing: this.state.typing,
      showLatest: !this.state.typing,
      openChat: this.openChat,
      closeChat: () => this.setState({ chatOpen: false }),
      cvOpen: this.state.cvOpen,
      cvClosed: !this.state.cvOpen,
      toggleCv: () => this.setState(s => ({ cvOpen: !s.cvOpen })),
      openPrdruck: () => this.setState({ lb: 'prdruck' }),
      openBlender: () => this.setState({ lb: 'blender' }),
      closeLightbox: () => this.setState({ lb: null }),
      lightbox: !!this.state.lb,
      lbPrdruck: this.state.lb === 'prdruck',
      lbBlender: this.state.lb === 'blender',
      showVideo: this.props.showVideoSlot ?? true,
      showTestimonials: this.props.showTestimonials ?? true
    };
  }
}

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
