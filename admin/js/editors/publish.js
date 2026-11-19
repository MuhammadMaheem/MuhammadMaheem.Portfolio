import { h, field, toast, confirmDialog, skeleton } from '../ui.js';
import { api } from '../api.js';
import { state, changes, pendingCount, problems, publish, discardDraft } from '../store.js';
import { icon } from '../preview.js';

const card = (title, ...kids) => h('section', { class: 'card' }, h('h3', {}, title), ...kids);
const KIND = { Added: 'add', Removed: 'del', Edited: 'edit', Changed: 'edit' };

function changeList(list) {
  return h('ul', { class: 'changes' }, list.map((c) => {
    const m = c.match(/^(Added|Removed|Edited|Changed)\s+([^:]+):\s*(.*)$/);
    if (m && m[2] === 'order') { return h('li', {}, h('span', { class: 'chg edit' }, 'Reordered'), h('span', { class: 'cw' }, 'The order of your ' + m[3] + ' changed')); }
    return m
      ? h('li', {}, h('span', { class: 'chg ' + KIND[m[1]] }, m[1]), h('span', { class: 'cw' }, ['project', 'experience', 'certification'].includes(m[2]) ? m[3] : m[3] + ' (' + m[2] + ')'), h('span', { class: 'ck' }, m[2]))
      : h('li', {}, h('span', { class: 'chg edit' }, 'Changed'), h('span', { class: 'cw' }, c.replace(/^Changed:\s*/, '')));
  }));
}

// upload → commit → build → live, as a stepper that fills in as the publish proceeds
function stepper(hasImages) {
  const defs = [...(hasImages ? [['upload', 'Upload images']] : []), ['commit', 'Save to GitHub'], ['build', 'Build the site'], ['live', 'Live']];
  const els = defs.map(([k, label], i) => h('li', { class: 'step', dataset: { k } }, h('span', { class: 'sd' }, String(i + 1)), h('span', { class: 'sl' }, label)));
  const root = h('ol', { class: 'stepper', 'aria-label': 'Publish progress' }, els);
  const set = (key, state, label) => {
    const i = defs.findIndex((d) => d[0] === key);
    els.forEach((e, j) => { if (j < i && !e.classList.contains('fail')) { e.classList.remove('active'); e.classList.add('done'); e.querySelector('.sd').replaceChildren(icon('check', 14)); } });
    const e = els[i]; if (!e) { return; }
    e.classList.remove('active', 'done', 'fail'); e.classList.add(state);
    e.querySelector('.sd').replaceChildren(state === 'done' ? icon('check', 14) : state === 'fail' ? '!' : String(i + 1));
    if (label) { e.querySelector('.sl').textContent = label; }
  };
  return { root, set };
}

