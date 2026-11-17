/* ============================================================
   ask.js — the "Ask my portfolio" panel in the hero.
   A scripted demo: no model is called. Every answer is put
   together from window.SITE (data.js) and names the section
   it came from, the way a retrieval system cites its sources.
   ============================================================ */
(function () {
  const S = window.SITE;
  const panel = document.getElementById('ask');
  if (!S || !S.ask || !panel) { return; }

  const A = S.ask;
  const log = document.getElementById('askLog');
  const chips = document.getElementById('askChips');
  const form = document.getElementById('askForm');
  const input = document.getElementById('askInput');
  const send = document.getElementById('askSend');
  const live = document.getElementById('askLive');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('askTitle').textContent = A.title;
  document.getElementById('askNote').textContent = A.note;
  document.getElementById('askFoot').textContent = A.foot;
  input.placeholder = A.placeholder;

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text != null) { n.textContent = text; }
    return n;
  };

  /* ---------- facts, read from data.js ---------- */
  const jobs = S.changelog.filter((c) => c.type ? c.type !== 'education' : /intern/i.test(c.role));
  const allInterns = jobs.every((c) => (c.type ? c.type === 'internship' : true));
  const degree = S.changelog.find((c) => c.type ? c.type === 'education' : /bachelor/i.test(c.role));
  const featured = S.projects.filter((p) => p.placement === 'flagship' && p.showcase).sort((x, y) => x.showcase.order - y.showcase.order);
  const moreCount = S.projects.length - featured.length;
  const game = featured.find((p) => p.showcase.kind === 'game');
  const resume = document.getElementById('resumeBtn');
  const sentence = (t) => (/[.!?]$/.test(t) ? t : t + '.');
  const list = (items) => (items.length < 2 ? items.join('') : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]);

  // each answer: text, the section it came from, and an optional action
  const answers = {
    build: () => ({
      text: A.build,
      sources: [['About', '#about'], ['Projects', '#work']],
    }),
    projects: () => ({
      text: 'Start with these two. ' +
        featured.map((p) => p.showcase.title + ': ' + sentence(p.showcase.pitch)).join(' ') +
        ' There are ' + moreCount + ' more below them.',
      sources: [['Projects', '#work']],
      action: ['See the projects', '#work'],
    }),
    experience: () => ({
      text: (allInterns ? 'He has completed ' + jobs.length + ' internships: ' : 'His experience: ') +
        list(jobs.map((j) => j.role + ' at ' + j.org + (j.date ? ' (' + j.date.replace(/\s*—\s*/, ' to ') + ')' : ''))) + '.',
      sources: [['Experience', '#changelog']],
      action: ['See his experience', '#changelog'],
    }),
    skills: () => ({
      text: S.modules.slice(0, 3).map((m) => m.name + ': ' + m.items.slice(0, 4).join(', ')).join('. ') + '.',
      sources: [['Skills', '#modules']],
      action: ['See all skills', '#modules'],
    }),
    education: () => ({
      text: degree ? degree.role + ' at ' + degree.org + (degree.date ? ' (' + degree.date.replace(/\s*—\s*/, ' to ') + ')' : '') + '. ' + (degree.note || '') : A.fallback,
      sources: [['Experience', '#changelog']],
    }),
    hire: () => ({
      text: 'Yes. ' + sentence(S.identity.status) + ' He is based in ' + S.identity.location + '. You can message him from the contact section.',
      sources: [['Contact', '#uplink']],
      action: ['Contact him', '#uplink'],
      resume: true,
    }),
    game: () => (game ? {
      text: sentence(game.showcase.pitch) + ' ' + game.showcase.points.map(sentence).join(' '),
      sources: [['Projects', '#work']],
      action: ['See the projects', '#work'],
    } : answers.projects()),
    fallback: () => ({ text: A.fallback, sources: [] }),
  };

  // free text is matched to an answer by keywords
  const routes = [
    [/game|inkwake|android|play/i, 'game'],
    [/hire|hiring|availab|contact|email|reach|open to|job|role|onsite|remote|relocat/i, 'hire'],
    [/project|built|portfolio|best|work on|shipped|demo|swarm|chatbot/i, 'projects'],
    [/experience|worked|work history|intern|compan|employer|job history|teyzix|psda|aabs/i, 'experience'],
    [/skill|stack|tech|tool|language|framework|python|react|next|fastapi|langchain|langgraph|rag/i, 'skills'],
    [/educat|degree|universit|study|studies|student|cgpa|semester|bachelor/i, 'education'],
    [/build|do(es)?\b|who|about|what/i, 'build'],
  ];
  function route(text) {
    for (let i = 0; i < routes.length; i++) {
      if (routes[i][0].test(text)) { return routes[i][1]; }
    }
    return 'fallback';
  }

  /* ---------- conversation ---------- */
  let busy = false;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const emit = (name) => window.dispatchEvent(new CustomEvent(name));
  const toBottom = () => { log.scrollTop = log.scrollHeight; };

  function goTo(hash) {
    const target = document.querySelector(hash);
    if (!target) { return; }
    const y = target.getBoundingClientRect().top + window.scrollY - 8;
    window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
  }

  function setBusy(on) {
    busy = on;
    send.disabled = on;
    panel.classList.toggle('is-busy', on);
    chips.querySelectorAll('button').forEach((b) => { b.disabled = on; });
  }

  async function ask(question, id, instant) {
    if (busy) { return; }
    const text = String(question).trim().slice(0, 120);
    if (!text) { return; }
    setBusy(true);
    const still = instant || reduce;

    log.appendChild(el('p', 'ask-q', text));
    const reply = el('div', 'ask-a');
    const thought = el('div', 'ask-thought');
    const step = el('span', 'ask-step', 'Reading the question');
    const clock = el('span', 'ask-clock', '0.0s');
    thought.appendChild(el('span', 'ask-lattice'));
    thought.appendChild(step);
    thought.appendChild(clock);
    reply.appendChild(thought);
    log.appendChild(reply);
    toBottom();

    const data = (answers[id || route(text)] || answers.fallback)();
    const started = performance.now();

    if (!still) {
      emit('ask:think');
      const timer = setInterval(() => { clock.textContent = ((performance.now() - started) / 1000).toFixed(1) + 's'; }, 100);
      await wait(420);
      step.textContent = 'Searching this page';
      await wait(460);
      step.textContent = 'Writing the answer';
      await wait(320);
      clearInterval(timer);
    }
    const took = still ? '' : ' in ' + ((performance.now() - started) / 1000).toFixed(1) + 's';
    thought.classList.add('done');
    step.textContent = data.sources.length
      ? 'Read ' + list(data.sources.map((s) => s[0])) + took
      : 'Nothing matched on this page';
    clock.textContent = '';

    // the answer arrives word by word, the way model output streams
    const body = el('p', 'ask-text');
    reply.appendChild(body);
    if (still) {
      body.textContent = data.text;
    } else {
      const words = data.text.split(' ');
      for (let i = 0; i < words.length; i++) {
        body.textContent += (i ? ' ' : '') + words[i];
        if (i % 3 === 0) { emit('ask:token'); }
        toBottom();
        await wait(26 + Math.random() * 30);
      }
    }

    if (data.sources.length || data.action || data.resume) {
      const row = el('div', 'ask-refs');
      data.sources.forEach((s, i) => {
        const b = el('button', 'ask-ref', s[0]);
        b.type = 'button';
        b.setAttribute('aria-label', 'Source ' + (i + 1) + ': go to ' + s[0]);
        b.addEventListener('click', () => goTo(s[1]));
        row.appendChild(b);
      });
      if (data.action) {
        const b = el('button', 'ask-act', data.action[0]);
        b.type = 'button';
        b.addEventListener('click', () => goTo(data.action[1]));
        row.appendChild(b);
      }
      if (data.resume && resume) {
        const a = el('a', 'ask-act', 'Download résumé');
        a.href = resume.getAttribute('href');
        a.setAttribute('download', '');
        row.appendChild(a);
      }
      reply.appendChild(row);
    }
    if (live) { live.textContent = data.text; }
    toBottom();
    setBusy(false);
  }

  /* ---------- controls ---------- */
  A.questions.forEach((item) => {
    const b = el('button', 'ask-chip', item.q);
    b.type = 'button';
    b.addEventListener('click', () => {
      b.classList.add('used');
      ask(item.q, item.id);
    });
    chips.appendChild(b);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (busy || !input.value.trim()) { return; }
    const text = input.value;
    input.value = '';
    ask(text);
  });

  // one question plays by itself on load, unless the visitor got there first
  // or has asked for reduced motion
  let touched = false;
  ['pointerdown', 'keydown', 'focusin'].forEach((name) => {
    panel.addEventListener(name, () => { touched = true; }, { once: true });
  });
  const first = A.questions[0];
  if (first) {
    if (reduce) {
      ask(first.q, first.id, true);
    } else {
      setTimeout(() => {
        if (touched || busy || window.scrollY > window.innerHeight * 0.5) { return; }
        const firstChip = chips.querySelector('button');
        if (firstChip) { firstChip.classList.add('used'); }
        ask(first.q, first.id);
      }, 1500);
    }
  }
})();
