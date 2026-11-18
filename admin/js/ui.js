// replaceChildren would print "null" for an empty slot; skip empty values and flatten lists instead
const nativeReplace = Element.prototype.replaceChildren;
Element.prototype.replaceChildren = function (...kids) {
  return nativeReplace.apply(this, kids.flat(Infinity).filter((k) => k !== null && k !== undefined && k !== false));
};

// Tiny DOM helpers. No framework: editors build elements and re-render their own tab when the structure changes.
export function h(tag, props, ...kids) {
  const n = document.createElement(tag);
  Object.entries(props || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === false) { return; }
    if (k === 'class') { n.className = v; }
    else if (k.startsWith('on') && typeof v === 'function') { n.addEventListener(k.slice(2).toLowerCase(), v); }
    else if (k === 'value') { n.value = v; }
    else if (k === 'checked') { n.checked = !!v; }
    else if (k === 'dataset') { Object.assign(n.dataset, v); }
    else { n.setAttribute(k, v === true ? '' : v); }
  });
  kids.flat(Infinity).forEach((c) => {
    if (c === null || c === undefined || c === false) { return; }
    n.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  });
  return n;
}

// bring an element into view, outline it for a moment, and put the cursor in its first field
export function flash(el, { focus = true } = {}) {
  if (!el) { return; }
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 1800);
  if (focus) { const inp = el.querySelector('input:not([type=checkbox]):not([type=file]),textarea'); if (inp) { setTimeout(() => inp.focus({ preventScroll: true }), 350); } }
}

export const slug = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'item';

// Toasts stack at the bottom; one may carry an action button such as "Undo".
export function toast(msg, kind = 'ok', opts = {}) {
  let box = document.getElementById('toasts');
  if (!box) { box = h('div', { id: 'toasts', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(box); }
  while (box.children.length >= 3) { box.firstChild.remove(); }
  const t = h('div', { class: 'toast ' + kind },
    h('span', { class: 'toast-ico', 'aria-hidden': 'true' }, kind === 'err' ? '!' : '✓'),
    h('span', { class: 'toast-msg' }, msg));
  const close = () => { t.classList.add('out'); setTimeout(() => t.remove(), 220); };
  if (opts.action) {
    t.appendChild(h('button', { type: 'button', class: 'toast-act', onclick: () => { opts.action.onClick(); close(); } }, opts.action.label));
  }
  box.appendChild(t);
  setTimeout(close, opts.ms || (kind === 'err' ? 7000 : opts.action ? 6000 : 3200));
}

// a themed replacement for confirm(): resolves true or false
export function confirmDialog({ title = 'Are you sure?', message = '', confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false } = {}) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (done) { return; } done = true; m.close(); resolve(v); };
    const ok = h('button', { type: 'button', class: 'btn ' + (danger ? 'danger-solid' : 'primary'), onclick: () => finish(true) }, confirmLabel);
    const m = modal(title, h('div', { class: 'confirm' },
      h('p', {}, message),
      h('div', { class: 'bar end' }, h('button', { type: 'button', class: 'btn ghost', onclick: () => finish(false) }, cancelLabel), ok)), { onClose: () => finish(false) });
    ok.focus();
  });
}

export const skeleton = (lines = 3) => {
  const box = h('div', { class: 'skeleton', 'aria-hidden': 'true' });
  for (let i = 0; i < lines; i++) { const bar = h('i'); bar.style.width = (92 - i * 15) + '%'; box.appendChild(bar); }
  return box;
};

// label + control (+ hint) in one block
export function field(label, control, hint) {
  return h('label', { class: 'field' }, h('span', { class: 'lbl' }, label), control, hint ? h('span', { class: 'hint' }, hint) : null);
}

// text input / textarea bound to obj[key]
export function text(obj, key, opts = {}) {
  const { multi, rows = 3, placeholder, onInput, type = 'text', maxlength, list } = opts;
  const el = h(multi ? 'textarea' : 'input', { value: obj[key] ?? '', placeholder, rows: multi ? rows : null, type: multi ? null : type, maxlength, list, spellcheck: 'true' });
  el.addEventListener('input', () => { obj[key] = el.value; (onInput || (() => {}))(el.value); touch(); });
  return el;
}

