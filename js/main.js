// VELTO landing — nav, hero image switcher, pinned Mobility scroll stage with product switcher, Line Up card highlight
(function () {
  const nav = document.getElementById('nav');
  const stage = document.querySelector('[data-stage]');
  const pin = stage && stage.querySelector('.stage__pin');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stacked = window.matchMedia('(max-width:1024px)');

  const clamp = (v) => Math.min(1, Math.max(0, v));
  const range = (p, a, b) => clamp((p - a) / (b - a));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // GNB — one link per section, in page order; highlight the section in view
  const links = Array.from(document.querySelectorAll('.nav__links a'));
  const sections = links.map((a) => document.querySelector(a.getAttribute('href')));
  function updateCurrent() {
    const probe = window.innerHeight * 0.4;
    let cur = 0;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= probe) cur = i; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) cur = sections.length - 1;
    links.forEach((a, i) => a.classList.toggle('is-current', i === cur));
  }
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY);
      window.scrollTo({ top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
  });

  // Hero — click a thumbnail to show that image
  const slides = Array.from(document.querySelectorAll('.hero__slide'));
  const thumbs = Array.from(document.querySelectorAll('.hero__thumb'));
  thumbs.forEach((t, i) => {
    t.addEventListener('click', () => {
      slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
      thumbs.forEach((b, k) => {
        b.classList.toggle('is-active', k === i);
        b.setAttribute('aria-pressed', String(k === i));
      });
    });
  });

  // Products — the dock switches the scooter and the diamond color (same section, one product at a time)
  const products = [
    { color: '#93dc73', img: 'assets/products/scooter-green.png' },
    { color: '#dc7d60', img: 'assets/products/scooter-red.png' },
    { color: '#81898e', img: 'assets/products/scooter-black.png' },
    { color: '#e4c05b', img: 'assets/products/scooter-yellow.png' },
  ];
  const productImgs = Array.from(document.querySelectorAll('.stage__product img'));
  const dockBtns = Array.from(document.querySelectorAll('.dock__btn'));
  const colorNames = ['그린', '레드', '블랙', '옐로'];
  function showProduct(i) {
    productImgs.forEach((im, k) => im.classList.toggle('is-active', k === i));
    if (pin) pin.style.setProperty('--diamond', products[i].color);
    // current product first, the other three follow in order
    const order = [i, ...products.map((_, k) => k).filter((k) => k !== i)];
    dockBtns.forEach((b, n) => {
      const k = order[n];
      b.dataset.i = k;
      b.setAttribute('aria-label', 'VELTO B ' + colorNames[k]);
      b.querySelector('img').src = products[k].img;
    });
  }
  dockBtns.forEach((b) => {
    if (b.classList.contains('is-current')) return;
    b.addEventListener('click', () => showProduct(Number(b.dataset.i)));
  });
  showProduct(0);

  let ticking = false;
  function update() {
    ticking = false;
    nav.classList.toggle('is-solid', window.scrollY > 8);
    updateCurrent();
    if (!pin) return;

    let p = 1;
    if (!reduceMotion.matches && !stacked.matches) {
      const travel = stage.offsetHeight - pin.offsetHeight;
      p = clamp(-stage.getBoundingClientRect().top / travel);
    }
    // "Products" word rises, the small diamond behind the product grows,
    // then copy / spec card / dock fade in
    pin.style.setProperty('--w', ease(range(p, 0, 0.7)).toFixed(4));
    pin.style.setProperty('--d', ease(range(p, 0.1, 0.8)).toFixed(4));
    pin.style.setProperty('--u', ease(range(p, 0.6, 1)).toFixed(4));
    pin.classList.toggle('is-live', p > 0.9);
  }
  const requestUpdate = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  stacked.addEventListener('change', requestUpdate);
  update();

  // Line Up — arrows move the highlighted (white) card
  const cards = Array.from(document.querySelectorAll('.lcard'));
  document.querySelectorAll('.lineup__arrow').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cur = Math.max(0, cards.findIndex((c) => c.classList.contains('is-active')));
      const next = (cur + Number(btn.dataset.dir) + cards.length) % cards.length;
      cards.forEach((c, i) => c.classList.toggle('is-active', i === next));
    });
  });
})();
