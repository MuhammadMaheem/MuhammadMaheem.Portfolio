import { h, field, text, listEditor, chips, toast } from '../ui.js';
import { state, addPending, touch, RESUME_PATH } from '../store.js';

const card = (title, ...kids) => h('section', { class: 'card' }, h('h3', {}, title), ...kids);

export function heroEditor() {
  const id = state.site.identity;
  return h('div', { class: 'stack' },
    card('Name and headline',
      field('Full name', text(id, 'name')),
      h('div', { class: 'grid2' },
        field('Short code (menu logo, footer)', text(id, 'codename'), 'For example MHM.DEV. Text after the first dot is highlighted.'),
        field('Small label above your name', text(id, 'heroLabel'), 'For example MHM·01 // SYSTEM ONLINE')),
      field('Roles (the hero rotates through these)', text(id, 'role'), 'Separate roles with a vertical bar: AI Engineer | ML Engineer'),
      field('One-line tagline under the name', text(id, 'tagline', { multi: true, rows: 2 })),
      h('div', { class: 'grid2' },
        field('Location', text(id, 'location')),
        field('Availability status', text(id, 'status'), 'Used by the Ask panel when someone asks if you are available.'))),
    card('Button labels',
      h('div', { class: 'grid3' },
        field('First hero button', text(id, 'ctaPrimary'), 'Scrolls to Projects'),
        field('Second hero button', text(id, 'ctaSecondary'), 'Scrolls to Contact'),
        field('Resume button', text(id, 'resumeLabel'), 'Shown with a ↓ arrow'))),
    card('Scrolling tech strip',
      h('p', { class: 'hint' }, 'The names that scroll under the hero.'),
      chips(state.site.marquee, { placeholder: 'Add a technology and press Enter' })));
}

export function aboutEditor() {
  const id = state.site.identity;
  return h('div', { class: 'stack' },
    card('About text',
      h('p', { class: 'hint' }, 'One box per paragraph.'),
      listEditor({
        items: id.bio, addLabel: 'Add paragraph', newItem: () => '',
        // strings are not objects, so wrap each one for binding
        renderItem: (_, i) => {
          const proxy = { get v() { return id.bio[i]; }, set v(x) { id.bio[i] = x; } };
          return text(proxy, 'v', { multi: true, rows: 5 });
        },
        itemLabel: (t) => String(t).slice(0, 30) || 'paragraph',
      })),
    card('Quote',
      field('Quote', text(id.quote, 'text', { multi: true, rows: 2 })),
      field('Said by', text(id.quote, 'by'))),
    card('Quick facts',
      h('p', { class: 'hint' }, 'The label and value rows next to your bio.'),
      listEditor({
        items: id.specs, addLabel: 'Add fact', newItem: () => ({ k: '', v: '' }),
        renderItem: (s) => h('div', { class: 'grid2' }, field('Label', text(s, 'k')), field('Value', text(s, 'v'))),
        itemLabel: (s) => s.k || 'fact',
      })));
}

export function linksEditor() {
  const site = state.site;
  return h('div', { class: 'stack' },
    card('Social and contact links',
      h('p', { class: 'hint' }, 'Shown in the Contact section. Use https:// links, mailto:you@example.com for email, or tel:+92... for a phone number. Add as many as you like (GitHub, LinkedIn, X, Kaggle, Medium).'),
      listEditor({
        items: site.socials, addLabel: 'Add link', newItem: () => ({ label: '', handle: '', url: '' }),
        renderItem: (s) => h('div', { class: 'grid3' },
          field('Name', text(s, 'label', { placeholder: 'LinkedIn' })),
          field('Shown as', text(s, 'handle', { placeholder: '/in/your-name' })),
          field('Link', text(s, 'url', { placeholder: 'https://…' }))),
        itemLabel: (s) => s.label || 'link',
      })),
    card('Owner shortcut',
      h('p', { class: 'hint' }, 'The address of this admin page. After you click "View site" in the admin, a small Admin button appears in your site\'s menu, in your browser only. Visitors never see it. Alt+Shift+A also opens it.'),
      field('Admin page address', text(site.identity, 'adminUrl', { placeholder: 'https://…/admin/' }))));
}

export function resumeEditor() {
  const id = state.site.identity;
  const input = h('input', { type: 'file', accept: 'application/pdf', onchange: async (e) => {
    const f = e.target.files[0];
    if (!f) { return; }
    if (f.size > 3 * 1024 * 1024) { toast('The PDF is larger than 3 MB. Compress it first.', 'err'); return; }
    const head = new Uint8Array(await f.slice(0, 4).arrayBuffer());
    if (String.fromCharCode(...head) !== '%PDF') { toast('That file is not a PDF.', 'err'); return; }
    await addPending(RESUME_PATH, f);
    id.resumeVersion = String(Date.now());
    touch();
    status.textContent = 'New resume ready: ' + f.name + ' (' + Math.round(f.size / 1024) + ' KB). It goes live when you publish.';
    toast('Resume staged. Publish to make it live.');
  } });
  const status = h('p', { class: 'hint' }, state.pending.has(RESUME_PATH) ? 'A new resume is waiting to be published.' : 'The "Spec sheet" button downloads the current resume.');
  return h('div', { class: 'stack' },
    card('Resume PDF',
      h('p', {}, 'Upload a new PDF to replace the file behind the "Spec sheet" download button.'),
      input, status,
      h('p', { class: 'hint' }, 'Visitors always get the latest file: the button link changes whenever you upload.')));
}