export function select(obj, key, options, opts = {}) {
  const el = h('select', {}, options.map(([v, l]) => h('option', { value: v, selected: String(obj[key] ?? '') === String(v) }, l)));
  el.addEventListener('change', () => { obj[key] = el.value; touch(); (opts.onChange || (() => {}))(el.value); });
  return el;
}

export function toggle(obj, key, label, opts = {}) {
  const el = h('input', { type: 'checkbox', checked: obj[key] !== false && !!obj[key] });
  el.addEventListener('change', () => { obj[key] = el.checked; touch(); (opts.onChange || (() => {}))(el.checked); });
  return h('label', { class: 'check' }, el, h('span', {}, label));
}

// list of short strings shown as removable chips; Enter or comma adds one
export function chips(arr, { placeholder = 'Add and press Enter', onChange } = {}) {
  const wrap = h('div', { class: 'chips' });
  const input = h('input', { type: 'text', placeholder, 'aria-label': placeholder });
  const draw = () => {
    wrap.querySelectorAll('.chip').forEach((c) => c.remove());
    arr.forEach((t, i) => {
      wrap.insertBefore(h('span', { class: 'chip' }, t, h('button', { type: 'button', 'aria-label': 'Remove ' + t, onclick: () => { arr.splice(i, 1); draw(); touch(); (onChange || (() => {}))(); } }, '×')), input);
    });
  };
  const add = () => {
    input.value.split(',').map((s) => s.trim()).filter(Boolean).forEach((s) => { if (!arr.includes(s)) { arr.push(s); } });
    input.value = '';
    draw(); touch(); (onChange || (() => {}))();
  };
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
    else if (e.key === 'Backspace' && !input.value && arr.length) { arr.pop(); draw(); touch(); }
  });
  input.addEventListener('blur', () => { if (input.value.trim()) { add(); } });
  wrap.appendChild(input);
  draw();
  return wrap;
}

