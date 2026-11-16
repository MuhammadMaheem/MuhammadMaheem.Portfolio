/* ============================================================
   enhance.js — motion added by the redesign. Runs after
   render.js and interactions.js.
   - rotating role in the hero
   - cursor spotlight + gentle tilt on project cards
   - pill nav marker that follows the section in view
   - experience line that fills as you scroll
   ============================================================ */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- hero: rotate through the roles ---------- */
  const role = document.getElementById('heroRole');
  if (role) {
    const words = role.textContent.split('|').map((w) => w.trim()).filter(Boolean);
    if (words.length > 1) {
      role.setAttribute('aria-label', words.join(', '));
      if (reduce) {
        role.textContent = words[0];
      } else {
        const rot = document.createElement('span');
        rot.className = 'rot';
        rot.setAttribute('aria-hidden', 'true');
        words.forEach((w, k) => {
          const word = document.createElement('span');
          word.className = 'rot-word' + (k === 0 ? ' in' : '');
          word.textContent = w;
          rot.appendChild(word);
        });
        role.textContent = '';
        role.appendChild(rot);
        const els = role.querySelectorAll('.rot-word');
        let i = 0;
        setInterval(() => {
          if (document.hidden) { return; }
          const cur = els[i];
          i = (i + 1) % els.length;
          const next = els[i];
          cur.classList.remove('in');
          cur.classList.add('out');
          next.classList.add('in');
          // park the old word back below, out of sight, ready for its next turn
          setTimeout(() => { cur.classList.remove('out'); }, 750);
        }, 2600);
      }
    }
  }

  /* ---------- cards: spotlight follows the cursor, media tilts ---------- */
  if (finePointer) {
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest ? e.target.closest('.show, .proj') : null;
      if (!card) { return; }
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      card.style.setProperty('--mx', x.toFixed(0) + 'px');
      card.style.setProperty('--my', y.toFixed(0) + 'px');
      if (!reduce && card.classList.contains('show')) {
        const stage = card.querySelector('.show-stage');
        if (stage) {
          stage.style.setProperty('--ry', ((x / r.width - 0.5) * 5).toFixed(2) + 'deg');
          stage.style.setProperty('--rx', ((0.5 - y / r.height) * 4).toFixed(2) + 'deg');
        }
      }
    }, { passive: true });

    document.querySelectorAll('.show').forEach((card) => {
      card.addEventListener('pointerleave', () => {
        const stage = card.querySelector('.show-stage');
        if (stage) {
          stage.style.setProperty('--rx', '0deg');
          stage.style.setProperty('--ry', '0deg');
        }
      });
    });
  }

  /* ---------- nav marker + experience line (one throttled scroll pass) ---------- */
  const links = Array.from(document.querySelectorAll('#navLinks a'));
  const sections = links.map((a) => document.querySelector(a.getAttribute('href')));
  const marker = document.getElementById('navInd');
  const timeline = document.getElementById('timeline');
  const tlItems = timeline ? Array.from(timeline.querySelectorAll('.tl-item')) : [];
  let active = -2;

  function setActive(i) {
    if (i === active) { return; }
    active = i;
    links.forEach((l, k) => l.classList.toggle('active', k === i));
    if (!marker) { return; }
    if (i < 0) { marker.style.opacity = '0'; return; }
    marker.style.opacity = '1';
    marker.style.width = links[i].offsetWidth + 'px';
    marker.style.transform = 'translateX(' + links[i].offsetLeft + 'px)';
  }

  function pass() {
    const vh = window.innerHeight;
    let current = -1;
    for (let k = 0; k < sections.length; k++) {
      if (sections[k] && sections[k].getBoundingClientRect().top <= vh * 0.45) { current = k; }
    }
    setActive(current);

    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const line = vh * 0.62;
      const p = r.height ? Math.max(0, Math.min(1, (line - r.top) / r.height)) : 0;
      timeline.style.setProperty('--tlp', p.toFixed(3));
      for (let k = 0; k < tlItems.length; k++) {
        tlItems[k].classList.toggle('lit', tlItems[k].getBoundingClientRect().top < line);
      }
    }
  }

  let queued = false;
  function onScroll() {
    if (queued) { return; }
    queued = true;
    requestAnimationFrame(() => { queued = false; pass(); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { active = -2; onScroll(); });
  pass();
  // link widths change once the web fonts arrive
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { active = -2; pass(); });
  }
})();
