import { h } from './ui.js';
import { icon } from './preview.js';

// Command palette (Ctrl/Cmd+K): jump to any page, project or entry, or run an action.
// items: [{group, label, hint, icon, run}]
export function openPalette(items) {
  const input = h('input', { type: 'text', class: 'pal-input', placeholder: 'Type to search pages, projects and actions…', 'aria-label': 'Search commands', autocomplete: 'off', spellcheck: 'false' });
  const list = h('div', { class: 'pal-list', role: 'listbox' });
  let shown = [];
  let sel = 0;

  const score = (it, words) => {
    const hay = (it.label + ' ' + (it.hint || '') + ' ' + it.group).toLowerCase();
    let s = 0;
    for (const w of words) {
      const i = hay.indexOf(w);
      if (i < 0) { return -1; }
      s += i === 0 ? 3 : (hay[i - 1] === ' ' ? 2 : 1);
    }
    return s;
  };

  function paint() {
    const q = input.value.trim().toLowerCase();
    const words = q ? q.split(/\s+/) : [];
    shown = items.map((it) => ({ it, s: words.length ? score(it, words) : 0 })).filter((x) => x.s >= 0).sort((a, b) => b.s - a.s).slice(0, 40).map((x) => x.it);
    if (sel >= shown.length) { sel = Math.max(0, shown.length - 1); }
    list.replaceChildren();
    if (!shown.length) { list.appendChild(h('p', { class: 'pal-empty' }, 'Nothing matches "' + input.value + '".')); return; }
    let last = '';
    shown.forEach((it, i) => {
      if (it.group !== last) { last = it.group; list.appendChild(h('div', { class: 'pal-group' }, it.group)); }
      list.appendChild(h('button', { type: 'button', class: 'pal-item' + (i === sel ? ' on' : ''), role: 'option', 'aria-selected': String(i === sel), dataset: { i }, onclick: () => run(i), onmousemove: () => { if (sel !== i) { sel = i; mark(); } } },
        icon(it.icon || 'spark', 17), h('span', { class: 'pl' }, it.label), it.hint ? h('span', { class: 'ph' }, it.hint) : null));
    });
  }
  function mark() {
    list.querySelectorAll('.pal-item').forEach((b) => { const on = Number(b.dataset.i) === sel; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); if (on) { b.scrollIntoView({ block: 'nearest' }); } });
  }
  function close() { back.classList.add('out'); setTimeout(() => back.remove(), 160); document.removeEventListener('keydown', onKey, true); }
  function run(i) { const it = shown[i]; if (!it) { return; } close(); setTimeout(() => it.run(), 60); }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(shown.length - 1, sel + 1); mark(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
    else if (e.key === 'Enter') { e.preventDefault(); run(sel); }
  }
  const back = h('div', { class: 'pal-back', onclick: (e) => { if (e.target === back) { close(); } } },
    h('div', { class: 'pal', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Command palette' },
      h('div', { class: 'pal-top' }, icon('search', 18), input, h('kbd', {}, 'Esc')),
      list,
      h('div', { class: 'pal-foot' }, h('span', {}, h('kbd', {}, '↑'), h('kbd', {}, '↓'), ' move'), h('span', {}, h('kbd', {}, '↵'), ' open'), h('span', {}, h('kbd', {}, 'Esc'), ' close'))));
  input.addEventListener('input', () => { sel = 0; paint(); });
  document.addEventListener('keydown', onKey, true);
  document.body.appendChild(back);
  paint();
  input.focus();
}
