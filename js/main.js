// VELTO landing — nav, hero image switcher, pinned Mobility scroll stage with product switcher, Line Up hover, Q&A accordion
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

  // Hero — thumbnails and a timer switch image + copy together
  const slides = Array.from(document.querySelectorAll('.hero__slide'));
  const thumbs = Array.from(document.querySelectorAll('.hero__thumb'));
  const texts = Array.from(document.querySelectorAll('.hero__text'));
  let heroIdx = 0;
  let heroTimer = null;
  function setHero(i) {
    heroIdx = i;
    slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
    texts.forEach((t, k) => t.classList.toggle('is-active', k === i));
    thumbs.forEach((b, k) => {
      b.classList.toggle('is-active', k === i);
      b.setAttribute('aria-pressed', String(k === i));
    });
  }
  function startHero() {
    clearInterval(heroTimer);
    if (reduceMotion.matches) return;
    heroTimer = setInterval(() => setHero((heroIdx + 1) % slides.length), 5000);
  }
  thumbs.forEach((t, i) => t.addEventListener('click', () => { setHero(i); startHero(); }));
  startHero();

  // Shapes — armed on load, dropped (and re-dropped) whenever the section scrolls into view
  const shapes = document.querySelector('.shapes');
  if (shapes) shapes.classList.add('is-armed');
  function updateShapes() {
    if (!shapes) return;
    const r = shapes.getBoundingClientRect();
    const vh = window.innerHeight;
    const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    if (visible >= Math.min(r.height, vh) * 0.3) shapes.classList.add('is-in');
    else if (visible <= 0) shapes.classList.remove('is-in');
  }

  // Products — scrolling past the intro swaps the scooter one by one; the dock circles slide left and the name changes
  const products = [
    { name: 'VELTO Mint', color: '#93dc73', img: 'assets/products/scooter-green.png', alt: '그린' },
    { name: 'VELTO Coral', color: '#dc7d60', img: 'assets/products/scooter-red.png', alt: '레드' },
    { name: 'VELTO Slate', color: '#81898e', img: 'assets/products/scooter-black.png', alt: '블랙' },
    { name: 'VELTO Sun', color: '#e4c05b', img: 'assets/products/scooter-yellow.png', alt: '옐로' },
  ];
  const productImgs = Array.from(document.querySelectorAll('.stage__product img'));
  const dockBtns = Array.from(document.querySelectorAll('.dock__btn'));
  const specTitle = document.querySelector('.spec__title');
  // dock is a nav bar: fixed order, the current item expands to show its name
  dockBtns.forEach((b, k) => {
    b.querySelector('img').src = products[k].img;
    b.querySelector('.dock__name').textContent = products[k].name;
    b.setAttribute('aria-label', products[k].name + ' ' + products[k].alt);
  });
  let curProduct = -1;
  function showProduct(i) {
    if (i === curProduct) return;
    curProduct = i;
    productImgs.forEach((im, k) => im.classList.toggle('is-active', k === i));
    if (pin) pin.style.setProperty('--diamond', products[i].color);
    if (specTitle) specTitle.textContent = products[i].name;
    dockBtns.forEach((b, k) => {
      b.classList.toggle('is-current', k === i);
      if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
  }
  // scroll offset (px below the stage top) at which product i takes over
  const STEP = 0.5; // viewport heights per product
  const EXTRA = 2;  // viewport heights added to .stage after the intro (CSS: 350vh = 150vh intro + 200vh)
  function productStart(i) {
    const intro = stage.offsetHeight - pin.offsetHeight - window.innerHeight * EXTRA;
    return intro + i * STEP * window.innerHeight;
  }
  dockBtns.forEach((b, i) => {
    b.addEventListener('click', () => {
      if (i === curProduct) return;
      if (reduceMotion.matches || stacked.matches) { showProduct(i); return; }
      const top = stage.getBoundingClientRect().top + window.scrollY + productStart(i) + window.innerHeight * STEP * 0.5;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
  showProduct(0);

  let ticking = false;
  function update() {
    ticking = false;
    nav.classList.toggle('is-solid', window.scrollY > 8);
    updateCurrent();
    updateShapes();
    if (!pin) return;

    let p = 1;
    if (!reduceMotion.matches && !stacked.matches) {
      const vh = window.innerHeight;
      const intro = stage.offsetHeight - pin.offsetHeight - vh * EXTRA;
      const scrolled = -stage.getBoundingClientRect().top;
      p = clamp(scrolled / intro);
      showProduct(Math.min(products.length - 1, Math.max(0, Math.floor((scrolled - intro) / (vh * STEP)))));
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

  // Line Up — the hovered / focused card turns white
  const cards = Array.from(document.querySelectorAll('.lcard'));
  cards.forEach((c) => {
    const on = () => cards.forEach((o) => o.classList.toggle('is-active', o === c));
    c.addEventListener('mouseenter', on);
    c.addEventListener('focusin', on);
  });

  // Q&A — plus button opens / closes an answer
  document.querySelectorAll('.qna__q').forEach((q) => {
    q.addEventListener('click', () => {
      const item = q.closest('.qna__item');
      const open = item.classList.toggle('is-open');
      q.setAttribute('aria-expanded', String(open));
    });
  });
})();
