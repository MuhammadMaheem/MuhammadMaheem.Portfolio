import { h } from './ui.js';
import { writePreview, state } from './store.js';

// The live preview pane: the real site in an iframe, fed the current draft.
// Two stacked frames: the new one loads in the background and replaces the old one when ready,
// so the preview never flashes while you type.
const DEVICES = { desktop: ['Desktop', 1280], tablet: ['Tablet', 820], phone: ['Phone', 390] };
const LS = { device: 'adm.pv.device', motion: 'adm.pv.motion' };
const read = (k, d) => { try { return localStorage.getItem(k) || d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

export function createPreview() {
  let device = read(LS.device, 'desktop');
  if (!DEVICES[device]) { device = 'desktop'; }
  let motion = read(LS.motion, '0') === '1';
  let frames = [makeFrame(true), makeFrame(false)];
  let front = 0;
  let timer = null;
  let token = 0;
  let pendingFocus = null;
  let loadedOnce = false;

  const scaler = h('div', { class: 'pv-scaler' }, frames[0], frames[1]);
  const stage = h('div', { class: 'pv-stage' }, scaler);
  const busy = h('span', { class: 'pv-busy', 'aria-hidden': 'true' });
  const label = h('span', { class: 'pv-label' }, 'Live preview');

  const deviceBtns = Object.entries(DEVICES).map(([k, [name]]) => h('button', {
    type: 'button', class: 'seg' + (k === device ? ' on' : ''), 'aria-pressed': String(k === device), dataset: { device: k },
    onclick: () => { device = k; write(LS.device, k); paintDevices(); layout(); },
  }, name));
  const paintDevices = () => deviceBtns.forEach((b) => { const on = b.dataset.device === device; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });

  const motionBtn = h('button', { type: 'button', class: 'seg' + (motion ? ' on' : ''), 'aria-pressed': String(motion), title: 'Run the site animations in the preview', onclick: () => {
    motion = !motion; write(LS.motion, motion ? '1' : '0');
    motionBtn.classList.toggle('on', motion); motionBtn.setAttribute('aria-pressed', String(motion));
    refresh();
  } }, 'Animations');

  const el = h('aside', { class: 'pv', 'aria-label': 'Live preview of your site' },
    h('div', { class: 'pv-bar' },
      h('div', { class: 'seg-group', role: 'group', 'aria-label': 'Preview size' }, deviceBtns),
      motionBtn,
      h('span', { class: 'sp' }),
      busy, label,
      h('button', { type: 'button', class: 'icon-btn', title: 'Reload preview', 'aria-label': 'Reload preview', onclick: () => refresh() }, icon('refresh')),
      h('a', { class: 'icon-btn', href: '/', target: '_blank', rel: 'noopener', title: 'Open the published site', 'aria-label': 'Open the published site' }, icon('external'))),
    stage);

  function makeFrame(visible) {
    const f = h('iframe', { class: 'pv-frame' + (visible ? ' on' : ''), title: 'Site preview', tabindex: '-1', loading: 'eager' });
    return f;
  }

  // size the frame to the chosen device and scale it down to fit the pane
  function layout() {
    const [, logical] = DEVICES[device];
    const w = stage.clientWidth - 24;
    const hgt = stage.clientHeight - 24;
    if (w <= 0 || hgt <= 0) { return; }
    const scale = Math.min(1, w / logical);
    scaler.style.width = logical + 'px';
    scaler.style.height = Math.round(hgt / scale) + 'px';
    scaler.style.transform = 'scale(' + scale + ')';
    scaler.dataset.device = device;
    label.textContent = DEVICES[device][0] + ' · ' + Math.round(scale * 100) + '%';
  }
  new ResizeObserver(layout).observe(stage);

  const url = () => '/?adm-preview=1' + (motion ? '&adm-motion=1' : '') + '&t=' + Date.now();

  function load() {
    if (!state.site) { return; }
    const my = ++token;
    writePreview();
    const back = frames[1 - front];
    const old = frames[front];
    const y = loadedOnce && old.contentWindow ? safe(() => old.contentWindow.scrollY, 0) : 0;
    el.classList.add('loading');
    back.onload = () => {
      if (my !== token) { return; }
      const win = back.contentWindow;
      const doc = back.contentDocument;
      try {
        win.scrollTo(0, y);
        // keep the section the user is editing in view after the reload
        if (pendingFocus) { scrollToTarget(doc, win, pendingFocus, false); }
      } catch { /* cross-origin should not happen; ignore */ }
      // give the page a moment to lay out and reveal before swapping
      setTimeout(() => {
        if (my !== token) { return; }
        back.classList.add('on'); old.classList.remove('on');
        front = 1 - front;
        loadedOnce = true;
        el.classList.remove('loading');
      }, 350);
    };
    back.src = url();
  }

  function schedule(delay = 650) {
    clearTimeout(timer);
    timer = setTimeout(load, delay);
    el.classList.add('loading');
  }
  const refresh = () => { clearTimeout(timer); load(); };

  // scroll the preview to a section, project card, or timeline entry
  function scrollToTarget(doc, win, spec, smooth) {
    let node = findTarget(doc, spec);
    if (!node) { return false; }
    // the site collapses the project grid after six cards: open it so the card can be shown
    if (!node.getClientRects().length) {
      const more = doc.querySelector('#projMore button');
      if (more && more.getAttribute('aria-expanded') === 'false') { more.click(); }
      node = findTarget(doc, spec);
      if (!node || !node.getClientRects().length) { return false; }
    }
    const top = node.getBoundingClientRect().top + win.scrollY - 84;
    win.scrollTo({ top: Math.max(0, top), behavior: smooth && motion ? 'smooth' : 'auto' });
    return node;
  }
  function focus(spec) {
    pendingFocus = spec;
    const f = frames[front];
    if (!loadedOnce || !f.contentDocument) { return; }
    const node = scrollToTarget(f.contentDocument, f.contentWindow, spec, true);
    if (node && spec.flash) {
      node.classList.add('adm-flash');
      setTimeout(() => node.classList.remove('adm-flash'), 1400);
    }
  }

  window.addEventListener('adm:focus', (e) => focus(e.detail));
  return { el, schedule, refresh, focus, layout };
}

const safe = (fn, d) => { try { return fn(); } catch { return d; } };

function findTarget(doc, spec) {
  if (!spec) { return null; }
  if (spec.project) {
    const want = spec.project.trim().toLowerCase();
    const hit = [...doc.querySelectorAll('.show h3, .proj h3')].find((n) => n.textContent.trim().toLowerCase() === want);
    return hit ? hit.closest('.show, .proj') : null;
  }
  if (spec.selector) { const all = doc.querySelectorAll(spec.selector); return all[spec.index || 0] || null; }
  return null;
}

const ICONS = {
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
};
export function icon(name, size = 18) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', size); s.setAttribute('height', size);
  s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '1.8');
  s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true');
  s.innerHTML = ICONS[name] || '';
  return s;
}
export const registerIcons = (more) => Object.assign(ICONS, more);
