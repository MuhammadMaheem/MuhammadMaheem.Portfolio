import { h, field, toast } from '../ui.js';
import { api } from '../api.js';
import { state, changes, pendingCount, problems, publish, discardDraft, writePreview, undo } from '../store.js';

const card = (title, ...kids) => h('section', { class: 'card' }, h('h3', {}, title), ...kids);

export function previewEditor() {
  writePreview();
  const frame = h('iframe', { class: 'preview-frame', src: '/?adm-preview=1', title: 'Site preview' });
  const size = (w) => { frame.style.width = w; };
  return h('div', { class: 'stack' },
    h('p', { class: 'hint lead' }, 'This is the real site showing your draft. Nothing is public until you publish.'),
    h('div', { class: 'bar' },
      h('button', { type: 'button', class: 'btn', onclick: () => size('100%') }, 'Desktop'),
      h('button', { type: 'button', class: 'btn', onclick: () => size('820px') }, 'Tablet'),
      h('button', { type: 'button', class: 'btn', onclick: () => size('390px') }, 'Phone'),
      h('button', { type: 'button', class: 'btn', onclick: () => { writePreview(); frame.contentWindow.location.reload(); } }, 'Refresh')),
    h('div', { class: 'frame-wrap' }, frame));
}

export function publishEditor(refresh) {
  const root = h('div', { class: 'stack' });
  const history = historyCard(refresh);
  const list = changes();
  const probs = problems();
  const msg = { v: '' };
  const msgInput = h('input', { type: 'text', placeholder: 'Update portfolio', maxlength: 100, oninput: (e) => { msg.v = e.target.value; } });
  const out = h('div', { class: 'status', 'aria-live': 'polite' });
  const imgs = pendingCount();
  const btn = h('button', { type: 'button', class: 'btn primary big', disabled: probs.length > 0 || (!list.length && !imgs), onclick: go }, 'Publish to the live site');

  async function go() {
    btn.disabled = true;
    out.replaceChildren(h('p', {}, 'Starting…'));
    try {
      const res = await publish(msg.v.trim() || 'Update portfolio from admin', (t) => { out.replaceChildren(h('p', {}, t)); });
      toast('Published. The site rebuilds in about a minute.');
      history.reload();
      watchDeploy(res.sha);
    } catch (e) {
      btn.disabled = false;
      if (e.data && e.data.code === 'changed') {
        out.replaceChildren(h('p', { class: 'err' }, e.message),
          h('p', { class: 'hint' }, 'Your draft is safe on this device. Download it first if you want a copy, then reload the latest version.'),
          h('div', { class: 'bar' },
            h('button', { type: 'button', class: 'btn', onclick: () => { const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(state.site, null, 2)], { type: 'application/json' })), download: 'portfolio-draft.json' }); document.body.appendChild(a); a.click(); a.remove(); } }, 'Download my draft'),
            h('button', { type: 'button', class: 'btn', onclick: async () => { if (confirm('Load the latest live version? Your draft on this device will be discarded.')) { await discardDraft(); refresh(); } } }, 'Reload latest and discard my draft')));
      } else {
        out.replaceChildren(h('p', { class: 'err' }, e.message));
      }
    }
  }

  function watchDeploy(sha) {
    const line = h('p', {}, 'Committed ' + sha.slice(0, 7) + '. Waiting for the build…');
    out.replaceChildren(line);
    let tries = 0;
    const tick = async () => {
      tries++;
      try {
        const s = await api.deploy(sha);
        if (s.status === 'completed') {
          line.replaceChildren(s.conclusion === 'success' ? '✓ Live. The site is updated.' : '✕ The build failed. ', s.url ? h('a', { href: s.url, target: '_blank', rel: 'noopener' }, ' See the build log') : null);
          line.className = s.conclusion === 'success' ? 'ok' : 'err';
          return;
        }
        line.textContent = s.status === 'waiting' ? 'Committed. Waiting for GitHub to start the build…' : 'Building and deploying…';
      } catch { /* the status check is optional; keep polling quietly */ }
      if (tries < 80) { setTimeout(tick, 5000); } else { line.textContent = 'Committed. Check GitHub Actions for the build status.'; }
    };
    setTimeout(tick, 3000);
  }

  root.append(
    card('What will change',
      list.length ? h('ul', { class: 'changes' }, list.map((c) => h('li', {}, c))) : h('p', { class: 'hint' }, 'No changes yet.'),
      imgs ? h('p', {}, imgs + ' new image file' + (imgs > 1 ? 's' : '') + ' will be uploaded.') : null,
      probs.length ? h('div', { class: 'warn' }, h('strong', {}, 'Fix these first:'), h('ul', {}, probs.map((p) => h('li', {}, p)))) : null),
    card('Publish',
      field('Note for the history (optional)', msgInput),
      h('div', { class: 'bar' }, btn,
        h('button', { type: 'button', class: 'btn', disabled: !state.dirty, onclick: async () => { if (confirm('Throw away all unpublished changes on this device?')) { await discardDraft(); refresh(); toast('Draft discarded.'); } } }, 'Discard my changes')),
      out),
    history);
  return root;
}

function historyCard(refresh) {
  const box = h('div', {}, h('p', { class: 'hint' }, 'Loading…'));
  const load = () => api.history().then(({ commits }) => {
    box.replaceChildren(commits.length ? h('ul', { class: 'history' }, commits.map((c, i) => h('li', {},
      h('span', { class: 'hm' }, c.message), h('span', { class: 'hd' }, new Date(c.date).toLocaleString() + ' · ' + c.sha.slice(0, 7)),
      i === 0 ? h('span', { class: 'badge' }, 'Current') : h('button', { type: 'button', class: 'btn', onclick: async () => {
        if (state.dirty && !confirm('You have unpublished changes. Restoring publishes an older version on the live site; your draft is replaced by it. Continue?')) { return; }
        if (!confirm('Publish the version from ' + new Date(c.date).toLocaleString() + ' as the live site?')) { return; }
        try { await api.restore(c.sha); await discardDraft(); refresh(); toast('Restored. The site rebuilds in about a minute.'); } catch (e) { toast(e.message, 'err'); }
      } }, 'Restore')))) : h('p', { class: 'hint' }, 'No history yet.'));
  }).catch((e) => { box.replaceChildren(h('p', { class: 'err' }, e.message)); });
  load();
  const el = card('Earlier versions', h('p', { class: 'hint' }, 'Each publish is saved. Restoring makes an older version live again, as a new entry.'), box);
  el.reload = load;
  return el;
}