// A reorderable list. renderItem(item, index) returns the editor for one row.
// Rows can be dragged by their grip, moved with the arrows, or removed (with an Undo toast).
// rowFilter(item) hides rows; call root.refilter() after the filter inputs change.
export function listEditor({ items, renderItem, newItem, addLabel = 'Add', onStructure, itemLabel, emptyText = 'Nothing here yet.', addToTop = false, rowFilter }) {
  const root = h('div', { class: 'list' });
  const changed = () => { touch(); (onStructure || (() => {}))(); };
  let rows = [];
  const refilter = () => {
    let shown = 0;
    rows.forEach((r, i) => { const keep = !rowFilter || rowFilter(items[i]); r.hidden = !keep; if (keep) { shown++; } });
    const none = root.querySelector('.empty.filtered');
    if (none) { none.hidden = shown > 0 || !items.length; }
  };
  root.refilter = refilter;

  const redraw = () => {
    root.replaceChildren();
    rows = [];
    if (!items.length) { root.appendChild(h('p', { class: 'empty' }, emptyText)); }
    items.forEach((item, i) => {
      const move = (d) => { const j = i + d; if (j < 0 || j >= items.length) { return; } [items[i], items[j]] = [items[j], items[i]]; changed(); redraw(); };
      const card = h('div', { class: 'row-card' },
        h('div', { class: 'row-tools', role: 'group', 'aria-label': 'Row actions' },
          h('button', { type: 'button', class: 'icon grip', title: 'Drag to reorder', 'aria-label': 'Drag to reorder', tabindex: '-1',
            onpointerdown: () => { card.draggable = true; },
            onpointerup: () => { card.draggable = false; } }, '⋮⋮'),
          h('button', { type: 'button', class: 'icon', title: 'Move up', 'aria-label': 'Move up', disabled: i === 0, onclick: () => move(-1) }, '↑'),
          h('button', { type: 'button', class: 'icon', title: 'Move down', 'aria-label': 'Move down', disabled: i === items.length - 1, onclick: () => move(1) }, '↓'),
          h('button', { type: 'button', class: 'icon danger', title: 'Remove', 'aria-label': 'Remove' + (itemLabel ? ' ' + itemLabel(item) : ''), onclick: () => {
            const gone = items.splice(i, 1)[0];
            changed(); redraw();
            toast('Removed ' + (itemLabel ? '"' + itemLabel(gone) + '"' : 'the item'), 'ok', { action: { label: 'Undo', onClick: () => { items.splice(i, 0, gone); changed(); redraw(); } } });
          } }, '✕')),
        h('div', { class: 'row-body' }, renderItem(item, i, redraw)));
      card.addEventListener('dragstart', (e) => { if (e.target !== card) { return; } card.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); root.dataset.from = String(i); });
      card.addEventListener('dragend', (e) => { if (e.target !== card) { return; } card.draggable = false; card.classList.remove('dragging'); root.querySelectorAll('.drop-before,.drop-after').forEach((n) => n.classList.remove('drop-before', 'drop-after')); });
      rows.push(card);
      root.appendChild(card);
    });
    if (items.length) { root.appendChild(h('p', { class: 'empty filtered', hidden: true }, 'Nothing matches the filter.')); }
    if (newItem) {
      root.appendChild(h('button', { type: 'button', class: 'btn add', onclick: () => {
        if (addToTop) { items.unshift(newItem()); } else { items.push(newItem()); }
        changed(); redraw();
        const rs = root.querySelectorAll(':scope > .row-card');
        const l = addToTop ? rs[0] : rs[rs.length - 1];
        if (l) { const inp = l.querySelector('input,textarea'); if (inp) { inp.focus(); l.scrollIntoView({ block: 'center' }); } }
      } }, '+ ' + addLabel));
    }
    refilter();
  };

  // drop zone logic: find the direct child row under the pointer, mark before/after, move on drop
  const rowAt = (e) => { let n = e.target; while (n && n.parentNode !== root) { n = n.parentNode; } return n && n.classList && n.classList.contains('row-card') ? n : null; };
  root.addEventListener('dragover', (e) => {
    if (root.dataset.from === undefined) { return; }
    const row = rowAt(e);
    if (!row) { return; }
    e.preventDefault();
    const r = row.getBoundingClientRect();
    const after = e.clientY > r.top + r.height / 2;
    root.querySelectorAll('.drop-before,.drop-after').forEach((n) => n.classList.remove('drop-before', 'drop-after'));
    row.classList.add(after ? 'drop-after' : 'drop-before');
  });
  root.addEventListener('drop', (e) => {
    const from = Number(root.dataset.from);
    delete root.dataset.from;
    const row = rowAt(e);
    if (!row || Number.isNaN(from)) { return; }
    e.preventDefault();
    const r = row.getBoundingClientRect();
    let to = rows.indexOf(row) + (e.clientY > r.top + r.height / 2 ? 1 : 0);
    if (from < to) { to -= 1; }
    if (to === from) { redraw(); return; }
    const [it] = items.splice(from, 1);
    items.splice(to, 0, it);
    changed(); redraw();
  });
  root.addEventListener('dragend', () => { delete root.dataset.from; });
  redraw();
  return root;
}

export function modal(title, body, { wide = false, onClose } = {}) {
  const close = () => { back.remove(); document.removeEventListener('keydown', esc); (onClose || (() => {}))(); };
  const esc = (e) => { if (e.key === 'Escape') { close(); } };
  const back = h('div', { class: 'modal-back', onclick: (e) => { if (e.target === back) { close(); } } },
    h('div', { class: 'modal' + (wide ? ' wide' : ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('div', { class: 'modal-head' }, h('h2', {}, title), h('button', { type: 'button', class: 'icon', 'aria-label': 'Close', onclick: close }, '✕')),
      h('div', { class: 'modal-body' }, body)));
  document.addEventListener('keydown', esc);
  document.body.appendChild(back);
  return { close, el: back };
}

// store.js sets this so field helpers can mark the draft dirty without importing it (avoids a cycle)
let touchFn = () => {};
export const setTouch = (f) => { touchFn = f; };
export const touch = () => touchFn();
