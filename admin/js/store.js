import { api } from './api.js';
import { normalize, summarize } from './schema.js';
import { blobToBase64 } from './images.js';
import { setTouch, confirmDialog } from './ui.js';

export const RESUME_PATH = 'public/Muhammad-Maheem-Resume.pdf';
const DRAFT_KEY = 'adm.draft';
const PREVIEW_KEY = 'adm.preview';

export const state = {
  site: null,          // the draft being edited
  original: null,      // JSON string of what is live (for the change summary)
  baseBlob: null,      // sha of data.js when loaded, to detect edits made elsewhere
  head: null,
  pending: new Map(),  // repo path -> Blob, not yet uploaded
  dirty: false,
  undo: [],
  listeners: new Set(),
  session: null,
};

const clone = (o) => JSON.parse(JSON.stringify(o));
const emit = () => state.listeners.forEach((f) => f());
export const onChange = (f) => state.listeners.add(f);

/* ---------- IndexedDB for unsent images ---------- */
function idb() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open('portfolio-admin', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('pending', { keyPath: 'path' });
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function idbDo(mode, fn) {
  try {
    const db = await idb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('pending', mode);
      const out = fn(tx.objectStore('pending'));
      tx.oncomplete = () => resolve(out && out.result);
      tx.onerror = () => reject(tx.error);
    });
  } catch { return undefined; } // private windows may block IndexedDB; the draft still works for this tab
}

/* ---------- draft autosave and undo ---------- */
let saveTimer; let undoTimer;
function saveDraft() {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ site: state.site, baseBlob: state.baseBlob, at: Date.now() })); } catch { /* storage full or blocked */ }
}
export function touch() {
  state.dirty = true;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveDraft, 400);
  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => {
    const snap = JSON.stringify(state.site);
    if (state.undo[state.undo.length - 1] !== snap) { state.undo.push(snap); if (state.undo.length > 30) { state.undo.shift(); } }
    // editing something back to how it was means there is nothing to publish
    state.dirty = snap !== state.original || state.pending.size > 0;
    emit();
  }, 700);
  emit();
}
setTouch(touch);

export function undo() {
  if (state.undo.length < 2) { return false; }
  state.undo.pop();
  state.site = JSON.parse(state.undo[state.undo.length - 1]);
  state.dirty = JSON.stringify(state.site) !== state.original;
  saveDraft(); emit();
  return true;
}

/* ---------- loading ---------- */
export async function load() {
  state.dirty = false;
  const d = await api.content();
  state.baseBlob = d.blob; state.head = d.head;
  state.original = JSON.stringify(normalize(clone(d.site)));
  let site = JSON.parse(state.original);
  let draft = null;
  try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch { draft = null; }
  if (draft && draft.site && JSON.stringify(normalize(clone(draft.site))) !== state.original) {
    const same = draft.baseBlob === d.blob;
    const when = new Date(draft.at).toLocaleString();
    const keep = await confirmDialog(same
      ? { title: 'Restore your unpublished changes?', message: 'You have changes saved on this device from ' + when + '.', confirmLabel: 'Restore them', cancelLabel: 'Discard them' }
      : { title: 'This draft is out of date', message: 'The draft saved on ' + when + ' is based on an older version, and the site has changed since. Keeping it means publishing will replace the newer changes.', confirmLabel: 'Keep my draft', cancelLabel: 'Load the live site', danger: true });
    if (keep) { site = normalize(draft.site); state.dirty = true; } else { localStorage.removeItem(DRAFT_KEY); await idbDo('readwrite', (s) => s.clear()); }
  }
  state.site = site;
  state.pending.clear();
  const all = await idbDo('readonly', (s) => s.getAll());
  (all || []).forEach((r) => { if (state.dirty) { state.pending.set(r.path, r.blob); } });
  state.undo = [JSON.stringify(state.site)];
  emit();
}

