import { h, field, text, listEditor, chips, flash } from '../ui.js';
import { take } from '../bus.js';
import { state } from '../store.js';

export function skillsEditor() {
  const site = state.site;
  const cmd = take('skills');
  const root = h('div', { class: 'stack' },
    h('p', { class: 'hint lead' }, 'Each group becomes one card in the Skills section.'),
    listEditor({
      items: site.modules, addLabel: 'Add skill group', newItem: () => ({ name: '', blurb: '', items: [] }),
      renderItem: (m, i) => h('div', { class: 'stack tight', onfocusin: () => window.dispatchEvent(new CustomEvent('adm:focus', { detail: { selector: '.module', index: i, flash: true } })) },
        field('Group name', text(m, 'name')),
        field('One-line description', text(m, 'blurb')),
        field('Skills', chips(m.items, { placeholder: 'Add a skill and press Enter' }))),
      itemLabel: (m) => m.name || 'group',
    }));
  if (cmd) { requestAnimationFrame(() => flash(root.querySelectorAll(':scope > .list > .row-card')[cmd.arg || 0])); }
  return root;
}
