import { h, field, text, listEditor, chips } from '../ui.js';
import { state } from '../store.js';

export function skillsEditor() {
  const site = state.site;
  return h('div', { class: 'stack' },
    h('p', { class: 'hint lead' }, 'Each group becomes one card in the Skills section.'),
    listEditor({
      items: site.modules, addLabel: 'Add skill group', newItem: () => ({ name: '', blurb: '', items: [] }),
      renderItem: (m, i) => h('div', { class: 'stack tight', onfocusin: () => window.dispatchEvent(new CustomEvent('adm:focus', { detail: { selector: '.module', index: i, flash: true } })) },
        field('Group name', text(m, 'name')),
        field('One-line description', text(m, 'blurb')),
        field('Skills', chips(m.items, { placeholder: 'Add a skill and press Enter' }))),
      itemLabel: (m) => m.name || 'group',
    }));
}
