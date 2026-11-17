// Turning a GitHub repo (README + file tree) into something the admin can pre-fill.
// Pure functions, no network.

const IMG_EXT = /\.(png|jpe?g|webp|gif)$/i;
const SKIP_DIR = /(^|\/)(node_modules|\.git|\.github|dist|build|vendor|__pycache__|\.next|venv)(\/|$)/i;
const SHOT_DIR = /(screenshot|screens?|docs?|assets?|images?|img|media|demo|preview|gallery|figures?)/i;

export const isImagePath = (p) => IMG_EXT.test(p);

const decode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };

export function readmeImages(text) {
  const out = [];
  const seen = new Set();
  const add = (src, alt) => {
    const s = String(src || '').trim().replace(/^<|>$/g, '');
    if (!s || seen.has(s) || /^data:/i.test(s)) { return; }
    // badges (shields.io, etc.) are not screenshots
    if (/shields\.io|badge|img\.shields|travis-ci|codecov|github\.com\/[^/]+\/[^/]+\/(actions|workflows)/i.test(s)) { return; }
    seen.add(s);
    out.push({ src: s, alt: String(alt || '').slice(0, 120) });
  };
  for (const m of text.matchAll(/!\[([^\]]*)\]\(\s*(<[^>]+>|[^)\s]+)/g)) { add(m[2], m[1]); }
  for (const m of text.matchAll(/<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    const alt = (m[0].match(/\balt\s*=\s*["']([^"']*)["']/i) || [])[1];
    add(m[1], alt);
  }
  return out;
}

const dirname = (p) => (p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '');

function normalise(path) {
  const out = [];
  for (const seg of path.split('/')) {
    if (!seg || seg === '.') { continue; }
    if (seg === '..') { out.pop(); } else { out.push(seg); }
  }
  return out.join('/');
}

// Map a README image reference to a path inside the repo, or say why we cannot copy it.
export function resolveImage(src, { owner, repo, readmePath = 'README.md', tree }) {
  const set = tree instanceof Set ? tree : new Set(tree);
  let m = src.match(/^https?:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/[^/]+\/(.+?)(?:\?.*)?$/i);
  if (!m) { m = src.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/[^/]+\/(.+?)(?:\?.*)?$/i); }
  if (m) {
    if (m[1].toLowerCase() === owner.toLowerCase() && m[2].toLowerCase() === repo.toLowerCase()) {
      const p = decode(m[3]);
      return set.has(p) ? { path: p } : { reason: 'File not found in the repo' };
    }
    return { reason: 'Image belongs to a different repo' };
  }
  if (/^https?:\/\//i.test(src)) {
    if (/^https:\/\/(github\.com\/user-attachments\/assets\/|user-images\.githubusercontent\.com\/)/i.test(src)) {
      return { url: src };
    }
    return { reason: 'External image, upload it manually' };
  }
  const clean = decode(src.split(/[?#]/)[0]);
  const p = clean.startsWith('/') ? normalise(clean) : normalise(dirname(readmePath) + '/' + clean);
  return set.has(p) ? { path: p } : { reason: 'File not found in the repo' };
}

// Image files in screenshot-like folders (or the repo root), best first.
export function folderImages(treeEntries, limit = 40) {
  return treeEntries
    .filter((e) => e.type === 'blob' && isImagePath(e.path) && !SKIP_DIR.test(e.path) && (e.size || 0) <= 8 * 1024 * 1024)
    .map((e) => {
      const dir = dirname(e.path);
      const score = (SHOT_DIR.test(dir) ? 2 : 0) + (dir === '' ? 1 : 0) - (/(icon|favicon|logo|avatar|sprite)/i.test(e.path) ? 3 : 0);
      return { path: e.path, size: e.size || 0, score };
    })
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))
    .slice(0, limit)
    .map(({ path, size }) => ({ path, size }));
}

const plain = (t) => t
  .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/<[^>]+>/g, '')
  .replace(/[*_`~]+/g, '')
  .replace(/\s+/g, ' ')
  .trim();

// First real paragraphs and a few feature bullets, as plain text.
export function readmeText(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  const paras = [];
  let cur = [];
  let inCode = false;
  let seenHeading = false;
  const flush = () => { if (cur.length) { paras.push(cur.join(' ')); cur = []; } };
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith('```')) { inCode = !inCode; flush(); continue; }
    if (inCode) { continue; }
    if (/^#{1,6}\s/.test(line)) {
      flush();
      if (seenHeading && paras.length) { break; }
      seenHeading = true;
      continue;
    }
    if (!line) { flush(); continue; }
    if (/^(\||>|[-*+]\s|\d+\.\s|<!--|\[!\[|!\[|<(img|p|div|a|br|hr|h\d|picture|source|table|details|summary))/i.test(line)) { flush(); continue; }
    cur.push(line);
  }
  flush();
  const cleaned = paras.map(plain).filter((p) => p.length > 30);
  let intro = cleaned.slice(0, 2).join(' ');
  if (intro.length > 900) { intro = intro.slice(0, 900).replace(/\s+\S*$/, '') + '...'; }

  const bullets = [];
  let feature = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (/^#{1,6}\s/.test(line)) { feature = /(feature|highlight|what it|capabilit|key )/i.test(line); continue; }
    if (feature && /^[-*+]\s+/.test(line)) {
      const b = plain(line.replace(/^[-*+]\s+/, ''));
      if (b.length > 8 && bullets.length < 5) { bullets.push(b.length > 120 ? b.slice(0, 117).replace(/\s+\S*$/, '') + '...' : b); }
    }
  }
  return { intro, bullets };
}

export function prettyName(repo) {
  return repo.replace(/[-_.]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}
