// VELTO landing — nav state, pinned "Products" scroll stage, reveal-on-scroll
(function () {
  document.documentElement.classList.add('js');

  const nav = document.querySelector('.nav');
  const stage = document.querySelector('[data-stage]');
  const pin = stage && stage.querySelector('.stage__pin');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stacked = window.matchMedia('(max-width:1024px)');

  const clamp = (v) => Math.min(1, Math.max(0, v));
  const range = (p, a, b) => clamp((p - a) / (b - a));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  let ticking = false;
  function update() {
    ticking = false;
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
    if (!pin) return;

    let p = 1;
    if (!reduceMotion.matches && !stacked.matches) {
      const travel = stage.offsetHeight - window.innerHeight;
      p = clamp(-stage.getBoundingClientRect().top / travel);
    }
    // word rises first, diamond + product follow, copy / spec / dock land last
    pin.style.setProperty('--w', ease(range(p, 0, 0.7)).toFixed(4));
    pin.style.setProperty('--d', ease(range(p, 0.1, 0.8)).toFixed(4));
    pin.style.setProperty('--u', ease(range(p, 0.7, 1)).toFixed(4));
    pin.classList.toggle('is-live', p > 0.9);
  }
  const requestUpdate = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  stacked.addEventListener('change', requestUpdate);
  update();

  const items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    items.forEach((el, i) => { el.style.transitionDelay = (i % 3) * 120 + 'ms'; io.observe(el); });
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }
})();
