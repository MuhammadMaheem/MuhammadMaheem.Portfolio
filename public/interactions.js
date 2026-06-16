/* ============================================================
   interactions.js — scroll reveals, nav state, theme + accent,
   text scramble, counters, uptime, mobile menu, form.
   ============================================================ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ---------- enable JS-gated entrance states, then boot ---------- */
  root.classList.add('js-ready');
  // add `booted` reliably (timers fire even when RAF is throttled)
  setTimeout(() => document.body.classList.add('booted'), 80);

  /* ---------- scroll-LINKED reveals (capture-safe, no frozen transitions) ----------
     Opacity/transform are a pure function of scroll position, applied inline
     and synchronously — so any captured frame shows the correct state. */
  const revealEls = $$('.reveal');
  function fireCounter(node) {
    if (node.dataset.done) { return; }
    node.dataset.done = '1';
    const val = parseFloat(node.dataset.val);
    const suffix = node.dataset.suffix || '';
    const isFloat = val % 1 !== 0;
    if (reduce || !window.anime) { node.textContent = (isFloat ? val.toFixed(1) : val) + suffix; return; }
    const obj = { n: 0 };
    anime({ targets: obj, n: val, duration: 1600, easing: 'easeOutExpo',
      update: () => { node.textContent = (isFloat ? obj.n.toFixed(1) : Math.round(obj.n)) + suffix; },
      complete: () => { node.textContent = (isFloat ? val.toFixed(1) : val) + suffix; } });
  }
  function updateReveals() {
    const vh = window.innerHeight;
    if (reduce) { revealEls.forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; }); }
    else {
      const start = vh * 0.98, end = vh * 0.74;
      for (let i = 0; i < revealEls.length; i++) {
        const el = revealEls[i];
        const top = el.getBoundingClientRect().top;
        let p = (start - top) / (start - end);
        p = p < 0 ? 0 : p > 1 ? 1 : p;
        el.style.opacity = p;
        el.style.transform = p === 1 ? 'none' : 'translateY(' + ((1 - p) * 26).toFixed(1) + 'px)';
      }
    }
    // counters fire when their tile is mostly in view
    const cs = document.querySelectorAll('.metric .num');
    for (let i = 0; i < cs.length; i++) {
      const r = cs[i].getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) { fireCounter(cs[i]); }
    }
  }
  window.addEventListener('scroll', updateReveals, { passive: true });
  window.addEventListener('resize', updateReveals);
  updateReveals();
  setTimeout(updateReveals, 200);

  /* ---------- nav scrolled state ---------- */
  const nav = $('#nav');
  const onScroll = () => { nav.classList.toggle('scrolled', window.scrollY > 40); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- smooth anchor scroll ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id.length < 2) { return; }
      const t = document.querySelector(id);
      if (!t) { return; }
      e.preventDefault();
      const y = t.getBoundingClientRect().top + window.scrollY - 8;
      window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
      closeMenu();
    });
  });

  /* ---------- theme + accent locked ----------
     Toggles removed by request: the site stays dark + voltage (green).
     Force the defaults and clear any previously-saved overrides. */
  root.setAttribute('data-theme', 'dark');
  root.setAttribute('data-accent', 'voltage');
  try { localStorage.removeItem('mhm-theme'); localStorage.removeItem('mhm-accent'); } catch (e) {}

  /* ---------- mobile menu ---------- */
  const menu = $('#mobileMenu');
  function closeMenu() { menu && menu.classList.remove('open'); }
  $('#burger') && $('#burger').addEventListener('click', () => menu.classList.toggle('open'));

  /* ---------- codename scramble (subtle) ---------- */
  const codeEl = $('#codename');
  const glyphs = '01<>/[]{}#$%&*';
  function scramble(target, finalText, dur) {
    if (reduce) { target.textContent = finalText; return; }
    const len = finalText.length; let frame = 0; const total = dur / 16;
    const id = setInterval(() => {
      frame++;
      let out = '';
      for (let i = 0; i < len; i++) {
        if (i < (frame / total) * len) { out += finalText[i]; }
        else if (finalText[i] === ' ') { out += ' '; }
        else { out += glyphs[(Math.random() * glyphs.length) | 0]; }
      }
      target.textContent = out;
      if (frame >= total) { clearInterval(id); target.textContent = finalText; }
    }, 16);
  }
  if (codeEl) { setTimeout(() => scramble(codeEl, 'MHM·01 // SYSTEM ONLINE', 900), 200); }

  /* ---------- uptime ticker (skipped if element absent) ---------- */
  const uptimeEl = $('#rUptime');
  const boot = new Date('2021-06-01T00:00:00');
  function tickUptime() {
    if (!uptimeEl) { return; }
    const s = Math.floor((Date.now() - boot.getTime()) / 1000);
    const d = Math.floor(s / 86400);
    const h = String(Math.floor((s % 86400) / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    uptimeEl.textContent = `${d}d ${h}:${m}:${sec}`;
  }
  tickUptime(); setInterval(tickUptime, 1000);

  /* ---------- drag hint near hero core ---------- */
  const hint = $('#dragHint');
  if (hint) {
    setTimeout(() => { hint.style.opacity = '1'; }, 2600);
    window.addEventListener('pointerdown', () => { hint.style.opacity = '0'; }, { once: true });
    window.addEventListener('scroll', () => { hint.style.opacity = '0'; }, { once: true, passive: true });
  }

  /* ---------- contact form (real submission) ----------
     Inbox delivery: paste a free Web3Forms access key below
     (https://web3forms.com — no account, key emailed instantly).
     If left blank, the form opens the visitor's mail client
     pre-filled to your address — works with zero setup. */
  const WEB3FORMS_KEY = '1605410d-eb4f-419e-b511-25c3ef4c5da4';
  const CONTACT_EMAIL = 'mirza.muhammad.maheem@gmail.com';

  const form = $('#contactForm');
  if (form) {
    const fName = $('#f-name'), fEmail = $('#f-email'), fMsg = $('#f-msg');
    const btn = $('#sendBtn');
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    function validate() {
      let ok = true;
      const nameVal = form.name.value.trim();
      const emailVal = form.email.value.trim();
      const msgVal = form.msg.value.trim();
      fName.classList.toggle('invalid', !nameVal); if (!nameVal) ok = false;
      const emailBad = !emailRe.test(emailVal); fEmail.classList.toggle('invalid', emailBad); if (emailBad) ok = false;
      fMsg.classList.toggle('invalid', !msgVal); if (!msgVal) ok = false;
      return ok;
    }
    function setBtn(html) { btn.innerHTML = html; }
    function reset(delay) {
      setTimeout(() => { btn.classList.remove('sent'); setBtn('Transmit <span class="arrow">→</span>'); }, delay);
    }
    function succeed() {
      btn.classList.add('sent');
      setBtn('Transmitted ✓');
      if (window.anime) { anime({ targets: btn, scale: [1, 0.94, 1], duration: 400, easing: 'easeOutBack' }); }
      form.reset();
      reset(2800);
    }
    function mailtoFallback(name, email, msg) {
      const subject = encodeURIComponent('Portfolio uplink from ' + name);
      const body = encodeURIComponent(msg + '\n\n— ' + name + ' · ' + email);
      window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate()) { return; }
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const msg = form.msg.value.trim();

      // No backend key → open the visitor's email client pre-filled.
      if (!WEB3FORMS_KEY) {
        mailtoFallback(name, email, msg);
        succeed();
        return;
      }

      // With a key → POST to Web3Forms for real inbox delivery.
      setBtn('Transmitting…');
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            name: name, email: email, message: msg,
            subject: 'Portfolio uplink from ' + name,
            from_name: 'MHM·01 Portfolio'
          })
        });
        const data = await res.json();
        if (data && data.success) { succeed(); }
        else { throw new Error('web3forms'); }
      } catch (err) {
        setBtn('Couldn’t send — opening email ↗');
        setTimeout(() => mailtoFallback(name, email, msg), 600);
        reset(3200);
      }
    });

    ['name','email','msg'].forEach((n) => form[n].addEventListener('input', () => {
      const map = { name: fName, email: fEmail, msg: fMsg };
      map[n].classList.remove('invalid');
    }));
  }

  /* ---------- project modal with slider ---------- */
  const modal = $('#projModal');
  const pmBackdrop = $('#pmBackdrop');
  const pmClose = $('#pmClose');
  const pmSlides = $('#pmSlides');
  const pmDots = $('#pmDots');
  const pmPrev = $('#pmPrev');
  const pmNext = $('#pmNext');
  let slideIdx = 0;
  let slideCount = 3;

  const TAG_HUE = {
    'LLM Eval':'#C6FF3A', RAG:'#54B7FF', NLP:'#34d399', Vision:'#FF6A2B',
    RL:'#a78bfa', ML:'#fbbf24', Web:'#60a5fa', FinTech:'#4ade80',
    Health:'#f472b6'
  };
  const SLIDE_LABELS = ['01', '02', '03'];

  function goSlide(idx) {
    slideIdx = Math.max(0, Math.min(slideCount - 1, idx));
    pmSlides.style.transform = 'translateX(-' + (slideIdx * 100) + '%)';
    pmDots.querySelectorAll('.pm-dot').forEach((d, i) => d.classList.toggle('active', i === slideIdx));
  }

  function buildSlider(p) {
    var shots = (p.screenshots && p.screenshots.length) ? p.screenshots : [];
    slideCount = shots.length > 0 ? shots.length : 3;
    slideIdx = 0;
    pmSlides.innerHTML = '';
    pmDots.innerHTML = '';
    for (var i = 0; i < slideCount; i++) {
      var slide = document.createElement('div');
      slide.className = 'pm-slide';
      var scan = document.createElement('div');
      scan.className = 'sl-scan';
      if (shots.length > 0) {
        var img = document.createElement('img');
        img.src = shots[i];
        img.alt = p.name + ' screenshot ' + (i + 1);
        img.loading = 'lazy';
        slide.appendChild(img);
      } else {
        var cv = document.createElement('canvas');
        var lbl = document.createElement('div');
        lbl.className = 'sl-label';
        lbl.textContent = SLIDE_LABELS[i];
        slide.appendChild(cv); slide.appendChild(lbl);
        (function(canvas, project, si) {
          requestAnimationFrame(function() {
            if (window._drawThumb) window._drawThumb(canvas, project, si);
          });
        })(cv, p, i);
      }
      slide.appendChild(scan);
      pmSlides.appendChild(slide);
      var dot = document.createElement('button');
      dot.className = 'pm-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Slide ' + (i+1));
      (function(di){ dot.addEventListener('click', function(){ goSlide(di); }); })(i);
      pmDots.appendChild(dot);
    }
    pmSlides.style.transform = 'translateX(0)';
  }

  function openModal(p) {
    // populate details
    $('#pmId').textContent = p.id + ' / ' + window.SITE.projects.length;
    $('#pmTag').textContent = p.tag;
    $('#pmYear').textContent = p.year;
    $('#pmName').textContent = p.name;
    $('#pmDesc').textContent = p.desc || p.blurb;
    $('#pmRole').textContent = p.role || '—';
    const tech = $('#pmTech'); tech.innerHTML = '';
    (p.tech || []).forEach(function(t) { var s = document.createElement('span'); s.textContent = t; tech.appendChild(s); });
    const links = $('#pmLinks'); links.innerHTML = '';
    (p.links || []).forEach(function(l, i) {
      var a = document.createElement('a');
      a.href = l.url; a.textContent = l.label + ' ↗';
      a.className = 'pm-link' + (i === 0 ? ' primary' : '');
      a.target = '_blank'; a.rel = 'noopener';
      links.appendChild(a);
    });
    // build slider
    buildSlider(p);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  pmPrev && pmPrev.addEventListener('click', function() { goSlide(slideIdx - 1); });
  pmNext && pmNext.addEventListener('click', function() { goSlide(slideIdx + 1); });

  // keyboard slider nav when modal open
  document.addEventListener('keydown', function(e) {
    if (!modal.classList.contains('open')) { return; }
    if (e.key === 'Escape') { closeModal(); }
    if (e.key === 'ArrowLeft') { goSlide(slideIdx - 1); }
    if (e.key === 'ArrowRight') { goSlide(slideIdx + 1); }
  });

  // delegate click on project cards
  document.getElementById('projGrid').addEventListener('click', function(e) {
    const card = e.target.closest('.proj');
    if (!card) { return; }
    const idx = parseInt(card.querySelector('.pid').textContent.split('/')[0].trim(), 10) - 1;
    const p = window.SITE.projects[idx];
    if (p) { openModal(p); }
  });

  pmBackdrop && pmBackdrop.addEventListener('click', closeModal);
  pmClose && pmClose.addEventListener('click', closeModal);

  /* ---------- active nav link on scroll ---------- */
  const sections = ['about','modules','work','changelog','writing','uplink'];
  const navLinks = $$('.nav-links a');
  const secIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) { return; }
      const id = e.target.id;
      navLinks.forEach((l) => l.style.color = l.getAttribute('href') === '#' + id ? 'var(--text)' : '');
    });
  }, { threshold: 0.4 });
  sections.forEach((id) => { const s = document.getElementById(id); if (s) secIO.observe(s); });

  // expose closeMenu for anchor handler
  window.closeMenu = closeMenu;
})();
