/* ============================================================
   cursor.js — reactive custom cursor + magnetic elements
   ============================================================ */
(function () {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  const label = ring ? ring.querySelector('.c-label') : null;
  if (!dot || !ring) { return; }

  // disable on touch devices
  if (window.matchMedia('(hover: none)').matches) {
    document.body.classList.remove('has-cursor');
    return;
  }

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  }, { passive: true });

  function follow() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(follow);
  }
  follow();

  // hover targets
  const interactive = 'a, button, input, textarea, .proj, .module, .social, .post, .swatch, .portrait, [data-cursor]';
  document.addEventListener('pointerover', (e) => {
    const el = e.target.closest(interactive);
    if (!el) { return; }
    ring.classList.add('is-hover');
    const lbl = el.getAttribute('data-cursor');
    if (lbl) { label.textContent = lbl; ring.classList.add('has-label'); }
  });
  document.addEventListener('pointerout', (e) => {
    const el = e.target.closest(interactive);
    if (!el) { return; }
    ring.classList.remove('is-hover');
    ring.classList.remove('has-label');
    label.textContent = '';
  });

  // hide cursor when leaving window
  document.addEventListener('pointerleave', () => { dot.style.opacity = 0; ring.style.opacity = 0; });
  document.addEventListener('pointerenter', () => { dot.style.opacity = 1; ring.style.opacity = 1; });

  // ---- magnetic buttons ----
  function magnetize() {
    const mags = document.querySelectorAll('.btn, .resume-btn, .swatch, .theme-toggle');
    mags.forEach((el) => {
      const strength = el.classList.contains('btn') ? 0.4 : 0.25;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }
  // run after render.js populates dynamic buttons
  window.addEventListener('load', () => setTimeout(magnetize, 50));
})();