/* ---------- pending images ---------- */
export async function addPending(path, blob) {
  state.pending.set(path, blob);
  objectUrls.delete(path);
  await idbDo('readwrite', (s) => s.put({ path, blob }));
  touch();
}
export async function dropPending(path) {
  state.pending.delete(path);
  await idbDo('readwrite', (s) => s.delete(path));
}
const objectUrls = new Map();
// what to put in <img src> for a site-relative path like "screenshots/App/01.png"
export function imgSrc(rel) {
  if (!rel) { return ''; }
  const repoPath = 'public/' + rel;
  if (state.pending.has(repoPath)) {
    if (!objectUrls.has(repoPath)) { objectUrls.set(repoPath, URL.createObjectURL(state.pending.get(repoPath))); }
    return objectUrls.get(repoPath);
  }
  return '/' + rel.replace(/^\//, '');
}
export const usedPaths = () => {
  const set = new Set();
  const walk = (v) => {
    if (typeof v === 'string') { if (/^screenshots\//.test(v)) { set.add(v); } }
    else if (Array.isArray(v)) { v.forEach(walk); }
    else if (v && typeof v === 'object') { Object.values(v).forEach(walk); }
  };
  walk(state.site);
  return set;
};

/* ---------- preview ---------- */
export function writePreview() {
  const copy = clone(state.site);
  const swap = (v) => {
    if (typeof v === 'string') { return state.pending.has('public/' + v) ? imgSrc(v) : v; }
    if (Array.isArray(v)) { return v.map(swap); }
    if (v && typeof v === 'object') { Object.keys(v).forEach((k) => { v[k] = swap(v[k]); }); return v; }
    return v;
  };
  swap(copy);
  localStorage.setItem(PREVIEW_KEY, JSON.stringify(copy));
}

/* ---------- publish ---------- */
export const changes = () => summarize(JSON.parse(state.original), state.site);
export const pendingCount = () => {
  const used = usedPaths();
  return [...state.pending.keys()].filter((p) => p === RESUME_PATH || used.has(p.replace(/^public\//, ''))).length;
};

export function problems() {
  const out = [];
  const s = state.site;
  if (!s.identity.name.trim()) { out.push('Your name is empty.'); }
  s.projects.forEach((p) => {
    if (!p.name.trim()) { out.push('A project has no name.'); }
    if (p.placement === 'flagship' && (!p.showcase || !(p.showcase.shots || []).length)) { out.push('Flagship project "' + p.name + '" needs at least one panel image.'); }
    if (p.placement === 'flagship' && p.showcase && p.showcase.kind === 'game' && !p.showcase.banner) { out.push('Game panel "' + p.name + '" needs a banner image.'); }
  });
  s.changelog.forEach((c) => {
    if (!c.role.trim() || !c.org.trim()) { out.push('An experience entry is missing its title or organisation.'); }
  });
  return [...new Set(out)];
}

export async function publish(message, progress) {
  const used = usedPaths();
  const todo = [...state.pending.entries()].filter(([p]) => p === RESUME_PATH || used.has(p.replace(/^public\//, '')));
  const files = [];
  let n = 0;
  for (const [path, blob] of todo) {
    progress && progress({ phase: 'upload', n: ++n, total: todo.length });
    const r = await api.upload(path, await blobToBase64(blob));
    files.push({ path, sha: r.sha });
  }
  progress && progress({ phase: 'commit' });
  const res = await api.publish({ site: state.site, baseBlob: state.baseBlob, files, message });
  state.baseBlob = res.blob;
  state.original = JSON.stringify(state.site);
  state.dirty = false;
  state.pending.clear();
  await idbDo('readwrite', (s) => s.clear());
  localStorage.removeItem(DRAFT_KEY);
  emit();
  return res;
}

export async function discardDraft() {
  localStorage.removeItem(DRAFT_KEY);
  await idbDo('readwrite', (s) => s.clear());
  state.pending.clear();
  state.dirty = false;
  await load();
}
