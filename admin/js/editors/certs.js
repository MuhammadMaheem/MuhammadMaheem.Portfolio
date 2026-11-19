import { h, field, text, listEditor, toast, flash } from '../ui.js';
import { state, touch, addPending, dropPending, imgSrc, usedPaths } from '../store.js';
import { newCert, validDate, fmtDate } from '../schema.js';
import { prepareImage, nextName } from '../images.js';
import { take } from '../bus.js';
import { icon } from '../preview.js';

const used = () => {
  const u = usedPaths();
  state.pending.forEach((_, k) => u.add(k.replace(/^public\//, '')));
  return u;
};

// one badge or certificate image, kept under screenshots/certifications/
function imagePicker(c) {
  const box = h('div', { class: 'cert-pick' });
  const draw = () => {
    box.replaceChildren(
      c.image
        ? h('div', { class: 'cert-thumb' }, h('img', { src: imgSrc(c.image), alt: 'Badge preview' }),
          h('div', { class: 'thumb-tools' },
            h('button', { type: 'button', class: 'icon danger', 'aria-label': 'Remove image', onclick: async () => {
              if (state.pending.has('public/' + c.image)) { await dropPending('public/' + c.image); }
              c.image = ''; touch(); draw();
            } }, '✕')))
        : null,
      h('label', { class: 'drop' }, c.image ? 'Replace the image' : 'Add the badge or certificate image',
        h('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp', class: 'sr', onchange: async (e) => {
          const f = e.target.files[0];
          if (!f) { return; }
          try {
            const { blob, ext } = await prepareImage(f, { maxWidth: 1400 });
            const rel = nextName('certifications', f.name, ext, used());
            await addPending('public/' + rel, blob);
            c.image = rel; touch(); draw();
            toast('Image added. It goes live when you publish.');
          } catch (err) { toast(err.message, 'err'); }
        } })));
  };
  draw();
  return box;
}

function entry(c) {
  const when = h('p', { class: 'hint' });
  const paint = () => { when.textContent = c.date ? 'Shown as: ' + fmtDate(c.date) : 'No date shown'; };
  paint();
  const dateInput = text(c, 'date', { placeholder: 'YYYY-MM-DD, YYYY-MM or YYYY', onInput: () => { dateInput.classList.toggle('bad', !validDate(c.date)); paint(); } });
  return h('div', { class: 'stack tight' },
    field('Name of the course or certificate', text(c, 'title', { placeholder: 'AI Fluency: Framework and foundations' })),
    h('div', { class: 'grid2' },
      field('Issued by', text(c, 'issuer', { placeholder: 'Claude Academy (Anthropic)' })),
      field('What it is', text(c, 'kind', { placeholder: 'Course completion badge' }), 'A short label above the title.')),
    h('div', { class: 'grid2' },
      field('Date issued', dateInput),
      field('Verification link', text(c, 'url', { placeholder: 'https://…' }), 'Lets a recruiter check it is real.')),
    when,
    field('A line about it (optional)', text(c, 'note', { multi: true, rows: 2, placeholder: 'What you learned or why it matters' })),
    h('h4', {}, 'Badge image'),
    imagePicker(c));
}

export function certsEditor() {
  const site = state.site;
  const cmd = take('certs');
  if (cmd && cmd.cmd === 'add') { site.certifications.unshift(newCert()); touch(); }
  const root = h('div', { class: 'stack' },
    h('p', { class: 'hint lead' }, h('span', { class: 'inline-ico' }, icon('award', 15)), ' Shown under your timeline in the Experience section, newest first. Add a verification link so a recruiter can check each one.'),
    listEditor({
      items: site.certifications, addLabel: 'Add certification', newItem: newCert, addToTop: true,
      itemLabel: (c) => c.title || 'certification',
      emptyText: 'No certifications yet.',
      renderItem: (c, i) => {
        const box = entry(c);
        box.addEventListener('focusin', () => window.dispatchEvent(new CustomEvent('adm:focus', { detail: { selector: '.cert', index: i, flash: true } })));
        return box;
      },
    }));
  if (cmd) { requestAnimationFrame(() => flash(root.querySelector(':scope > .list > .row-card'))); }
  return root;
}
