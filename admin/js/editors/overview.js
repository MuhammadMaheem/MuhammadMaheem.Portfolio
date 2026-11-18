import { h, skeleton } from '../ui.js';
import { api } from '../api.js';
import { state, changes, pendingCount } from '../store.js';
import { goTab } from '../bus.js';
import { icon } from '../preview.js';
import { completeness } from './projects.js';

const greeting = () => { const hr = new Date().getHours(); return hr < 5 ? 'Working late' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'; };
const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');

// What is worth fixing before a recruiter sees the site
function health(site) {
  const out = [];
  const projects = site.projects.filter((p) => p.visible !== false);
  const noShot = projects.filter((p) => !(p.screenshots || []).length);
  out.push({ ok: !noShot.length, title: noShot.length ? plural(noShot.length, 'project') + ' without a screenshot' : 'Every project has a screenshot',
    items: noShot.slice(0, 4).map((p) => p.name), go: (name) => goTab('projects', 'open', name), fix: 'Open' });
  const thin = projects.filter((p) => String(p.desc || '').length < 80);
  out.push({ ok: !thin.length, title: thin.length ? plural(thin.length, 'project') + ' with a very short description' : 'Project descriptions are filled in',
    items: thin.slice(0, 4).map((p) => p.name), go: (name) => goTab('projects', 'open', name), fix: 'Open' });
  const flagship = projects.filter((p) => p.placement === 'flagship').length;
  out.push({ ok: flagship >= 1 && flagship <= 3, title: flagship === 0 ? 'No flagship project: the big panels at the top are empty' : flagship > 3 ? flagship + ' flagship panels is a lot; 1 to 3 reads best' : plural(flagship, 'flagship panel') + ' showcased',
    go: () => goTab('projects'), fix: 'Review' });
  const linked = site.writing.filter((w) => (w.url || '').trim());
  out.push({ ok: linked.length > 0 || site.sections.writing.visible === false, title: linked.length ? plural(linked.length, 'article') + ' linked in Writing' : 'Writing has no linked articles, so the section is hidden',
    go: () => goTab('writing'), fix: 'Add' });
  const bare = site.changelog.filter((c) => !(c.format === 'bullets' ? (c.bullets || []).some(Boolean) : (c.note || '').trim()));
  out.push({ ok: !bare.length && site.changelog.length > 0, title: !site.changelog.length ? 'No experience added yet' : bare.length ? plural(bare.length, 'experience entry') + ' without a description' : 'Experience entries are described',
    items: bare.slice(0, 3).map((c) => (c.role || 'Entry') + (c.org ? ' at ' + c.org : '')), go: (_, i) => goTab('experience', 'open', site.changelog.indexOf(bare[i])), fix: 'Open' });
  const mail = site.socials.some((s) => /^mailto:/i.test(s.url || ''));
  out.push({ ok: mail, title: mail ? 'Email link is set for the contact form' : 'No email link: add one under Links', go: () => goTab('links'), fix: 'Add' });
  out.push({ ok: (site.identity.bio || []).filter((b) => b.trim()).length >= 2, title: 'About section has at least two paragraphs', go: () => goTab('about'), fix: 'Edit' });
  const rv = Number(site.identity.resumeVersion);
  out.push({ ok: true, info: true, title: rv ? 'Resume last replaced ' + new Date(rv).toLocaleDateString() : 'Resume is the original file', go: () => goTab('resume'), fix: 'Replace' });
  return out;
}

function ring(done, total) {
  const r = h('div', { class: 'ring ' + (done === total ? 'full' : done >= total - 2 ? 'mid' : 'low'), role: 'img', 'aria-label': done + ' of ' + total + ' checks passed' }, h('b', {}, String(done)), h('i', {}, '/' + total));
  r.style.setProperty('--pct', String((done / total) * 100));
  return r;
}

export function overviewEditor() {
  const site = state.site;
  const first = (site.identity.name || '').split(' ')[0] || 'there';
  const n = state.dirty ? changes().length + pendingCount() : 0;
  const items = health(site);
  const real = items.filter((i) => !i.info);
  const passed = real.filter((i) => i.ok).length;

  const act = (label, ic, fn, primary) => h('button', { type: 'button', class: 'btn' + (primary ? ' primary' : ''), onclick: fn }, icon(ic, 16), label);
  const tile = (value, label, sub, tab) => h('button', { type: 'button', class: 'tile', onclick: () => goTab(tab) },
    h('b', {}, String(value)), h('span', { class: 'tl' }, label), sub ? h('span', { class: 'ts' }, sub) : null);

  const flag = site.projects.filter((p) => p.placement === 'flagship').length;
  const feat = site.projects.filter((p) => p.placement === 'featured').length;
  const avg = site.projects.length ? Math.round((site.projects.reduce((a, p) => a + completeness(p).done / completeness(p).total, 0) / site.projects.length) * 100) : 0;

  const activity = h('div', {}, skeleton(3));
  api.history().then(({ commits }) => {
    activity.replaceChildren(commits.length ? h('ul', { class: 'timeline' }, commits.slice(0, 5).map((c, i) => h('li', {},
      h('span', { class: 'dot' + (i === 0 ? ' now' : '') }), h('div', {}, h('span', { class: 'tm' }, c.message), h('span', { class: 'td' }, new Date(c.date).toLocaleString()))))) : h('p', { class: 'empty' }, 'No publishes yet.'));
  }).catch(() => { activity.replaceChildren(h('p', { class: 'empty' }, 'Could not load the history.')); });

  return h('div', { class: 'stack' },
    h('section', { class: 'welcome' },
      h('div', {},
        h('h2', {}, greeting() + ', ' + first + '.'),
        h('p', {}, n ? plural(n, 'change') + ' waiting to be published. Review them when you are ready.' : 'Everything you have written is live. Pick something to improve below.')),
      h('div', { class: 'bar' },
        act('Import from GitHub', 'github', () => goTab('projects', 'import'), true),
        act('Add experience', 'brief', () => goTab('experience', 'add')),
        act('Edit headline', 'home', () => goTab('hero')),
        n ? act('Review & publish', 'rocket', () => goTab('publish')) : null)),
    h('div', { class: 'tiles' },
      tile(site.projects.length, 'Projects', flag + ' flagship · ' + feat + ' featured', 'projects'),
      tile(site.changelog.length, 'Experience entries', null, 'experience'),
      tile(site.modules.length, 'Skill groups', site.modules.reduce((a, m) => a + (m.items || []).length, 0) + ' skills', 'skills'),
      tile(avg + '%', 'Project completeness', 'average of 5 quick checks', 'projects'),
      tile(site.socials.length, 'Links', null, 'links')),
    h('div', { class: 'two' },
      h('section', { class: 'card' },
        h('div', { class: 'card-head' }, h('h3', {}, 'Site health'), ring(passed, real.length)),
        h('ul', { class: 'health' }, items.map((it) => h('li', { class: it.ok ? 'ok' : 'todo' },
          h('span', { class: 'hi', 'aria-hidden': 'true' }, icon(it.ok ? 'check' : 'alert', 16)),
          h('div', { class: 'ht' }, h('span', {}, it.title),
            it.items && it.items.length ? h('div', { class: 'hl' }, it.items.map((name, i) => h('button', { type: 'button', class: 'pillbtn', onclick: () => it.go(name, i) }, name))) : null),
          !it.items || !it.items.length ? h('button', { type: 'button', class: 'linkbtn', onclick: () => it.go() }, it.fix) : null)))),
      h('section', { class: 'card' },
        h('h3', {}, 'Recent publishes'), activity,
        h('div', { class: 'tips' }, h('p', { class: 'hint' }, 'Tips'),
          h('ul', {}, h('li', {}, h('kbd', {}, 'Ctrl K'), ' jumps to any page or project'),
            h('li', {}, 'Click anything in the preview to edit it'),
            h('li', {}, h('kbd', {}, '?'), ' shows all shortcuts'))))));
}
