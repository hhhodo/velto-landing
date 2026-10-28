// VELTO landing — nav state, pinned "Products" scroll stage, Line Up card highlight
(function () {
  const nav = document.getElementById('nav');
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
    nav.classList.toggle('is-solid', window.scrollY > 8);
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
