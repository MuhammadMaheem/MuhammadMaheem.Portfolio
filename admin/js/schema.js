// Defaults and clean-up for the content file. Unknown keys are never removed.
export const SECTION_KEYS = [
  ['about', 'About'], ['skills', 'Skills'], ['projects', 'Projects'],
  ['experience', 'Experience'], ['writing', 'Writing'], ['contact', 'Contact'],
];
// these three can be hidden from the site; the others are structural
export const HIDEABLE = ['skills', 'experience', 'writing'];

export const uid = (prefix) => prefix + '-' + Math.random().toString(36).slice(2, 8);

export function normalize(site) {
  site.identity = site.identity || {};
  const id = site.identity;
  id.bio = Array.isArray(id.bio) ? id.bio : [];
  id.specs = Array.isArray(id.specs) ? id.specs : [];
  id.quote = id.quote || { text: '', by: '' };
  if (id.heroLabel === undefined) { id.heroLabel = 'MHM·01 // SYSTEM ONLINE'; }
  if (id.ctaPrimary === undefined) { id.ctaPrimary = 'View deployments'; }
  if (id.ctaSecondary === undefined) { id.ctaSecondary = 'Establish uplink'; }
  if (id.resumeLabel === undefined) { id.resumeLabel = 'Spec sheet'; }
  ['modules', 'projects', 'changelog', 'socials', 'writing', 'marquee'].forEach((k) => { if (!Array.isArray(site[k])) { site[k] = []; } });
  site.sections = site.sections || {};
  SECTION_KEYS.forEach(([k, label]) => {
    const s = site.sections[k] = site.sections[k] || {};
    if (s.nav === undefined) { s.nav = label; }
    if (s.eyebrow === undefined) { s.eyebrow = label; }
    if (s.title === undefined) { s.title = ''; }
    if (s.sub === undefined) { s.sub = ''; }
    if (s.visible === undefined) { s.visible = true; }
  });
  site.flow = site.flow || { label: '', title: '', sub: '', steps: [] };
  site.flow.steps = site.flow.steps || [];
  site.ask = site.ask || { questions: [] };
  site.ask.questions = site.ask.questions || [];
  site.changelog.forEach((c) => {
    if (!c.id) { c.id = uid('exp'); }
    c.type = c.type || 'other';
    c.format = c.format === 'bullets' ? 'bullets' : 'paragraph';
    c.bullets = Array.isArray(c.bullets) ? c.bullets : [];
  });
  site.projects.forEach((p) => {
    if (p.visible === undefined) { p.visible = true; }
    p.tech = p.tech || [];
    p.links = p.links || [];
    p.screenshots = p.screenshots || [];
    p.collaborators = p.collaborators || [];
    p.placement = ['flagship', 'featured', 'normal'].includes(p.placement) ? p.placement : 'normal';
  });
  return site;
}

export const newExperience = () => ({
  id: uid('exp'), type: 'internship', role: '', org: '', location: '', start: '', end: '', present: false,
  format: 'bullets', bullets: [''], note: '', url: '',
});

export const newProject = () => ({
  id: '', name: 'New project', tag: 'Project', year: String(new Date().getFullYear()), blurb: '', desc: '', role: '',
  tech: [], links: [], screenshots: [], collaborators: [], placement: 'normal', company: '',
});

export const newShowcase = (p, order) => ({
  order, kind: 'web', kicker: (p.tag || 'Project') + ' · ' + (p.year || ''), title: p.name || '', pitch: p.blurb || '',
  points: [], shots: (p.screenshots || []).slice(0, 2), banner: '',
});

// "2026-06" -> "Jun 2026", "2024" -> "2024"
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const validDate = (d) => !d || /^\d{4}(-(0[1-9]|1[0-2]))?$/.test(d);
export function fmtDate(d) {
  const m = String(d || '').match(/^(\d{4})(?:-(\d{2}))?$/);
  if (!m) { return d || ''; }
  return m[2] ? MON[+m[2] - 1] + ' ' + m[1] : m[1];
}
export const fmtRange = (s, e, present) => {
  const a = fmtDate(s); const b = present ? 'Present' : fmtDate(e);
  return a && b ? a + ' — ' + b : (a || b);
};

// Parse "https://github.com/me/Repo", "me/Repo" or "Repo" to a repo name
export function repoNameFromInput(v) {
  const s = String(v || '').trim().replace(/\.git$/, '').replace(/\/+$/, '');
  const m = s.match(/github\.com\/[^/]+\/([^/?#]+)/i) || s.match(/^[^/\s]+\/([^/\s]+)$/);
  return (m ? m[1] : s).trim();
}

// A short list of what changed between two versions, for the publish screen.
export function summarize(a, b) {
  const out = [];
  const names = (s) => new Map((s.projects || []).map((p) => [p.name, p]));
  const pa = names(a); const pb = names(b);
  [...pb.keys()].filter((n) => !pa.has(n)).forEach((n) => out.push('Added project: ' + n));
  [...pa.keys()].filter((n) => !pb.has(n)).forEach((n) => out.push('Removed project: ' + n));
  [...pb.keys()].filter((n) => pa.has(n) && JSON.stringify(pa.get(n)) !== JSON.stringify(pb.get(n))).forEach((n) => out.push('Edited project: ' + n));
  const ea = new Map((a.changelog || []).map((c) => [c.id, c])); const eb = new Map((b.changelog || []).map((c) => [c.id, c]));
  [...eb.keys()].filter((k) => !ea.has(k)).forEach((k) => out.push('Added experience: ' + (eb.get(k).role || '(untitled)')));
  [...ea.keys()].filter((k) => !eb.has(k)).forEach((k) => out.push('Removed experience: ' + (ea.get(k).role || '(untitled)')));
  [...eb.keys()].filter((k) => ea.has(k) && JSON.stringify(ea.get(k)) !== JSON.stringify(eb.get(k))).forEach((k) => out.push('Edited experience: ' + (eb.get(k).role || '(untitled)')));
  const skip = new Set(['projects', 'changelog']);
  Object.keys(b).filter((k) => !skip.has(k) && JSON.stringify(a[k]) !== JSON.stringify(b[k])).forEach((k) => out.push('Changed: ' + k));
  return out;
}
