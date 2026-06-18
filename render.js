/* ============================================================
   render.js — populate the page from window.SITE (data.js)
   ============================================================ */
(function () {
  const S = window.SITE;
  if (!S) { return; }
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

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
    ac.appendChild(el('p', null, p));
  });
  if (S.identity.quote) {
    const q = el('blockquote', 'bio-quote');
    q.innerHTML = '<span class="bq-mark">"</span><span class="bq-text">' + S.identity.quote.text + '</span><cite class="bq-by">— ' + S.identity.quote.by + '</cite>';
    ac.appendChild(q);
  }
  const sl = $('specList');
  S.identity.specs.forEach((s) => {
    const r = el('div', 'row');
    r.innerHTML = '<span class="k">' + s.k + '</span><span class="v">' + s.v + '</span>';
    sl.appendChild(r);
  });

  // ---- modules ----
  const mg = $('moduleGrid');
  S.modules.forEach((mod, i) => {
    const c = el('div', 'module reveal');
    c.style.transitionDelay = (i * 40) + 'ms';
    c.innerHTML = '<h3><span class="mi">0' + (i+1) + '</span>' + mod.name + '</h3><div class="mblurb">' + mod.blurb + '</div><ul class="tags">' + mod.items.map((t) => '<li>' + t + '</li>').join('') + '</ul>';
    c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
    mg.appendChild(c);
  });

  // ---- projects + filters ----
  const tags = ['All', ...Array.from(new Set(S.projects.map((p) => p.tag)))];
  const pf = $('projFilters');
  tags.forEach((t, i) => {
    const b = el('button', 'filter' + (i === 0 ? ' active' : ''), t);
    b.dataset.tag = t;
    b.setAttribute('data-cursor', 'filter');
    pf.appendChild(b);
  });

  // accent palette per tag for canvas thumbnails
  const TAG_HUE = {
    'LLM Eval':'#C6FF3A', RAG:'#54B7FF', NLP:'#34d399', Vision:'#FF6A2B',
    RL:'#a78bfa', ML:'#fbbf24', Web:'#60a5fa', FinTech:'#4ade80',
    Health:'#f472b6'
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
  S.projects.forEach((p) => {
    const c = el('article', 'proj reveal' + (p.featured ? ' featured' : ''));
    c.dataset.tag = p.tag;
    c.setAttribute('data-cursor', 'view');
    const hasShots = p.screenshots && p.screenshots.length > 0;
    const thumbContent = hasShots
      ? '<img src="' + p.screenshots[0] + '" alt="' + p.name + '" loading="lazy">'
      : '<canvas></canvas>';
    c.innerHTML =
      '<div class="thumb">' + thumbContent + '<div class="thumb-scan"></div></div>' +
      '<div class="proj-content">' +
        '<div class="proj-top"><span class="pid">' + p.id + ' / ' + S.projects.length + '</span><span class="ptag">' + p.tag + '</span></div>' +
        '<h3>' + p.name + '</h3>' +
        '<p class="pblurb">' + p.blurb + '</p>' +
        '<div class="ptech">' + p.tech.map((t) => '<span>' + t + '</span>').join('') + '</div>' +
        '<a class="go" href="#" aria-label="Open ' + p.name + '">&#8599;</a>' +
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

  // filter behaviour
  pf.addEventListener('click', (e) => {
    const b = e.target.closest('.filter');
    if (!b) { return; }
    pf.querySelectorAll('.filter').forEach((f) => f.classList.remove('active'));
    b.classList.add('active');
    const tag = b.dataset.tag;
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
  S.changelog.forEach((c, i) => {
    const item = el('div', 'tl-item reveal');
    item.style.transitionDelay = (i * 60) + 'ms';
    item.innerHTML =
      '<span class="node"></span>' +
      '<span class="ver">' + c.v + '</span><span class="when">' + c.date + '</span>' +
      '<h3>' + c.role + ' <span class="org">· ' + c.org + '</span></h3>' +
      '<p>' + c.note + '</p>';
    tl.appendChild(item);
  });

  // ---- writing ----
  const pl = $('postList');
  S.writing.forEach((w) => {
    const a = el('a', 'post reveal');
    a.href = '#';
    a.setAttribute('data-cursor', 'read');
    a.innerHTML =
      '<div class="pmeta"><span class="ptag2">' + w.tag + '</span>' + w.date + '</div>' +
      '<div><h3>' + w.title + '</h3><p class="pex">' + w.excerpt + '</p></div>' +
      '<div class="read">' + w.read + ' →</div>';
    pl.appendChild(a);
  });

  // ---- socials ----
  const sc = $('socials');
  S.socials.forEach((s) => {
    const a = el('a', 'social');
    a.href = s.url;
    a.setAttribute('data-cursor', 'open');
    a.innerHTML = '<span>' + s.label + '</span><span class="h">' + s.handle + '</span>';
    sc.appendChild(a);
  });

  $('year').textContent = new Date().getFullYear();
})();
