/* ============================================================
   render.js — populate the page from window.SITE (data.js)
   ============================================================ */
(function () {
  const S = window.SITE;
  if (!S) { return; }
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

  // ---- safety helpers: everything the admin or an import writes is plain text ----
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // only http(s), mailto and tel links (and site-relative paths) are allowed
  const safeUrl = (u) => {
    const v = String(u == null ? '' : u).trim();
    if (!v) { return ''; }
    if (/^(https?:|mailto:|tel:)/i.test(v)) { return v; }
    if (/^[a-z][a-z0-9+.-]*:/i.test(v) || v.startsWith('//')) { return ''; }
    return v;
  };
  // headings: a line break is "\n", emphasis is *word*
  const rich = (t) => esc(t).replace(/\n/g, '<br />').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmtDate = (d) => {
    const m = String(d || '').match(/^(\d{4})(?:-(\d{2}))?$/);
    if (!m) { return String(d || ''); }
    return m[2] ? MON[Math.max(0, Math.min(11, +m[2] - 1))] + ' ' + m[1] : m[1];
  };
  const fmtRange = (start, end, present) => {
    const a = fmtDate(start);
    const b = present ? 'Present' : fmtDate(end);
    return a && b ? a + ' — ' + b : (a || b);
  };
  window._fmtRange = fmtRange;
  window._safeUrl = safeUrl;

  // hidden projects are dropped; ids follow the order so cards and the modal stay in step
  S.projects = S.projects.filter((p) => p.visible !== false);
  S.projects.forEach((p, i) => { p.id = String(i + 1).padStart(2, '0'); });
  const exp = (S.changelog || []).slice();
  const expById = {};
  exp.forEach((c) => { if (c.id) { expById[c.id] = c; } });
  window._expById = expById;

  // ---- section headings, nav labels, visibility ----
  const SEC = S.sections || {};
  const SEC_ORDER = [['about', 'about'], ['skills', 'modules'], ['projects', 'work'], ['experience', 'changelog'], ['writing', 'writing'], ['contact', 'uplink']];
  // a writing section with no linked posts is hidden rather than showing links to nowhere
  const posts = (S.writing || []).filter((w) => safeUrl(w.url));
  if (!posts.length && SEC.writing) { SEC.writing.visible = false; }
  let secNo = 0;
  SEC_ORDER.forEach(([key, id]) => {
    const node = document.getElementById(id);
    const cfg = SEC[key];
    if (!node || !cfg) { if (node) { secNo++; } return; }
    if (cfg.visible === false && /^(skills|experience|writing)$/.test(key)) {
      node.remove();
      document.querySelectorAll('a[href="#' + id + '"]').forEach((a) => a.remove());
      return;
    }
    secNo++;
    document.querySelectorAll('.nav-links a[href="#' + id + '"], .mobile-menu a[href="#' + id + '"]').forEach((a) => { a.textContent = cfg.nav || cfg.eyebrow || a.textContent; });
    const eb = node.querySelector('.eyebrow');
    if (eb && cfg.eyebrow) { eb.innerHTML = '<span class="section-index">' + String(secNo).padStart(2, '0') + '</span> &nbsp;' + esc(cfg.eyebrow); }
    const h = node.querySelector('h2');
    if (h && cfg.title) { h.innerHTML = rich(cfg.title); }
    let sub = node.querySelector('.sub');
    if (cfg.sub) {
      if (!sub) { sub = el('p', 'sub'); h.parentNode.appendChild(sub); }
      sub.textContent = cfg.sub;
    } else if (sub) { sub.remove(); }
  });

  // ---- hero ----
  $('heroTagline').textContent = S.identity.tagline;
  $('heroRole').textContent = S.identity.role;
  const rLoc = $('rLoc'); if (rLoc) rLoc.textContent = S.identity.location;
  const rUnit = $('rUnit'); if (rUnit) rUnit.textContent = S.identity.codename || 'MHM·01';

  // metrics (removed from hero — skip if container absent)
  const mWrap = $('metrics');
  if (mWrap) {
    S.metrics.forEach((m) => {
      const c = el('div', 'metric');
      c.innerHTML = '<div class="num" data-val="' + m.value + '" data-suffix="' + m.suffix + '">0' + m.suffix + '</div><div class="lbl">' + m.label + '</div>';
      mWrap.appendChild(c);
    });
  }

  // ---- about ----
  const ac = $('aboutCopy');
  S.identity.bio.forEach((p, i) => {
    if (i > 0) ac.appendChild(el('div', 'bio-sep'));
    ac.appendChild(el('p', null, esc(p)));
  });
  if (S.identity.quote) {
    const q = el('blockquote', 'bio-quote');
    q.innerHTML = '<span class="bq-mark">"</span><span class="bq-text">' + esc(S.identity.quote.text) + '</span><cite class="bq-by">— ' + esc(S.identity.quote.by) + '</cite>';
    ac.appendChild(q);
  }
  const sl = $('specList');
  S.identity.specs.forEach((s) => {
    const r = el('div', 'row');
    r.innerHTML = '<span class="k">' + esc(s.k) + '</span><span class="v">' + esc(s.v) + '</span>';
    sl.appendChild(r);
  });

  // ---- flow diagram ----
  if (S.flow && $('flowSteps')) {
    $('flowLabel').textContent = S.flow.label;
    $('flowTitle').textContent = S.flow.title;
    $('flowSub').textContent = S.flow.sub;
    S.flow.steps.forEach((st, i) => {
      const li = el('li', 'flow-step');
      li.appendChild(el('span', 'flow-num', String(i + 1)));
      const h = el('h3'); h.textContent = st.t; li.appendChild(h);
      const p = el('p'); p.textContent = st.d; li.appendChild(p);
      $('flowSteps').appendChild(li);
    });
  }

  // ---- modules ----
  const mg = $('moduleGrid');
  (mg ? S.modules : []).forEach((mod, i) => {
    const c = el('div', 'module reveal');
    c.style.transitionDelay = (i * 40) + 'ms';
    c.innerHTML = '<h3><span class="mi">0' + (i+1) + '</span>' + esc(mod.name) + '</h3><div class="mblurb">' + esc(mod.blurb) + '</div><ul class="tags">' + mod.items.map((t) => '<li>' + esc(t) + '</li>').join('') + '</ul>';
    c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
    mg.appendChild(c);
  });

  // ---- tech strip under the hero ----
  const strip = $('stripTrack');
  if (strip && S.marquee) {
    // two identical halves so the loop is seamless
    const half = S.marquee.map((t) => '<span class="strip-item">' + esc(t) + '</span>').join('');
    strip.innerHTML = '<div class="strip-half">' + half + '</div><div class="strip-half" aria-hidden="true">' + half + '</div>';
  }

  // ---- featured showcase (large panels above the grid) ----
  const isFlagship = (p) => p.placement === 'flagship' && p.showcase;
  const showcased = S.projects.filter(isFlagship).sort((x, y) => x.showcase.order - y.showcase.order);
  // featured cards come first in the grid; the sort is stable, so each group keeps its own order
  const gridProjects = S.projects.filter((p) => !isFlagship(p))
    .sort((a, b) => (b.placement === 'featured') - (a.placement === 'featured'));
  const sw = $('showcase');
  if (sw) {
    showcased.forEach((p, i) => {
      const sc = p.showcase;
      const c = el('article', 'show reveal show--' + sc.kind);
      c.setAttribute('data-cursor', 'view');
      let media = '';
      if (sc.kind === 'game') {
        media =
          '<img class="show-banner" src="' + esc(sc.banner) + '" alt="' + esc(sc.title) + ' cover art" loading="lazy">' +
          '<div class="phones">' +
          sc.shots.map((src, k) => '<div class="phone phone-' + (k + 1) + '"><img src="' + esc(src) + '" alt="' + esc(sc.title) + ' gameplay screen ' + (k + 1) + '" loading="lazy"></div>').join('') +
          '</div>';
      } else {
        media = sc.shots.slice(0, 2).reverse().map((src, k, arr) =>
          '<div class="browser browser-' + (arr.length - k) + '"><div class="bbar"><i></i><i></i><i></i></div>' +
          '<img src="' + esc(src) + '" alt="' + esc(sc.title) + ' screen" loading="lazy"></div>').join('');
      }
      const source = (p.links || []).find((l) => /github/i.test(l.label));
      const store = (p.links || []).find((l) => /google play/i.test(l.label));
      c.innerHTML =
        '<div class="show-media"><div class="show-stage">' + media + '</div></div>' +
        '<div class="show-body">' +
          '<span class="show-kicker"><b>0' + (i + 1) + '</b> Featured · ' + esc(sc.kicker) + '</span>' +
          '<h3>' + esc(sc.title) + '</h3>' +
          '<p class="show-pitch">' + esc(sc.pitch) + '</p>' +
          '<ul class="show-points">' + sc.points.map((t) => '<li>' + esc(t) + '</li>').join('') + '</ul>' +
          '<div class="show-tech">' + p.tech.slice(0, 6).map((t) => '<span>' + esc(t) + '</span>').join('') + '</div>' +
          (p.company && expById[p.company] ? '<div class="built-at">Built during ' + esc(expById[p.company].role) + ' at ' + esc(expById[p.company].org) + '</div>' : '') +
          '<div class="show-cta">' +
            '<button type="button" class="btn btn-primary show-open">View project <span class="arrow">→</span></button>' +
            (store && safeUrl(store.url) ? '<a class="btn btn-ghost" href="' + esc(safeUrl(store.url)) + '" target="_blank" rel="noopener">Get it on Google Play ↗</a>' : '') +
            (source && safeUrl(source.url) ? '<a class="btn btn-ghost" href="' + esc(safeUrl(source.url)) + '" target="_blank" rel="noopener">Source code ↗</a>' : '') +
          '</div>' +
        '</div>';
      c.addEventListener('click', (e) => {
        if (e.target.closest('a')) { return; }
        if (window._openProject) { window._openProject(p); }
      });
      sw.appendChild(c);
    });
  }

  // ---- projects + filters ----
  const tags = ['All', ...Array.from(new Set(gridProjects.map((p) => p.tag)))];
  const pf = $('projFilters');
  tags.forEach((t, i) => {
    const b = el('button', 'filter' + (i === 0 ? ' active' : ''), esc(t));
    b.dataset.tag = t;
    b.setAttribute('data-cursor', 'filter');
    pf.appendChild(b);
  });

  // accent palette per tag for canvas thumbnails
  const TAG_HUE = {
    'LLM Eval':'#00d4ff', RAG:'#54B7FF', NLP:'#34d399', Vision:'#FF6A2B',
    RL:'#a78bfa', ML:'#fbbf24', Web:'#60a5fa', FinTech:'#4ade80',
    Health:'#f472b6', LegalTech:'#f5a623', 'HR Tech':'#2dd4bf'
  };

  function drawThumb(canvas, project, slideIdx) {
    if (!canvas) return;
    const W = canvas.width = canvas.offsetWidth || 400;
    const H = canvas.height = canvas.offsetHeight || 200;
    const ctx = canvas.getContext('2d');
    const accent = TAG_HUE[project.tag] || '#C6FF3A';
    const dark = document.documentElement.getAttribute('data-theme') !== 'light';
    const bg = dark ? '#0a0c11' : '#eceae1';
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    // gradient wash
    const g = ctx.createRadialGradient(W*.75,H*.1,0,W*.75,H*.1,W*.9);
    g.addColorStop(0, accent+'44'); g.addColorStop(1,'transparent');
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    // grid
    ctx.strokeStyle = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    for (var x=0;x<W;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for (var y=0;y<H;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    var tc = dark ? 'rgba(255,255,255,' : 'rgba(0,0,0,';
    var pid = parseFloat(project.id);

    if (slideIdx % 3 === 0) {
      // bar chart
      var bars=8, bw=(W-80)/bars-8;
      for(var i=0;i<bars;i++){
        var bh=(0.25+Math.sin(i*1.3+pid)*0.35+0.35)*(H-60);
        var bx=40+i*((W-80)/bars);
        ctx.fillStyle = i===3 ? accent : accent+'55';
        ctx.beginPath();
        if(ctx.roundRect) ctx.roundRect(bx,H-30-bh,bw,bh,3);
        else ctx.rect(bx,H-30-bh,bw,bh);
        ctx.fill();
      }
      ctx.fillStyle=tc+'0.45)'; ctx.font='10px monospace';
      ctx.fillText(project.name.toUpperCase()+' — METRICS',20,20);
    } else if (slideIdx % 3 === 1) {
      // line graph
      var pts=10;
      ctx.beginPath();
      for(var i=0;i<pts;i++){
        var lx=30+(i/(pts-1))*(W-60);
        var ly=H/2+Math.sin(i*.8+pid)*(H*.28)-10;
        i===0?ctx.moveTo(lx,ly):ctx.lineTo(lx,ly);
      }
      ctx.strokeStyle=accent; ctx.lineWidth=2.5; ctx.stroke();
      ctx.lineTo(W-30,H-20); ctx.lineTo(30,H-20); ctx.closePath();
      var af=ctx.createLinearGradient(0,0,0,H);
      af.addColorStop(0,accent+'44'); af.addColorStop(1,accent+'00');
      ctx.fillStyle=af; ctx.fill();
      for(var i=0;i<pts;i++){
        var dx=30+(i/(pts-1))*(W-60);
        var dy=H/2+Math.sin(i*.8+pid)*(H*.28)-10;
        ctx.beginPath(); ctx.arc(dx,dy,4,0,Math.PI*2);
        ctx.fillStyle=accent; ctx.fill();
      }
      ctx.fillStyle=tc+'0.45)'; ctx.font='10px monospace';
      ctx.fillText('PERFORMANCE — '+project.year,20,20);
    } else {
      // terminal
      var lines=['> '+project.name.toLowerCase()+'.init()','  ✔ pipeline loaded ('+project.tech[0]+')','  ✔ model endpoint ready','  → processing batch...','  [================] 100%','> output: 200 OK'];
      ctx.font='11px monospace';
      for(var i=0;i<lines.length;i++){
        var ln=lines[i];
        ctx.fillStyle=ln.startsWith('>') ? accent : ln.includes('✔') ? '#4ade80' : tc+'0.6)';
        ctx.fillText(ln,24,36+i*22);
      }
      ctx.fillStyle=accent; ctx.fillRect(24,36+lines.length*22,7,12);
    }
  }

  const pg = $('projGrid');
  gridProjects.forEach((p) => {
    const c = el('article', 'proj reveal' + (p.placement === 'featured' ? ' featured' : ''));
    c.dataset.tag = p.tag;
    c.setAttribute('data-cursor', 'view');
    const hasShots = p.screenshots && p.screenshots.length > 0;
    const thumbContent = hasShots
      ? '<img src="' + esc(p.screenshots[0]) + '" alt="' + esc(p.name) + '" loading="lazy">'
      : '<canvas></canvas>';
    c.innerHTML =
      '<div class="thumb">' + thumbContent + '<div class="thumb-scan"></div></div>' +
      '<div class="proj-content">' +
        '<div class="proj-top"><span class="pid">' + p.id + ' / ' + S.projects.length + '</span><span class="ptag">' + esc(p.tag) + '</span></div>' +
        '<h3>' + esc(p.name) + '</h3>' +
        '<p class="pblurb">' + esc(p.blurb) + '</p>' +
        (p.company && expById[p.company] ? '<div class="built-at">Built during ' + esc(expById[p.company].role) + ' at ' + esc(expById[p.company].org) + '</div>' : '') +
        '<div class="ptech">' + p.tech.map((t) => '<span>' + esc(t) + '</span>').join('') + '</div>' +
        '<a class="go" href="#" aria-label="Open ' + esc(p.name) + '">&#8599;</a>' +
      '</div>';
    pg.appendChild(c);
    if (!hasShots) {
      requestAnimationFrame(() => {
        const cv = c.querySelector('canvas');
        if (cv) drawThumb(cv, p, 0);
      });
    }
  });
  window._drawThumb = drawThumb;

  // show the first six, the rest behind a "show all" button
  const FIRST = 6;
  const more = $('projMore');
  let expanded = gridProjects.length <= FIRST;
  function syncCollapse(tag) {
    const collapse = !expanded && tag === 'All';
    pg.classList.toggle('collapsed', collapse);
    if (more) { more.style.display = (tag === 'All' && gridProjects.length > FIRST) ? '' : 'none'; }
    const mb = more && more.querySelector('button');
    if (mb) {
      mb.innerHTML = expanded ? 'Show fewer <span class="arrow">↑</span>' : 'Show all ' + gridProjects.length + ' projects <span class="arrow">↓</span>';
      mb.setAttribute('aria-expanded', String(expanded));
    }
  }
  if (more && gridProjects.length > FIRST) {
    const mb = el('button', 'btn btn-ghost');
    mb.type = 'button';
    more.appendChild(mb);
    mb.addEventListener('click', () => {
      expanded = !expanded;
      syncCollapse('All');
      if (expanded && window.anime) {
        anime({ targets: pg.querySelectorAll('.proj:nth-child(n+' + (FIRST + 1) + ')'), opacity: [0, 1], translateY: [16, 0], delay: anime.stagger(45), duration: 520, easing: 'easeOutQuad' });
      }
      if (!expanded) { $('work').querySelector('.more-head').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  }
  syncCollapse('All');
  const mc = $('moreCount');
  if (mc) { mc.textContent = gridProjects.length + ' builds'; }

  // filter behaviour
  pf.addEventListener('click', (e) => {
    const b = e.target.closest('.filter');
    if (!b) { return; }
    pf.querySelectorAll('.filter').forEach((f) => f.classList.remove('active'));
    b.classList.add('active');
    const tag = b.dataset.tag;
    syncCollapse(tag);
    pg.querySelectorAll('.proj').forEach((card) => {
      const show = tag === 'All' || card.dataset.tag === tag;
      card.classList.toggle('hide', !show);
    });
    if (window.anime) {
      anime({ targets: pg.querySelectorAll('.proj:not(.hide)'), opacity: [0.2, 1], translateY: [12, 0], delay: anime.stagger(40), duration: 500, easing: 'easeOutQuad' });
    }
  });

  // ---- timeline ----
  const tl = $('timeline');
  if (tl) {
    const total = exp.length;
    exp.forEach((c, i) => {
      const item = el('div', 'tl-item reveal');
      item.style.transitionDelay = (i * 60) + 'ms';
      const when = c.start || c.end || c.present ? fmtRange(c.start, c.end, c.present) : (c.date || '');
      const ver = c.v || 'v' + (total - 1 - i) + '.x';
      let body = '';
      if (c.format === 'bullets' && Array.isArray(c.bullets) && c.bullets.length) {
        body = '<ul class="tl-bullets">' + c.bullets.filter(Boolean).map((b) => '<li>' + esc(b) + '</li>').join('') + '</ul>';
      } else if (c.note) {
        body = '<p>' + esc(c.note) + '</p>';
      }
      const built = S.projects.filter((p) => p.company && p.company === c.id);
      if (built.length) {
        body += '<div class="tl-built"><span>Built here</span>' + built.map((p) => '<button type="button" class="tl-proj" data-idx="' + (+p.id - 1) + '">' + esc(p.name) + '</button>').join('') + '</div>';
      }
      const org = c.url && safeUrl(c.url) ? '<a href="' + esc(safeUrl(c.url)) + '" target="_blank" rel="noopener">' + esc(c.org) + '</a>' : esc(c.org);
      item.innerHTML =
        '<span class="node"></span>' +
        '<span class="ver">' + esc(ver) + '</span><span class="when">' + esc(when) + '</span>' +
        '<h3>' + esc(c.role) + ' <span class="org">· ' + org + '</span></h3>' + body;
      tl.appendChild(item);
    });
    tl.addEventListener('click', (e) => {
      const b = e.target.closest ? e.target.closest('.tl-proj') : null;
      const pr = b ? S.projects[+b.dataset.idx] : null;
      if (pr && window._openProject) { window._openProject(pr); }
    });
  }

  // ---- writing (only posts that link somewhere) ----
  const pl = $('postList');
  if (pl) {
    posts.forEach((w) => {
      const a = el('a', 'post reveal');
      a.href = safeUrl(w.url);
      a.target = '_blank';
      a.rel = 'noopener';
      a.setAttribute('data-cursor', 'read');
      a.innerHTML =
        '<div class="pmeta"><span class="ptag2">' + esc(w.tag) + '</span>' + esc(w.date) + '</div>' +
        '<div><h3>' + esc(w.title) + '</h3><p class="pex">' + esc(w.excerpt) + '</p></div>' +
        '<div class="read">' + esc(w.read) + ' →</div>';
      pl.appendChild(a);
    });
  }

  // ---- socials ----
  const sc = $('socials');
  if (sc) {
    S.socials.forEach((s) => {
      const url = safeUrl(s.url);
      if (!url) { return; }
      const a = el('a', 'social');
      a.href = url;
      a.setAttribute('data-cursor', 'open');
      a.innerHTML = '<span>' + esc(s.label) + '</span><span class="h">' + esc(s.handle) + '</span>';
      sc.appendChild(a);
    });
  }

  // a new resume upload changes this value, so browsers never serve the old PDF
  if (S.identity.resumeVersion) {
    document.querySelectorAll('.resume-btn').forEach((a) => { a.setAttribute('href', './Muhammad-Maheem-Resume.pdf?v=' + encodeURIComponent(S.identity.resumeVersion)); });
  }

  $('year').textContent = new Date().getFullYear();
})();
