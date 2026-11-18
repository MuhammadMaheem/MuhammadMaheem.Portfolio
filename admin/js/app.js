import { h, toast } from './ui.js';
import { api, setAuthLostHandler } from './api.js';
import { state, load, onChange, undo, changes, pendingCount } from './store.js';
import { createPreview, icon, registerIcons } from './preview.js';
import { heroEditor, aboutEditor, linksEditor, resumeEditor } from './editors/profile.js';
import { headingsEditor, homeExtrasEditor } from './editors/sections.js';
import { skillsEditor } from './editors/skills.js';
import { experienceEditor } from './editors/experience.js';
import { projectsEditor } from './editors/projects.js';
import { writingEditor } from './editors/writing.js';
import { publishEditor } from './editors/publish.js';

registerIcons({
  home: '<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  type: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  tools: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5zM5 4l3 3M4 8l3-3"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  pen: '<path d="M4 20l4-1 11-11a2.1 2.1 0 0 0-3-3L5 16zM14 6l3 3"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  file: '<path d="M6 3h8l5 5v13H6zM14 3v5h5M9 13h6M9 17h6"/>',
  rocket: '<path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2M14 4c3-1 6-1 6-1s0 3-1 6l-6 6-5-5zM9 12L5 11l2-3 4 .5M12 15l1 4 3-2-.5-4"/>',
  undo: '<path d="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  out: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h11"/>',
});

// key, label, group, icon, short description, editor, where the preview scrolls to
const TABS = [
  ['hero', 'Home & hero', 'Content', 'home', 'Your name, headline and the first thing visitors see.', heroEditor, '#hero'],
  ['about', 'About', 'Content', 'user', 'The story, quote and quick facts.', aboutEditor, '#about'],
  ['skills', 'Skills', 'Content', 'tools', 'Groups of skills shown as cards.', skillsEditor, '#modules'],
  ['projects', 'Projects', 'Content', 'folder', 'Import from GitHub, set flagship or featured, add screenshots.', projectsEditor, '#work'],
  ['experience', 'Experience', 'Content', 'brief', 'Jobs, internships and education.', experienceEditor, '#changelog'],
  ['writing', 'Writing', 'Content', 'pen', 'Articles. Only posts with a link are shown.', writingEditor, '#writing'],
  ['headings', 'Section headings', 'Site', 'type', 'The words around each section, and which sections show.', headingsEditor, null],
  ['extras', 'How it works & Ask', 'Site', 'spark', 'The animated strip and the Ask panel.', homeExtrasEditor, '#flow'],
  ['links', 'Links & contact', 'Site', 'link', 'GitHub, LinkedIn, email and any other link.', linksEditor, '#uplink'],
  ['resume', 'Resume', 'Files', 'file', 'Replace the PDF behind the resume button.', resumeEditor, '#top'],
  ['publish', 'Publish', 'Ship', 'rocket', 'Review changes, go live, restore earlier versions.', publishEditor, null],
];
const root = document.getElementById('app');
let tab = (location.hash || '#projects').slice(1);
if (!TABS.some((t) => t[0] === tab)) { tab = 'projects'; }
let preview = null;
let statusPill; let publishBadge; let appEl;

