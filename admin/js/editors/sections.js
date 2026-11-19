import { h, field, text, toggle, listEditor, select, flash } from '../ui.js';
import { take } from '../bus.js';
import { state } from '../store.js';
import { SECTION_KEYS, HIDEABLE } from '../schema.js';

const card = (title, ...kids) => h('section', { class: 'card' }, h('h3', {}, title), ...kids);

export function headingsEditor() {
  const site = state.site;
  const cmd = take('headings');
  const root = h('div', { class: 'stack' },
    h('p', { class: 'hint lead' }, 'Edit the words around each section. In a heading, press Enter for a new line and wrap a word in *stars* to emphasise it.'),
    SECTION_KEYS.map(([key, label]) => {
      const s = site.sections[key];
      const c = card(label,
        h('div', { class: 'grid2' }, field('Menu label', text(s, 'nav')), field('Small label above the heading', text(s, 'eyebrow'))),
        field('Heading', text(s, 'title', { multi: true, rows: 2 })),
        field('Text under the heading', text(s, 'sub', { multi: true, rows: 2 })),
        key === 'experience' ? field('Heading above your certifications', text(s, 'certsTitle', { placeholder: 'Certifications' })) : null,
        HIDEABLE.includes(key) ? toggle(s, 'visible', 'Show this section on the site') : h('p', { class: 'hint' }, 'This section is always shown.'));
      c.dataset.section = key;
      return c;
    }));
  if (cmd) { requestAnimationFrame(() => flash(root.querySelector('[data-section="' + cmd.arg + '"]'))); }
  return root;
}

export function homeExtrasEditor() {
  const site = state.site;
  const f = site.flow;
  const a = site.ask;
  return h('div', { class: 'stack' },
    card('"How it works" strip',
      h('div', { class: 'grid2' }, field('Small label', text(f, 'label')), field('Heading', text(f, 'title'))),
      field('Text under the heading', text(f, 'sub', { multi: true, rows: 2 })),
      h('h4', {}, 'Steps (in order)'),
      listEditor({
        items: f.steps, addLabel: 'Add step', newItem: () => ({ t: '', d: '' }),
        renderItem: (s) => h('div', { class: 'grid2' }, field('Step name', text(s, 't')), field('What happens', text(s, 'd', { multi: true, rows: 2 }))),
        itemLabel: (s) => s.t || 'step',
      })),
    card('"Ask my portfolio" panel',
      h('p', { class: 'hint' }, 'A scripted demo: answers are put together from the rest of your content. No AI model is called.'),
      h('div', { class: 'grid2' }, field('Panel title', text(a, 'title')), field('Small badge', text(a, 'note'))),
      field('Footer note', text(a, 'foot')),
      field('Input placeholder', text(a, 'placeholder')),
      field('Answer to "What does he build?"', text(a, 'build', { multi: true, rows: 3 })),
      field('When it cannot answer', text(a, 'fallback', { multi: true, rows: 2 })),
      h('h4', {}, 'Suggested questions'),
      h('p', { class: 'hint' }, 'Each one is tied to a built-in answer. The first one plays by itself when the page loads.'),
      listEditor({
        items: a.questions, addLabel: 'Add question', newItem: () => ({ id: 'build', q: '' }),
        renderItem: (q) => h('div', { class: 'grid2' },
          field('Question', text(q, 'q')),
          field('Answers with', select(q, 'id', [['build', 'What I build'], ['projects', 'My best projects'], ['experience', 'Where I worked'], ['skills', 'My skills'], ['education', 'Education'], ['hire', 'Availability'], ['game', 'The game']]))),
        itemLabel: (q) => q.q || 'question',
      })));
}
