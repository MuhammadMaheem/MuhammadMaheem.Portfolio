import { h, field, text, select, toggle, chips, listEditor, toast, slug } from '../ui.js';
import { state, touch, addPending, dropPending, imgSrc, usedPaths } from '../store.js';
import { newProject, newShowcase, validDate } from '../schema.js';
import { prepareImage, nextName } from '../images.js';
import { openImporter } from './importer.js';

const open = new WeakSet();
const PLACEMENTS = [['flagship', 'Flagship (big panel at the top)'], ['featured', 'Featured (first in the grid)'], ['normal', 'Normal']];
const BADGE = { flagship: 'Flagship', featured: 'Featured', normal: '' };

export const folderFor = (p) => slug((p.repo && p.repo.name) || p.name);

function allUsed() {
  const used = usedPaths();
  state.pending.forEach((_, k) => used.add(k.replace(/^public\//, '')));
  return used;
}

// store a prepared image under screenshots/<project>/ and return its site-relative path
export async function stageImage(p, file, nameHint) {
  const { blob, ext } = await prepareImage(file);
  const rel = nextName(folderFor(p), nameHint || file.name, ext, allUsed());
  await addPending('public/' + rel, blob);
  return rel;
}

function gallery(p, redrawAll) {
  const box = h('div', { class: 'gallery' });
  const grid = h('div', { class: 'thumbs' });
  const drop = h('label', { class: 'drop' }, 'Drop images here or click to choose',
    h('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif', multiple: true, class: 'sr', onchange: (e) => add(e.target.files) }));
  async function add(files) {
    let n = 0;
    for (const f of [...files]) {
      try { p.screenshots.push(await stageImage(p, f)); n++; } catch (e) { toast(f.name + ': ' + e.message, 'err'); }
    }
    if (n) { touch(); draw(); redrawAll && redrawAll(); toast(n + ' image' + (n > 1 ? 's' : '') + ' added. They go live when you publish.'); }
  }
  ['dragover', 'dragenter'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, () => drop.classList.remove('over')));
  drop.addEventListener('drop', (e) => { e.preventDefault(); add(e.dataTransfer.files); });

  function draw() {
    grid.replaceChildren();
    p.screenshots.forEach((rel, i) => {
      const move = (d) => { const j = i + d; if (j < 0 || j >= p.screenshots.length) { return; } [p.screenshots[i], p.screenshots[j]] = [p.screenshots[j], p.screenshots[i]]; touch(); draw(); };
      grid.appendChild(h('figure', { class: 'thumb' },
        h('img', { src: imgSrc(rel), alt: 'Screenshot ' + (i + 1), loading: 'lazy' }),
        i === 0 ? h('span', { class: 'cover' }, 'Cover') : null,
        state.pending.has('public/' + rel) ? h('span', { class: 'new' }, 'New') : null,
        h('div', { class: 'thumb-tools' },
          h('button', { type: 'button', class: 'icon', 'aria-label': 'Move earlier', disabled: i === 0, onclick: () => move(-1) }, '←'),
          h('button', { type: 'button', class: 'icon', 'aria-label': 'Move later', disabled: i === p.screenshots.length - 1, onclick: () => move(1) }, '→'),
          h('button', { type: 'button', class: 'icon danger', 'aria-label': 'Remove image', onclick: async () => {
            p.screenshots.splice(i, 1);
            if (p.showcase) { p.showcase.shots = (p.showcase.shots || []).filter((s) => s !== rel); if (p.showcase.banner === rel) { p.showcase.banner = ''; } }
            if (state.pending.has('public/' + rel)) { await dropPending('public/' + rel); }
            touch(); draw(); redrawAll && redrawAll();
          } }, '✕'))));
    });
    if (!p.screenshots.length) { grid.appendChild(h('p', { class: 'empty' }, 'No images yet. Without one, the card shows a generated placeholder.')); }
  }
  draw();
  box.append(grid, drop);
  return box;
}

function showcaseEditor(p) {
  if (!p.showcase) {
    const max = Math.max(0, ...state.site.projects.map((x) => (x.showcase && x.showcase.order) || 0));
    p.showcase = newShowcase(p, max + 1);
  }
  const sc = p.showcase;
  sc.points = sc.points || []; sc.shots = sc.shots || [];
  const pick = h('div', { class: 'thumbs small' });
  const drawPick = () => {
    pick.replaceChildren();
    if (!p.screenshots.length) { pick.appendChild(h('p', { class: 'empty' }, 'Add screenshots above first.')); }
    p.screenshots.forEach((rel) => {
      const on = sc.shots.includes(rel);
      pick.appendChild(h('button', { type: 'button', class: 'pickimg' + (on ? ' on' : ''), 'aria-pressed': String(on), title: on ? 'In the panel' : 'Click to use in the panel', onclick: () => {
        sc.shots = on ? sc.shots.filter((s) => s !== rel) : p.screenshots.filter((s) => sc.shots.includes(s) || s === rel);
        touch(); drawPick();
      } }, h('img', { src: imgSrc(rel), alt: '' }), on ? h('span', {}, '✓') : null));
    });
  };
  drawPick();
  const banner = select(sc, 'banner', [['', '(none)'], ...p.screenshots.map((s) => [s, s.split('/').pop()])]);
  return h('div', { class: 'stack tight flagship-box' },
    h('h4', {}, 'Big panel details'),
    h('div', { class: 'grid3' },
      field('Panel style', select(sc, 'kind', [['web', 'Web app (browser windows)'], ['game', 'Mobile game (phones and banner)']])),
      field('Small label', text(sc, 'kicker')),
      field('Order among panels', text(sc, 'order', { type: 'number' }))),
    field('Panel title', text(sc, 'title')),
    field('One-sentence pitch', text(sc, 'pitch', { multi: true, rows: 2 })),
    h('h4', {}, 'Three key points'),
    listEditor({
      items: sc.points, addLabel: 'Add point', newItem: () => '',
      renderItem: (_, i) => { const proxy = { get v() { return sc.points[i]; }, set v(x) { sc.points[i] = x; } }; return text(proxy, 'v'); },
      itemLabel: () => 'point',
    }),
    h('h4', {}, 'Images used in the panel'),
    h('p', { class: 'hint' }, 'Click images to include them (web panels show 2, game panels show 3). The order follows the gallery.'),
    pick,
    sc.kind === 'game' ? field('Banner image (game cover art)', banner) : null);
}

function projectBody(p, redrawRow) {
  const body = h('div', { class: 'stack tight' });
  const draw = () => {
    body.replaceChildren(
      h('div', { class: 'grid3' },
        field('Name', text(p, 'name', { onInput: redrawRow })),
        field('Category', text(p, 'tag', { placeholder: 'RAG, Vision, Game…', list: 'tags' }), 'Used for the filter buttons.'),
        field('Year', text(p, 'year'))),
      field('Short summary (card)', text(p, 'blurb', { multi: true, rows: 2 })),
      field('Full description (popup)', text(p, 'desc', { multi: true, rows: 6 })),
      field('Your role', text(p, 'role', { multi: true, rows: 2 }), 'For example: Solo build, backend and UI.'),
      field('Tech used', chips(p.tech, { placeholder: 'Add a technology and press Enter' })),
      h('div', { class: 'grid2' },
        field('Where it appears', select(p, 'placement', PLACEMENTS, { onChange: () => { if (p.placement === 'flagship') { /* build panel fields */ } draw(); redrawRow(); } })),
        field('Built during (optional)', select(p, 'company', [['', 'Personal project'], ...state.site.changelog.map((c) => [c.id, (c.role || 'Entry') + ' at ' + (c.org || '?')])]), 'Visitors see which job or internship it came from.')),
      p.placement === 'flagship' ? showcaseEditor(p) : null,
      h('h4', {}, 'Screenshots'),
      gallery(p, draw),
      h('h4', {}, 'Links'),
      listEditor({
        items: p.links, addLabel: 'Add link', newItem: () => ({ label: 'GitHub', url: '' }),
        renderItem: (l) => h('div', { class: 'grid2' }, field('Label', text(l, 'label', { placeholder: 'GitHub, Live demo, Google Play' })), field('Link', text(l, 'url', { placeholder: 'https://…' }))),
        itemLabel: (l) => l.label || 'link',
      }),
      h('h4', {}, 'Worked on with'),
      listEditor({
        items: p.collaborators, addLabel: 'Add collaborator', newItem: () => ({ name: '', url: '' }),
        renderItem: (c) => h('div', { class: 'grid2' }, field('Name', text(c, 'name')), field('Profile link (optional)', text(c, 'url', { placeholder: 'https://github.com/…' }))),
        itemLabel: (c) => c.name || 'collaborator',
        emptyText: 'Solo project.',
      }),
      h('div', { class: 'grid2' },
        field('Started (optional)', text(p, 'start', { placeholder: 'YYYY-MM' })),
        field('Finished (optional)', text(p, 'end', { placeholder: 'YYYY-MM' }))),
      p.repo ? h('p', { class: 'hint' }, 'Imported from GitHub: ' + p.repo.fullName + (p.repo.private ? ' (private, so no source link is shown).' : '.')) : null,
      toggle(p, 'visible', 'Show on the site'));
    // `visible` defaults to true when missing
    if (p.visible === undefined) { p.visible = true; }
  };
  draw();
  return body;
}

export function projectsEditor() {
  const site = state.site;
  const root = h('div', { class: 'stack' });
  const dl = h('datalist', { id: 'tags' }, [...new Set(site.projects.map((p) => p.tag))].map((t) => h('option', { value: t })));
  const bar = h('div', { class: 'bar' },
    h('button', { type: 'button', class: 'btn primary', onclick: () => openImporter((p) => { open.add(p); redraw(); }) }, 'Import from GitHub'),
    h('button', { type: 'button', class: 'btn', onclick: () => { const p = newProject(); site.projects.unshift(p); open.add(p); touch(); redraw(); } }, 'Add manually'),
    h('span', { class: 'hint' }, 'Projects are shown in this order. Flagship ones become big panels.'));
  const holder = h('div');
  function redraw() {
    holder.replaceChildren(listEditor({
      items: site.projects, emptyText: 'No projects yet.',
      itemLabel: (p) => p.name,
      renderItem: (p) => {
        const head = h('button', { type: 'button', class: 'proj-head', 'aria-expanded': String(open.has(p)), onclick: () => { open.has(p) ? open.delete(p) : open.add(p); redraw(); } });
        const paintHead = () => {
          head.replaceChildren(
            h('img', { src: imgSrc(p.screenshots[0]), alt: '', class: 'mini', hidden: !p.screenshots[0] }),
            h('span', { class: 'ph-name' }, p.name || '(untitled)'),
            BADGE[p.placement] ? h('span', { class: 'badge ' + p.placement }, BADGE[p.placement]) : null,
            p.visible === false ? h('span', { class: 'badge off' }, 'Hidden') : null,
            h('span', { class: 'ph-tag' }, p.tag),
            h('span', { class: 'chev' }, open.has(p) ? '▾' : '▸'));
          head.setAttribute('aria-expanded', String(open.has(p)));
        };
        paintHead();
        return h('div', {}, head, open.has(p) ? projectBody(p, paintHead) : null);
      },
    }));
  }
  redraw();
  root.append(dl, bar, holder);
  return root;
}