export function publishEditor(refresh) {
  const root = h('div', { class: 'stack' });
  const history = historyCard(refresh);
  const list = changes();
  const probs = problems();
  const imgs = pendingCount();
  const msg = { v: '' };
  const msgInput = h('input', { type: 'text', placeholder: 'Update portfolio', maxlength: 100, oninput: (e) => { msg.v = e.target.value; } });
  const out = h('div', { class: 'status', 'aria-live': 'polite' });
  const btn = h('button', { type: 'button', class: 'btn primary big', disabled: probs.length > 0 || (!list.length && !imgs), onclick: go }, icon('rocket', 18), 'Publish to the live site');
  const discard = h('button', { type: 'button', class: 'btn ghost', disabled: !state.dirty, onclick: async () => {
    const ok = await confirmDialog({ title: 'Discard all unpublished changes?', message: 'Everything you changed since the last publish will be lost on this device.', confirmLabel: 'Discard changes', danger: true });
    if (ok) { await discardDraft(); refresh(); toast('Draft discarded.'); }
  } }, 'Discard my changes');

  async function go() {
    btn.disabled = true; discard.disabled = true;
    const st = stepper(imgs > 0);
    out.replaceChildren(st.root);
    if (imgs) { st.set('upload', 'active'); } else { st.set('commit', 'active'); }
    try {
      const res = await publish(msg.v.trim() || 'Update portfolio from admin', (p) => {
        if (p.phase === 'upload') { st.set('upload', 'active', 'Uploading images ' + p.n + ' of ' + p.total); }
        if (p.phase === 'commit') { if (imgs) { st.set('upload', 'done', 'Images uploaded'); } st.set('commit', 'active'); }
      });
      st.set('commit', 'done', 'Saved to GitHub (' + res.sha.slice(0, 7) + ')');
      history.reload();
      watchDeploy(res.sha, st);
    } catch (e) {
      btn.disabled = false; discard.disabled = !state.dirty;
      st.set(imgs ? 'upload' : 'commit', 'fail');
      if (e.data && e.data.code === 'changed') {
        out.replaceChildren(h('div', { class: 'warn' }, h('p', {}, h('strong', {}, 'The site changed somewhere else. '), e.message),
          h('p', { class: 'hint' }, 'Your draft is safe on this device. Download it first if you want a copy, then reload the latest version.'),
          h('div', { class: 'bar' },
            h('button', { type: 'button', class: 'btn', onclick: () => { const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(state.site, null, 2)], { type: 'application/json' })), download: 'portfolio-draft.json' }); document.body.appendChild(a); a.click(); a.remove(); } }, 'Download my draft'),
            h('button', { type: 'button', class: 'btn', onclick: async () => {
              const ok = await confirmDialog({ title: 'Load the latest live version?', message: 'Your draft on this device will be discarded.', confirmLabel: 'Load latest', danger: true });
              if (ok) { await discardDraft(); refresh(); }
            } }, 'Reload latest and discard my draft'))));
      } else {
        out.replaceChildren(st.root, h('p', { class: 'err' }, e.message));
      }
    }
  }

  function watchDeploy(sha, st) {
    st.set('build', 'active', 'Waiting for GitHub to start the build…');
    let tries = 0;
    const finish = (ok, url) => {
      if (ok) {
        st.set('build', 'done', 'Site built');
        st.set('live', 'done', 'Live');
        out.appendChild(h('div', { class: 'success' },
          h('div', { class: 'burst', 'aria-hidden': 'true' }, icon('check', 26)),
          h('div', {}, h('strong', {}, 'Published.'), h('p', { class: 'hint' }, 'Your changes are on the live site. It can take a few seconds for caches to refresh.')),
          h('a', { class: 'btn', href: siteHref(), target: '_blank', rel: 'noopener' }, icon('external', 16), 'Open the live site')));
        toast('Live. Your site is updated.');
      } else {
        st.set('build', 'fail', 'The build failed');
        out.appendChild(h('p', { class: 'err' }, 'The build failed. ', url ? h('a', { href: url, target: '_blank', rel: 'noopener' }, 'See the build log') : null));
      }
    };
    const tick = async () => {
      tries++;
      try {
        const s = await api.deploy(sha);
        if (s.status === 'completed') { finish(s.conclusion === 'success', s.url); return; }
        st.set('build', 'active', s.status === 'waiting' ? 'Waiting for GitHub to start the build…' : 'Building and deploying…');
      } catch { /* the status check is optional; keep polling quietly */ }
      if (tries < 80) { setTimeout(tick, 4000); } else { st.set('build', 'active', 'Still building. Check GitHub Actions for the status.'); }
    };
    setTimeout(tick, 2500);
  }

  root.append(
    card('What will change',
      list.length ? changeList(list) : h('p', { class: 'empty' }, 'No changes yet. Edit something, then come back here.'),
      imgs ? h('p', { class: 'hint img-note' }, icon('image', 15), imgs + ' new image file' + (imgs > 1 ? 's' : '') + ' will be uploaded.') : null,
      probs.length ? h('div', { class: 'warn' }, h('strong', {}, 'Fix these first:'), h('ul', {}, probs.map((p) => h('li', {}, p)))) : null),
    card('Publish',
      field('Note for the history (optional)', msgInput),
      h('div', { class: 'bar' }, btn, discard),
      out),
    history);
  return root;
}

const siteHref = () => (state.session ? 'https://' + state.session.owner.toLowerCase() + '.github.io/' + state.session.repo + '/' : '/');

function historyCard(refresh) {
  const box = h('div', {}, skeleton(3));
  const load = () => api.history().then(({ commits }) => {
    box.replaceChildren(commits.length ? h('ul', { class: 'history' }, commits.map((c, i) => h('li', {},
      h('span', { class: 'hm' }, c.message), h('span', { class: 'hd' }, new Date(c.date).toLocaleString() + ' · ' + c.sha.slice(0, 7)),
      i === 0 ? h('span', { class: 'badge flagship' }, 'Current') : h('button', { type: 'button', class: 'btn', onclick: async () => {
        const ok = await confirmDialog({
          title: 'Make this version live?',
          message: 'The version from ' + new Date(c.date).toLocaleString() + ' will be published as a new entry.' + (state.dirty ? ' Your unpublished changes on this device will be replaced.' : ''),
          confirmLabel: 'Restore this version', danger: !!state.dirty,
        });
        if (!ok) { return; }
        try { await api.restore(c.sha); await discardDraft(); refresh(); toast('Restored. The site rebuilds in about a minute.'); } catch (e) { toast(e.message, 'err'); }
      } }, 'Restore')))) : h('p', { class: 'empty' }, 'No history yet.'));
  }).catch((e) => { box.replaceChildren(h('p', { class: 'err' }, e.message)); });
  load();
  const el = card('Earlier versions', h('p', { class: 'hint' }, 'Each publish is saved. Restoring makes an older version live again, as a new entry.'), box);
  el.reload = () => { box.replaceChildren(skeleton(3)); load(); };
  return el;
}
