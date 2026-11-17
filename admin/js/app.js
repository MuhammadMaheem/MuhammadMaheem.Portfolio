import { h, toast } from './ui.js';
import { api, setAuthLostHandler } from './api.js';
import { state, load, onChange, undo, changes } from './store.js';
import { heroEditor, aboutEditor, linksEditor, resumeEditor } from './editors/profile.js';
import { headingsEditor, homeExtrasEditor } from './editors/sections.js';
import { skillsEditor } from './editors/skills.js';
import { experienceEditor } from './editors/experience.js';
import { projectsEditor } from './editors/projects.js';
import { writingEditor } from './editors/writing.js';
import { publishEditor, previewEditor } from './editors/publish.js';

const TABS = [
  ['hero', 'Home & hero', heroEditor],
  ['about', 'About', aboutEditor],
  ['headings', 'Section headings', headingsEditor],
  ['extras', 'How it works & Ask', homeExtrasEditor],
  ['skills', 'Skills', skillsEditor],
  ['experience', 'Experience', experienceEditor],
  ['projects', 'Projects', projectsEditor],
  ['writing', 'Writing', writingEditor],
  ['links', 'Links & contact', linksEditor],
  ['resume', 'Resume', resumeEditor],
  ['preview', 'Preview', previewEditor],
  ['publish', 'Publish', publishEditor],
];

const root = document.getElementById('app');
let tab = (location.hash || '#projects').slice(1);
if (!TABS.some((t) => t[0] === tab)) { tab = 'projects'; }

function showLogin(message) {
  const pw = h('input', { type: 'password', autocomplete: 'current-password', 'aria-label': 'Password', required: true, placeholder: 'Password' });
  const err = h('p', { class: 'err', role: 'alert' }, message || '');
  const form = h('form', { class: 'login', onsubmit: async (e) => {
    e.preventDefault();
    err.textContent = '';
    try {
      await api.login(pw.value);
      pw.value = '';
      start();
    } catch (x) { err.textContent = x.message; pw.select(); }
  } }, h('h1', {}, 'Portfolio admin'), h('p', { class: 'hint' }, 'Sign in to edit your site.'), pw, h('button', { class: 'btn primary', type: 'submit' }, 'Sign in'), err);
  root.replaceChildren(h('div', { class: 'login-wrap' }, form));
  pw.focus();
}

let statusEl; let undoBtn;
function shell() {
  statusEl = h('span', { class: 'dirty', 'aria-live': 'polite' });
  undoBtn = h('button', { type: 'button', class: 'btn', onclick: () => { if (undo()) { render(); } else { toast('Nothing to undo'); } } }, 'Undo');
  const nav = h('nav', { class: 'tabs', 'aria-label': 'Sections' }, TABS.map(([k, label]) => h('a', { href: '#' + k, class: 'tab' + (k === tab ? ' on' : ''), dataset: { tab: k }, onclick: (e) => { e.preventDefault(); go(k); } }, label)));
  const main = h('main', { id: 'main', tabindex: '-1' });
  root.replaceChildren(
    h('header', { class: 'top' },
      h('strong', { class: 'brand' }, 'Portfolio admin'),
      statusEl,
      h('span', { class: 'sp' }),
      undoBtn,
      h('a', { class: 'btn', href: '/', target: '_blank', rel: 'noopener' }, 'View site ↗'),
      h('button', { type: 'button', class: 'btn primary', onclick: () => go('publish') }, 'Publish'),
      h('button', { type: 'button', class: 'btn', onclick: async () => { await api.logout().catch(() => {}); showLogin(); } }, 'Sign out')),
    h('div', { class: 'shell' }, nav, main));
  paintStatus();
}

function paintStatus() {
  if (!statusEl) { return; }
  const n = changes().length + [...state.pending.keys()].length;
  statusEl.textContent = state.dirty ? 'Unpublished changes saved on this device' : 'Everything is published';
  statusEl.className = 'dirty' + (state.dirty ? ' yes' : '');
  void n;
}

function go(k) {
  tab = k;
  history.replaceState(null, '', '#' + k);
  document.querySelectorAll('.tab').forEach((a) => a.classList.toggle('on', a.dataset.tab === k));
  render();
}

function render() {
  const main = document.getElementById('main');
  if (!main) { return; }
  const def = TABS.find((t) => t[0] === tab);
  main.replaceChildren(h('h1', { class: 'page-title' }, def[1]), def[2](render));
  main.scrollTop = 0;
  window.scrollTo(0, 0);
}

async function start() {
  root.replaceChildren(h('p', { class: 'center hint' }, 'Loading your site…'));
  try {
    await api.session();
    await load();
  } catch (e) {
    if (e.status === 401) { showLogin(); return; }
    root.replaceChildren(h('div', { class: 'login-wrap' }, h('div', { class: 'login' }, h('h1', {}, 'Could not load'), h('p', { class: 'err' }, e.message), h('button', { class: 'btn', onclick: start }, 'Try again'))));
    return;
  }
  shell();
  render();
}

onChange(paintStatus);
setAuthLostHandler(() => showLogin('Your session ended. Sign in again; your draft is kept.'));
window.addEventListener('hashchange', () => { const k = location.hash.slice(1); if (TABS.some((t) => t[0] === k) && k !== tab) { go(k); } });
start();