// the live site, opened with ?owner=1 so its menu shows an Admin shortcut in this browser
const siteUrl = () => {
  const s = state.session;
  return s ? 'https://' + s.owner.toLowerCase() + '.github.io/' + s.repo + '/?owner=1' : '/';
};
const lsGet = (k, d) => { try { return localStorage.getItem(k) || d; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

/* ---------- sign in ---------- */
function showLogin(message) {
  preview = null;
  const pw = h('input', { type: 'password', autocomplete: 'current-password', 'aria-label': 'Password', required: true, placeholder: 'Password' });
  const code = h('input', { type: 'text', inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: '7', 'aria-label': 'Code from your authenticator app', placeholder: 'Authenticator code (if you use one)' });
  const err = h('p', { class: 'err', role: 'alert' }, message || '');
  const btn = h('button', { class: 'btn primary wide', type: 'submit' }, 'Sign in');
  const form = h('form', { class: 'login', onsubmit: async (e) => {
    e.preventDefault();
    err.textContent = ''; btn.disabled = true; btn.textContent = 'Signing in…';
    try { await api.login(pw.value, code.value.trim()); pw.value = ''; code.value = ''; start(); }
    catch (x) { err.textContent = x.message; pw.select(); btn.disabled = false; btn.textContent = 'Sign in'; }
  } },
    h('div', { class: 'login-mark' }, icon('rocket', 22)),
    h('h1', {}, 'Portfolio admin'), h('p', { class: 'hint' }, 'Sign in to edit your site.'), pw, code, btn, err);
  root.replaceChildren(h('div', { class: 'login-wrap' }, form));
  pw.focus();
}

/* ---------- shell ---------- */
function shell() {
  statusPill = h('span', { class: 'pill', 'aria-live': 'polite' }, h('i'), h('span', {}));
  publishBadge = h('span', { class: 'count', hidden: true });
  preview = createPreview();

  const groups = [...new Set(TABS.map((t) => t[2]))];
  const rail = h('nav', { class: 'rail', 'aria-label': 'Sections' }, groups.map((g) => h('div', { class: 'rail-group' },
    h('div', { class: 'rail-title' }, g),
    TABS.filter((t) => t[2] === g).map(([k, label,, ic]) => h('a', { href: '#' + k, class: 'tab' + (k === tab ? ' on' : ''), dataset: { tab: k }, onclick: (e) => { e.preventDefault(); go(k); } }, icon(ic, 18), h('span', {}, label))))));

  const page = h('div', { class: 'page', id: 'page' });
  const editor = h('main', { class: 'editor', id: 'main', tabindex: '-1' }, page);
  const split = h('div', { class: 'split', role: 'separator', 'aria-orientation': 'vertical', 'aria-label': 'Resize preview', tabindex: '0', title: 'Drag to resize. Double-click to reset.' });

  appEl = h('div', { class: 'app' },
    h('header', { class: 'top' },
      h('strong', { class: 'brand' }, h('span', { class: 'logo' }, icon('rocket', 16)), h('span', { class: 'brand-name' }, 'Portfolio admin')),
      statusPill,
      h('span', { class: 'sp' }),
      h('button', { type: 'button', class: 'btn ghost', title: 'Undo the last change', onclick: () => { if (undo()) { render(false); } else { toast('Nothing to undo'); } } }, icon('undo', 16), h('span', { class: 'btn-lbl' }, 'Undo')),
      h('a', { class: 'btn ghost', href: siteUrl(), target: '_blank', rel: 'noopener', title: 'Open the live site. This also shows an Admin button in its menu, in this browser only.' }, icon('external', 16), h('span', { class: 'btn-lbl' }, 'View site')),
      h('button', { type: 'button', class: 'btn ghost pv-toggle', onclick: () => appEl.classList.toggle('pv-open') }, icon('eye', 16), h('span', { class: 'btn-lbl' }, 'Preview')),
      h('button', { type: 'button', class: 'btn ghost hide-pv', title: 'Show or hide the live preview', onclick: () => { appEl.classList.toggle('no-pv'); lsSet('adm.nopv', appEl.classList.contains('no-pv') ? '1' : '0'); setTimeout(() => preview.layout(), 260); } }, icon('eye', 16), h('span', { class: 'btn-lbl' }, 'Live preview')),
      h('button', { type: 'button', class: 'btn primary', onclick: () => go('publish') }, 'Publish', publishBadge),
      h('button', { type: 'button', class: 'btn ghost', title: 'Sign out', 'aria-label': 'Sign out', onclick: async () => { await api.logout().catch(() => {}); showLogin(); } }, icon('out', 16))),
    h('div', { class: 'body' }, rail, editor, split, preview.el));
  root.replaceChildren(appEl);
  if (lsGet('adm.nopv', '0') === '1') { appEl.classList.add('no-pv'); }
  const w = parseInt(lsGet('adm.pvw', ''), 10);
  if (w) { appEl.style.setProperty('--pv-w', w + 'px'); }
  wireSplit(split);
  paintStatus();
}

// drag the divider to resize the preview; double-click or Home resets, arrows nudge
function wireSplit(split) {
  const set = (px) => {
    const max = Math.min(window.innerWidth * 0.72, window.innerWidth - 640);
    const v = Math.round(Math.max(340, Math.min(max, px)));
    appEl.style.setProperty('--pv-w', v + 'px'); lsSet('adm.pvw', String(v)); preview.layout();
    return v;
  };
  split.addEventListener('pointerdown', (e) => {
    e.preventDefault(); split.setPointerCapture(e.pointerId); appEl.classList.add('dragging');
    const move = (ev) => set(window.innerWidth - ev.clientX);
    const up = () => { split.removeEventListener('pointermove', move); split.removeEventListener('pointerup', up); appEl.classList.remove('dragging'); };
    split.addEventListener('pointermove', move); split.addEventListener('pointerup', up);
  });
  split.addEventListener('dblclick', () => { appEl.style.removeProperty('--pv-w'); lsSet('adm.pvw', ''); setTimeout(() => preview.layout(), 30); });
  split.addEventListener('keydown', (e) => {
    const cur = appEl.querySelector('.pv').getBoundingClientRect().width;
    if (e.key === 'ArrowLeft') { e.preventDefault(); set(cur + 40); }
    if (e.key === 'ArrowRight') { e.preventDefault(); set(cur - 40); }
    if (e.key === 'Home') { split.dispatchEvent(new Event('dblclick')); }
  });
}

let raf = 0;
function paintStatus() {
  if (!statusPill) { return; }
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    const n = state.dirty ? changes().length + pendingCount() : 0;
    statusPill.className = 'pill ' + (state.dirty ? 'warn' : 'ok');
    statusPill.lastChild.textContent = state.dirty ? 'Unpublished changes · saved on this device' : 'Everything is published';
    publishBadge.hidden = !n;
    publishBadge.textContent = String(n);
  });
}

