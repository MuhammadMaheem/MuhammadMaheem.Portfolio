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

  /* ---------- section headings resolve from scrambled letters, once ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    const glyphs = 'abcdefghknopqrsuvxyz';
    const decrypt = (h) => {
      // work on the text nodes only, so <br> and <em> inside the heading survive
      const nodes = [];
      const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) { nodes.push(walker.currentNode); }
      const finals = nodes.map((n) => n.nodeValue);
      const total = finals.reduce((sum, t) => sum + t.length, 0);
      if (!total) { return; }
      h.style.minHeight = h.offsetHeight + 'px';
      h.classList.add('decrypting');
      const start = performance.now();
      const dur = 520 + total * 9;
      (function frame(now) {
        const shown = Math.floor(Math.min(1, (now - start) / dur) * total);
        let seenChars = 0;
        nodes.forEach((n, i) => {
          let out = '';
          const t = finals[i];
          for (let c = 0; c < t.length; c++) {
            const ch = t[c];
            if (seenChars < shown || !/[A-Za-z]/.test(ch)) { out += ch; }
            else {
              const g = glyphs[(Math.random() * glyphs.length) | 0];
              out += ch === ch.toUpperCase() ? g.toUpperCase() : g;
            }
            seenChars++;
          }
          n.nodeValue = out;
        });
        if (shown < total) { requestAnimationFrame(frame); }
        else {
          nodes.forEach((n, i) => { n.nodeValue = finals[i]; });
          h.classList.remove('decrypting');
          h.style.minHeight = '';
        }
      })(start);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) { return; }
        io.unobserve(en.target);
        decrypt(en.target);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.section-head h2, #uplink h2').forEach((h) => io.observe(h));
  }

  /* ---------- staggered entrances (anime.js), each group plays once ----------
     Only children are animated: the .reveal parents are already driven by the
     scroll in interactions.js, and two scripts must not fight over one element. */
  if (!reduce && window.anime && 'IntersectionObserver' in window) {
    const groups = [
      ['.module', '.tags li', { translateY: [10, 0], scale: [0.9, 1] }, 28],
      ['.show', '.show-body > *', { translateY: [22, 0] }, 70],
      ['.show--game', '.phones', { translateY: ['30%', 0] }, 0],
      ['.show--web', '.browser', { translateX: [60, 0] }, 140],
      ['.spec-list', '.row', { translateX: [-18, 0] }, 60],
      ['.tl-item', 'h3, p', { translateX: [-18, 0] }, 90],
      ['.socials', '.social', { translateX: [-18, 0] }, 60],
    ];
    const jobs = new Map();
    groups.forEach(([parentSel, childSel, props, gap]) => {
      document.querySelectorAll(parentSel).forEach((parent) => {
        const kids = Array.from(parent.querySelectorAll(childSel));
        if (!kids.length) { return; }
        kids.forEach((k) => { k.style.opacity = '0'; });
        const list = jobs.get(parent) || [];
        list.push({ kids, props, gap });
        jobs.set(parent, list);
      });
    });
    const play = (parent) => {
      (jobs.get(parent) || []).forEach((job) => {
        anime(Object.assign({
          targets: job.kids,
          opacity: [0, 1],
          delay: anime.stagger(job.gap, { start: 80 }),
          duration: 760,
          easing: 'cubicBezier(0.16, 1, 0.3, 1)',
          // hand the element back to the stylesheet, so hover transforms still work
          complete: () => job.kids.forEach((k) => { k.style.transform = ''; k.style.opacity = ''; }),
        }, job.props));
      });
      jobs.delete(parent);
    };
    const enter = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) { return; }
        enter.unobserve(en.target);
        play(en.target);
      });
    }, { threshold: 0.18 });
    jobs.forEach((_, parent) => enter.observe(parent));
    // safety net: never leave content hidden if the observer does not fire
    setTimeout(() => {
      jobs.forEach((_, parent) => {
        const r = parent.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) { enter.unobserve(parent); play(parent); }
      });
    }, 2500);
  }

  /* ---------- nav marker + experience line (one throttled scroll pass) ---------- */
  const links = Array.from(document.querySelectorAll('#navLinks a'));
  const sections = links.map((a) => document.querySelector(a.getAttribute('href')));
  const marker = document.getElementById('navInd');
  const timeline = document.getElementById('timeline');
  const tlItems = timeline ? Array.from(timeline.querySelectorAll('.tl-item')) : [];
  let active = -2;
  const flow = document.getElementById('flowTrack');
  const flowSteps = flow ? Array.from(flow.querySelectorAll('.flow-step')) : [];
  const hero = document.getElementById('hero');
  const heroInner = hero ? hero.querySelector('.hero-inner') : null;
  const shows = Array.from(document.querySelectorAll('.show'));

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

    // flow diagram: the signal advances with the scroll and lights each step
    if (flow) {
      const r = flow.getBoundingClientRect();
      const span = Math.max(r.height, vh * 0.45);
      const p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.78 - r.top) / span));
      flow.style.setProperty('--p', p.toFixed(3));
      for (let k = 0; k < flowSteps.length; k++) {
        flowSteps[k].classList.toggle('on', p >= k / flowSteps.length + 0.03);
      }
    }

    // hero eases away as the next section arrives
    if (heroInner && !reduce) {
      const hp = Math.max(0, Math.min(1, 1 - hero.getBoundingClientRect().bottom / (vh * 0.45)));
      heroInner.style.setProperty('--hp', hp.toFixed(3));
    }

    // featured panels: the artwork drifts a little against the scroll
    if (!reduce) {
      for (let k = 0; k < shows.length; k++) {
        const r = shows[k].getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) { continue; }
        const off = (r.top + r.height / 2 - vh / 2) / vh;
        shows[k].style.setProperty('--par', Math.max(-1, Math.min(1, off)).toFixed(3));
      }
    }

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
