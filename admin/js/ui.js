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

export const slug = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'item';

let toastTimer;
export function toast(msg, kind = 'ok') {
  let t = document.getElementById('toast');
  if (!t) { t = h('div', { id: 'toast', role: 'status' }); document.body.appendChild(t); }
  t.textContent = msg;
  t.className = 'show ' + kind;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = ''; }, kind === 'err' ? 7000 : 3200);
}

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
export function listEditor({ items, renderItem, newItem, addLabel = 'Add', onStructure, itemLabel, emptyText = 'Nothing here yet.', addToTop = false }) {
  const root = h('div', { class: 'list' });
  const redraw = () => {
    root.replaceChildren();
    if (!items.length) { root.appendChild(h('p', { class: 'empty' }, emptyText)); }
    items.forEach((item, i) => {
      const move = (d) => { const j = i + d; if (j < 0 || j >= items.length) { return; } [items[i], items[j]] = [items[j], items[i]]; touch(); redraw(); (onStructure || (() => {}))(); };
      root.appendChild(h('div', { class: 'row-card' },
        h('div', { class: 'row-tools' },
          h('button', { type: 'button', class: 'icon', title: 'Move up', 'aria-label': 'Move up', disabled: i === 0, onclick: () => move(-1) }, '↑'),
          h('button', { type: 'button', class: 'icon', title: 'Move down', 'aria-label': 'Move down', disabled: i === items.length - 1, onclick: () => move(1) }, '↓'),
          h('button', { type: 'button', class: 'icon danger', title: 'Remove', 'aria-label': 'Remove' + (itemLabel ? ' ' + itemLabel(item) : ''), onclick: () => {
            if (!confirm('Remove ' + (itemLabel ? '"' + itemLabel(item) + '"' : 'this item') + '?')) { return; }
            items.splice(i, 1); touch(); redraw(); (onStructure || (() => {}))();
          } }, '✕')),
        h('div', { class: 'row-body' }, renderItem(item, i, redraw))));
    });
    if (newItem) {
      root.appendChild(h('button', { type: 'button', class: 'btn add', onclick: () => { if (addToTop) { items.unshift(newItem()); } else { items.push(newItem()); } touch(); redraw(); (onStructure || (() => {}))(); const rows = root.querySelectorAll('.row-card'); const l = addToTop ? rows[0] : rows[rows.length - 1]; if (l) { const i = l.querySelector('input,textarea'); if (i) { i.focus(); l.scrollIntoView({ block: 'center' }); } } } }, '+ ' + addLabel));
    }
  };
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