/* ---------- navigation and rendering ---------- */
function go(k) {
  tab = k;
  history.replaceState(null, '', '#' + k);
  document.querySelectorAll('.tab').forEach((a) => a.classList.toggle('on', a.dataset.tab === k));
  appEl.classList.remove('pv-open');
  render(true);
}

function render(scrollPreview = true) {
  const page = document.getElementById('page');
  if (!page) { return; }
  const def = TABS.find((t) => t[0] === tab);
  if (typeof def[5] !== 'function') { return; }
  const body = def[5](() => render(false));
  page.replaceChildren(h('div', { class: 'page-head' }, h('h1', { class: 'page-title' }, def[1]), h('p', { class: 'page-desc' }, def[4])), body);
  page.classList.remove('enter'); void page.offsetWidth; page.classList.add('enter');
  document.getElementById('main').scrollTop = 0;
  if (scrollPreview && def[6] && preview) { window.dispatchEvent(new CustomEvent('adm:focus', { detail: { selector: def[6] } })); }
}

async function start() {
  root.replaceChildren(h('div', { class: 'boot' }, h('span', { class: 'spinner' }), h('p', { class: 'hint' }, 'Loading your site…')));
  try {
    state.session = await api.session();
    await load();
  } catch (e) {
    if (e.status === 401) { showLogin(); return; }
    root.replaceChildren(h('div', { class: 'login-wrap' }, h('div', { class: 'login' }, h('h1', {}, 'Could not load'), h('p', { class: 'err' }, e.message), h('button', { class: 'btn primary wide', onclick: start }, 'Try again'))));
    return;
  }
  shell();
  render(false);
  preview.refresh();
}

onChange(() => { paintStatus(); if (preview) { preview.schedule(); } });
setAuthLostHandler(() => showLogin('Your session ended. Sign in again; your draft is kept.'));
window.addEventListener('hashchange', () => { const k = location.hash.slice(1); if (appEl && TABS.some((t) => t[0] === k) && k !== tab) { go(k); } });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && appEl) { appEl.classList.remove('pv-open'); } });
start();
