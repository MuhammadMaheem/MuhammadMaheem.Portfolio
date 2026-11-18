import { h, field, modal, toast, skeleton } from '../ui.js';
import { api } from '../api.js';
import { state, touch } from '../store.js';
import { newProject, repoNameFromInput } from '../schema.js';

const prettyName = (r) => r.replace(/[-_.]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim();

// best guess at a filter category from topics and language
function guessTag(meta) {
  const t = (meta.topics || []).join(' ').toLowerCase() + ' ' + meta.name.toLowerCase();
  if (/rag|retrieval|chatbot|llm/.test(t)) { return 'RAG'; }
  if (/game|android/.test(t)) { return 'Game'; }
  if (/vision|opencv|image|face/.test(t)) { return 'Vision'; }
  if (/nlp|text|summar/.test(t)) { return 'NLP'; }
  if (/agent/.test(t)) { return 'Agents'; }
  if (/ml|machine-learning|predict|classif/.test(t)) { return 'ML'; }
  if (/next|react|web|saas/.test(t)) { return 'Web'; }
  return 'Project';
}

const fileFromBlob = (blob, name) => new File([blob], name, { type: blob.type });

const stepHead = (n) => h('ol', { class: 'steps-hd', 'aria-label': 'Import steps' },
  [['Choose a repository'], ['Pick images and options']].map(([t], i) => h('li', { class: i + 1 < n ? 'done' : i + 1 === n ? 'on' : '' }, h('span', {}, String(i + 1)), t)));

export function openImporter(onDone) {
  const body = h('div', { class: 'importer' });
  const m = modal('Import a project from GitHub', body, { wide: true });
  showList();

  async function showList() {
    const status = h('div', {}, skeleton(4));
    const list = h('div', { class: 'repo-list' });
    const search = h('input', { type: 'search', placeholder: 'Search your repos, or paste a GitHub link', 'aria-label': 'Search or paste a link' });
    const go = h('button', { type: 'button', class: 'btn primary', onclick: () => { const n = repoNameFromInput(search.value); if (n) { showRepo(n); } } }, 'Open');
    body.replaceChildren(stepHead(1), h('div', { class: 'bar' }, search, go), status, list);
    search.focus();
    let repos = [];
    const paint = () => {
      const q = search.value.trim().toLowerCase();
      const shown = repos.filter((r) => !q || r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
      list.replaceChildren(...shown.map((r) => h('button', { type: 'button', class: 'repo', onclick: () => showRepo(r.name) },
        h('span', { class: 'rn' }, r.name, r.private ? h('span', { class: 'badge off' }, 'Private') : null),
        h('span', { class: 'rd' }, r.description || 'No description'),
        h('span', { class: 'rm' }, [r.language, r.pushedAt ? 'pushed ' + new Date(r.pushedAt).toLocaleDateString() : ''].filter(Boolean).join(' · ')))));
      status.replaceChildren(shown.length ? '' : h('p', { class: 'hint' }, repos.length ? 'No match. Press Open to try the text as a repo name.' : 'No repositories found.'));
    };
    search.addEventListener('input', paint);
    search.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go.click(); } });
    try { repos = (await api.repos('')).repos; paint(); } catch (e) { status.replaceChildren(h('p', { class: 'hint' }, 'Could not load your repositories: ' + e.message + ' You can still paste a repo link above.')); }
  }

  async function showRepo(name) {
    body.replaceChildren(stepHead(2), h('p', { class: 'hint' }, 'Reading ' + name + '…'), skeleton(4));
    let d;
    try { d = await api.repo(name); } catch (e) { body.replaceChildren(h('p', { class: 'err' }, e.message), h('button', { type: 'button', class: 'btn', onclick: showList }, 'Back')); return; }
    const meta = d.meta;
    const dup = state.site.projects.find((p) => p.repo && p.repo.fullName === meta.fullName);

    const chosen = new Set(d.images.filter((i) => i.source === 'readme').slice(0, 6).map((i) => i.path));
    const grid = h('div', { class: 'thumbs pickgrid' });
    const urls = [];
    d.images.forEach((im) => {
      const btn = h('button', { type: 'button', class: 'pickimg' + (chosen.has(im.path) ? ' on' : ''), 'aria-pressed': String(chosen.has(im.path)), title: im.path, onclick: () => {
        chosen.has(im.path) ? chosen.delete(im.path) : chosen.add(im.path);
        btn.classList.toggle('on', chosen.has(im.path)); btn.setAttribute('aria-pressed', String(chosen.has(im.path)));
      } }, h('img', { alt: im.path, loading: 'lazy' }), h('em', {}, im.path.split('/').pop()));
      grid.appendChild(btn);
      api.assetBlob({ repo: name, path: im.path }).then((b) => { const u = URL.createObjectURL(b); urls.push(u); btn.querySelector('img').src = u; }).catch(() => { btn.querySelector('img').alt = 'Could not load'; });
    });
    const extraFiles = [];
    const extraInput = h('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif', multiple: true, class: 'sr', onchange: (e) => { extraFiles.push(...e.target.files); extraNote.textContent = extraFiles.length + ' extra file(s) will be added.'; } });
    const extraNote = h('span', { class: 'hint' }, '');

    const mates = d.contributors.filter((c) => !c.self);
    const mateOn = new Set(mates.map((c) => c.login));
    const placement = { v: 'normal' };
    const company = { v: '' };
    const ack = h('input', { type: 'checkbox' });
    const addBtn = h('button', { type: 'button', class: 'btn primary', disabled: meta.private, onclick: create }, 'Add project');
    ack.addEventListener('change', () => { addBtn.disabled = !ack.checked; });
    const progress = h('p', { class: 'hint' });

    body.replaceChildren(
      stepHead(2),
      h('div', { class: 'bar' }, h('button', { type: 'button', class: 'btn', onclick: showList }, '← Back'), h('strong', {}, meta.fullName), meta.private ? h('span', { class: 'badge off' }, 'Private') : h('span', { class: 'badge' }, 'Public')),
      dup ? h('p', { class: 'warn' }, 'You already imported this repo as "' + dup.name + '". Importing again adds a second copy.') : null,
      meta.private ? h('div', { class: 'warn' }, h('label', { class: 'check' }, ack, h('span', {}, 'This repo is private. Its description, README text and images will be copied onto your public site. I want that.'))) : null,
      h('p', {}, 'Name, description, languages, year and links are filled in for you. You can edit everything after adding.'),
      h('h4', {}, 'Images to copy (' + d.images.length + ' found)'),
      d.images.length ? grid : h('p', { class: 'empty' }, 'No screenshots were found in the README or in image folders. Add some below.'),
      d.external.length ? h('details', {}, h('summary', {}, d.external.length + ' image link(s) cannot be copied automatically'), h('ul', { class: 'hint' }, d.external.map((e) => h('li', {}, (e.reason || 'Upload manually') + ': ' + e.url)))) : null,
      h('label', { class: 'drop' }, 'Add more images from your computer', extraInput), extraNote,
      mates.length ? h('div', {}, h('h4', {}, 'Collaborators'), h('p', { class: 'hint' }, 'People who committed to this repo. Untick anyone you do not want to credit.'),
        mates.map((c) => h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: true, onchange: (e) => { e.target.checked ? mateOn.add(c.login) : mateOn.delete(c.login); } }), h('span', {}, c.login + ' (' + c.contributions + ' commits)')))) : null,
      h('div', { class: 'grid2' },
        field('Where should it appear?', (() => { const s = h('select', { onchange: (e) => { placement.v = e.target.value; } }, [['normal', 'Normal'], ['featured', 'Featured (first in the grid)'], ['flagship', 'Flagship (big panel)']].map(([v, l]) => h('option', { value: v }, l))); return s; })()),
        field('Built during (optional)', (() => { const s = h('select', { onchange: (e) => { company.v = e.target.value; } }, [h('option', { value: '' }, 'Personal project'), ...state.site.changelog.map((c) => h('option', { value: c.id }, (c.role || 'Entry') + ' at ' + (c.org || '?')))]); return s; })())),
      h('div', { class: 'bar' }, addBtn, progress));

    async function create() {
      addBtn.disabled = true;
      try {
        const p = newProject();
        const year = (meta.pushed || meta.created || '').slice(0, 4);
        const intro = d.readme.intro || '';
        const first = intro.split(/(?<=[.!?])\s/)[0] || '';
        Object.assign(p, {
          name: prettyName(meta.name), tag: guessTag(meta), year: year || p.year,
          blurb: meta.description || first.slice(0, 160), desc: intro || meta.description || '',
          tech: [...new Set([...d.languages, ...(meta.topics || [])])].slice(0, 12),
          placement: placement.v, company: company.v,
          links: [...(meta.private ? [] : [{ label: 'GitHub', url: meta.url }]), ...(meta.homepage && /^https?:\/\//.test(meta.homepage) ? [{ label: 'Live demo', url: meta.homepage }] : [])],
          collaborators: mates.filter((c) => mateOn.has(c.login)).map((c) => ({ name: c.login, url: c.url })),
          repo: { name: meta.name, fullName: meta.fullName, private: meta.private },
        });
        const { stageImage } = await import('./projects.js');
        const picks = [...chosen];
        let k = 0;
        for (const path of picks) {
          progress.textContent = 'Copying image ' + (++k) + ' of ' + (picks.length + extraFiles.length) + '…';
          try { const blob = await api.assetBlob({ repo: name, path }); p.screenshots.push(await stageImage(p, fileFromBlob(blob, path.split('/').pop()))); }
          catch (e) { toast(path + ': ' + e.message, 'err'); }
        }
        for (const f of extraFiles) {
          progress.textContent = 'Adding image ' + (++k) + ' of ' + (picks.length + extraFiles.length) + '…';
          try { p.screenshots.push(await stageImage(p, f)); } catch (e) { toast(f.name + ': ' + e.message, 'err'); }
        }
        if (p.placement === 'flagship') {
          const { newShowcase } = await import('../schema.js');
          const max = Math.max(0, ...state.site.projects.map((x) => (x.showcase && x.showcase.order) || 0));
          p.showcase = newShowcase(p, max + 1);
          p.showcase.points = d.readme.bullets.slice(0, 3);
        }
        state.site.projects.unshift(p);
        touch();
        urls.forEach((u) => URL.revokeObjectURL(u));
        m.close();
        onDone && onDone(p);
        toast('Added "' + p.name + '". Review it, then publish.');
      } catch (e) { toast(e.message, 'err'); addBtn.disabled = false; }
    }
  }
}
