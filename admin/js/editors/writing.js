import { h, field, text, listEditor } from '../ui.js';
import { state } from '../store.js';

export function writingEditor() {
  const site = state.site;
  return h('div', { class: 'stack' },
    h('p', { class: 'hint lead' }, 'Only posts that have a link are shown on the site, so nothing points to a page that does not exist. If no post has a link, the whole Writing section is hidden.'),
    listEditor({
      items: site.writing, addLabel: 'Add post',
      newItem: () => ({ title: '', date: '', read: '', tag: 'Essay', excerpt: '', url: '' }),
      renderItem: (w) => h('div', { class: 'stack tight' },
        field('Title', text(w, 'title')),
        field('Link to the article', text(w, 'url', { placeholder: 'https://…' }), 'Required for the post to appear.'),
        h('div', { class: 'grid3' }, field('Date', text(w, 'date', { placeholder: 'May 2026' })), field('Reading time', text(w, 'read', { placeholder: '6 min' })), field('Label', text(w, 'tag'))),
        field('Short summary', text(w, 'excerpt', { multi: true, rows: 2 }))),
      itemLabel: (w) => w.title || 'post',
    }));
}
