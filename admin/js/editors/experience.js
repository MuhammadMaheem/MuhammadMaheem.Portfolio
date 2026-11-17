import { h, field, text, select, toggle, listEditor } from '../ui.js';
import { state, touch } from '../store.js';
import { newExperience, validDate, fmtRange } from '../schema.js';

const TYPES = [['internship', 'Internship'], ['job', 'Job'], ['education', 'Education'], ['freelance', 'Freelance'], ['other', 'Other']];

function dateInput(obj, key, label, hint, preview) {
  const input = text(obj, key, { placeholder: 'YYYY-MM or YYYY', onInput: () => { input.classList.toggle('bad', !validDate(obj[key])); preview(); } });
  return field(label, input, hint);
}

function entry(c) {
  const when = h('p', { class: 'hint when' });
  const draw = () => { when.textContent = 'Shown as: ' + (fmtRange(c.start, c.end, c.present) || '(no dates)'); };
  draw();

  const bulletsBox = h('div');
  const noteBox = h('div');
  const drawBody = () => {
    bulletsBox.replaceChildren();
    noteBox.replaceChildren();
    if (c.format === 'bullets') {
      if (!c.bullets.length) { c.bullets.push(''); }
      bulletsBox.appendChild(listEditor({
        items: c.bullets, addLabel: 'Add bullet', newItem: () => '',
        renderItem: (_, i) => {
          const proxy = { get v() { return c.bullets[i]; }, set v(x) { c.bullets[i] = x; } };
          return text(proxy, 'v', { multi: true, rows: 2, placeholder: 'What you did, in plain words' });
        },
        itemLabel: () => 'bullet',
      }));
    } else {
      noteBox.appendChild(field('Description', text(c, 'note', { multi: true, rows: 5, placeholder: 'A short paragraph about the role' })));
    }
  };
  drawBody();

  const endField = h('div');
  const drawEnd = () => {
    endField.replaceChildren(c.present
      ? h('p', { class: 'hint pad' }, 'Ends: Present')
      : dateInput(c, 'end', 'Ended', 'Leave empty if unknown', draw));
  };
  drawEnd();

  const presentToggle = toggle(c, 'present', 'I still work here / still studying', { onChange: () => { drawEnd(); draw(); } });

  return h('div', { class: 'stack tight' },
    h('div', { class: 'grid2' },
      field('Title', text(c, 'role', { placeholder: 'AI Engineer Intern' })),
      field('Company or school', text(c, 'org', { placeholder: 'Company name' }))),
    h('div', { class: 'grid3' },
      field('Type', select(c, 'type', TYPES)),
      field('Location', text(c, 'location', { placeholder: 'Remote, Lahore…' })),
      field('Link (optional)', text(c, 'url', { placeholder: 'https://company.com' }))),
    h('div', { class: 'grid3' },
      dateInput(c, 'start', 'Started', 'Month and year, like 2026-03', draw),
      endField,
      h('div', { class: 'pad' }, presentToggle)),
    when,
    field('Describe it as', select(c, 'format', [['bullets', 'Bullet points'], ['paragraph', 'One paragraph']], { onChange: drawBody })),
    bulletsBox, noteBox);
}

export function experienceEditor() {
  const site = state.site;
  const wrap = h('div', { class: 'stack' },
    h('p', { class: 'hint lead' }, 'Newest first. Projects can be attached to an entry from the project editor; they then show under it as "Built here".'));
  wrap.appendChild(listEditor({
    items: site.changelog, addLabel: 'Add experience',
    newItem: newExperience, addToTop: true,
    renderItem: (c, i) => {
      const box = entry(c);
      box.addEventListener('focusin', () => window.dispatchEvent(new CustomEvent('adm:focus', { detail: { selector: '.tl-item', index: i, flash: true } })));
      return box;
    },
    itemLabel: (c) => (c.role || 'entry') + (c.org ? ' at ' + c.org : ''),
  }));
  return wrap;
}
