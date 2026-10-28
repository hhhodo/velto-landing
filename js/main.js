// VELTO landing — nav, hero image switcher, pinned Mobility scroll stage with product switcher, Q&A accordion
(function () {
  const nav = document.getElementById('nav');
  const stage = document.querySelector('[data-stage]');
  const pin = stage && stage.querySelector('.stage__pin');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stacked = window.matchMedia('(max-width:1100px)');

  const clamp = (v) => Math.min(1, Math.max(0, v));
  const range = (p, a, b) => clamp((p - a) / (b - a));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // GNB — one link per section, in page order; highlight the section in view
  const links = Array.from(document.querySelectorAll('.nav__links a'));
  const sections = links.map((a) => document.querySelector(a.getAttribute('href')));
  function updateCurrent() {
    const probe = window.innerHeight * 0.4;
    let cur = -1; // nothing highlighted while the hero is on screen
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
  // physics — the cursor shoves a shape aside, a damped spring brings it back (a little overshoot included)
  if (shapes && window.matchMedia('(hover:hover)').matches) {
    const radius = { circle: 312, triangle: 250, square: 270 }; // Figma px, rough body size
    const bodies = Array.from(shapes.querySelectorAll('.shape')).map((el) => ({
      el, r: radius[['circle', 'triangle', 'square'].find((n) => el.classList.contains('shape--' + n))], x: 0, y: 0, vx: 0, vy: 0,
    }));
    let mouse = null;
    let raf = 0;
    let last = 0;
    const SPRING = 70, DAMP = 8, PUSH = 14000;
    function step(now) {
      const dt = Math.min(0.032, (now - last) / 1000 || 0.016);
      last = now;
      const k = window.innerWidth / 1920;
      let moving = false;
      bodies.forEach((b) => {
        const cx = b.el.offsetLeft + b.el.offsetWidth / 2 + b.x;
        const cy = b.el.offsetTop + b.el.offsetHeight / 2 + b.y;
        let ax = -SPRING * b.x - DAMP * b.vx;
        let ay = -SPRING * b.y - DAMP * b.vy;
        if (mouse) {
          const dx = cx - mouse.x, dy = cy - mouse.y;
          const dist = Math.hypot(dx, dy) || 1;
          const reach = (b.r + 200) * k;
          if (dist < reach) {
            const f = Math.pow(1 - dist / reach, 1.5) * PUSH * k;
            ax += (dx / dist) * f;
            ay += (dy / dist) * f;
          }
        }
        b.vx += ax * dt; b.vy += ay * dt;
        b.x += b.vx * dt; b.y += b.vy * dt;
        const cap = 170 * k, len = Math.hypot(b.x, b.y);
        if (len > cap) { b.x *= cap / len; b.y *= cap / len; }
        b.el.style.setProperty('--px', b.x.toFixed(2) + 'px');
        b.el.style.setProperty('--py', b.y.toFixed(2) + 'px');
        if (Math.abs(b.x) > 0.05 || Math.abs(b.y) > 0.05 || Math.abs(b.vx) > 0.5 || Math.abs(b.vy) > 0.5) moving = true;
      });
      raf = moving || mouse ? requestAnimationFrame(step) : 0;
    }
    const wake = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); } };
    shapes.addEventListener('pointermove', (e) => {
      if (stacked.matches || reduceMotion.matches) return;
      const r = shapes.getBoundingClientRect();
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
      wake();
    });
    shapes.addEventListener('pointerleave', () => { mouse = null; wake(); });
  }
  function updateShapes() {
    if (!shapes) return;
    const r = shapes.getBoundingClientRect();
    const vh = window.innerHeight;
    const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    if (visible >= Math.min(r.height, vh) * 0.3) shapes.classList.add('is-in');
    else if (visible <= 0) { shapes.classList.remove('is-in'); }
  }

  // Products — scrolling past the intro swaps the scooter one by one; the dock circles slide left and the name changes
  const products = [
    { name: 'VELTO Mint', desc: '출퇴근과 라스트마일에 맞춘 기본형 모델. 접어서 보관하기 쉽고 누구나 편하게 탈 수 있습니다.', stats: ['45 km', '360 Wh', '25 km/h'], title: '도심을 가볍게, 라스트마일의 기준', text: '가벼운 차체와 안정적인 주행감으로 출퇴근길과 골목 구석구석까지 부담 없이 이어줍니다.', color: '#93dc73', img: 'assets/products/scooter-green.png', alt: '그린' },
    { name: 'VELTO Coral', desc: '거점 기반 공유 서비스에 맞춘 운영형 모델. 한눈에 눈에 띄고 정비도 간편합니다.', stats: ['60 km', '480 Wh', '25 km/h'], title: '눈에 띄는 존재감, 공유에 최적', text: '선명한 코랄 컬러와 튼튼한 프레임으로 거점 기반 공유 서비스에서도 한눈에 찾기 쉽습니다.', color: '#dc7d60', img: 'assets/products/scooter-red.png', alt: '레드' },
    { name: 'VELTO Slate', desc: '긴 주행거리와 강한 출력을 갖춘 플래그십 모델. 오르막과 장거리에도 안정적으로 달립니다.', stats: ['150 km', '1,200 Wh', '45 km/h'], title: '힘이 필요한 길을 위한 고성능', text: '대용량 배터리와 강력한 모터로 언덕과 장거리까지 여유 있게 달려갑니다.', color: '#81898e', img: 'assets/products/scooter-black.png', alt: '블랙' },
    { name: 'VELTO Sun', desc: '시인성과 승차감을 높인 데일리 모델. 매일 타도 지치지 않는 편안한 주행을 만듭니다.', stats: ['80 km', '640 Wh', '35 km/h'], title: '어디서든 밝게, 데일리 모델', text: '시인성 높은 옐로 컬러와 넉넉한 발판으로 매일 타도 편안한 주행을 만듭니다.', color: '#e4c05b', img: 'assets/products/scooter-yellow.png', alt: '옐로' },
  ];
  const productImgs = Array.from(document.querySelectorAll('.stage__product img'));
  const dockBtns = Array.from(document.querySelectorAll('.dock__btn'));
  const specTitle = document.querySelector('.spec__title');
  const specText = document.querySelector('.spec__text');
  const stageTitle = document.querySelector('.stage__title');
  const stageDesc = document.querySelector('.stage__desc');
  const stageStats = Array.from(document.querySelectorAll('.stage__stats dd'));
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
    if (specTitle) specTitle.textContent = products[i].title;
    if (specText) specText.textContent = products[i].text;
    if (stageTitle) stageTitle.textContent = products[i].name;
    if (stageDesc) stageDesc.textContent = products[i].desc;
    stageStats.forEach((dd, k) => { dd.textContent = products[i].stats[k]; });
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

  // Q&A — plus button opens / closes an answer
  document.querySelectorAll('.qna__q').forEach((q) => {
    q.addEventListener('click', () => {
      const item = q.closest('.qna__item');
      const open = item.classList.toggle('is-open');
      q.setAttribute('aria-expanded', String(open));
    });
  });
})();
