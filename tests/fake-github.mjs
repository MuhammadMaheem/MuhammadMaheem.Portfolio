// An in-memory GitHub, just enough of the REST API for the admin: used by the unit tests
// and by `npm run dev:fake` so the real UI can be exercised without a token.
import { createHash } from 'node:crypto';
import fs from 'node:fs';

const sha1 = (kind, buf) => createHash('sha1').update(Buffer.concat([Buffer.from(kind + ' ' + buf.length + '\0'), buf])).digest('hex');
const png = () => Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

export const FIXTURE_README = [
  '# Cool Bot',
  '',
  '[![build](https://img.shields.io/badge/build-passing-green)](https://x.y)',
  '',
  'A retrieval chatbot that answers questions from private PDF files and cites every answer. <script>alert(1)</script>',
  '',
  'It ships with an evaluation harness that blocks bad releases from going out.',
  '',
  '## Features',
  '- Hybrid search with reranking',
  '- Quality gate before deploy',
  '',
  '![Home](docs/home.png)',
  '<img src="docs/chat.png" alt="Chat">',
  '![Remote](https://example.com/x.png)',
].join('\n');

export function createFakeGithub({ owner = 'MuhammadMaheem', repo = 'MuhammadMaheem.Portfolio', branch = 'main', dataJsPath } = {}) {
  const blobs = new Map(); // sha -> Buffer
  const trees = new Map(); // sha -> Map(path -> blobSha)
  const commits = new Map(); // sha -> {tree, parents, message, date}
  const put = (buf) => { const s = sha1('blob', buf); blobs.set(s, buf); return s; };
  const mkTree = (m) => { const s = sha1('tree', Buffer.from(JSON.stringify([...m.entries()].sort()))); trees.set(s, m); return s; };
  let clock = Date.parse('2026-11-01T10:00:00Z');
  const mkCommit = (tree, parents, message) => {
    clock += 60000;
    const s = sha1('commit', Buffer.from(JSON.stringify([tree, parents, message, clock])));
    commits.set(s, { tree, parents, message, date: new Date(clock).toISOString() });
    return s;
  };

  const initial = new Map();
  initial.set('public/data.js', put(fs.readFileSync(dataJsPath || 'public/data.js')));
  initial.set('public/screenshots/seed/01.png', put(png()));
  let head = mkCommit(mkTree(initial), [], 'Initial');

  const others = {
    'Cool-Bot': {
      private: true, description: 'Retrieval chatbot for private PDFs', language: 'Python', topics: ['rag', 'fastapi'],
      readme: FIXTURE_README,
      files: { 'docs/home.png': png(), 'docs/chat.png': png(), 'screenshots/extra.png': png(), 'src/logo.png': png() },
      contributors: [{ login: owner, contributions: 40 }, { login: 'friend-dev', contributions: 12 }, { login: 'dependabot[bot]', contributions: 3, type: 'Bot' }],
    },
    'Plain-Public': { private: false, description: 'No README images', language: 'TypeScript', topics: [], readme: '# Plain\n\nJust a small public tool for converting units on the command line.', files: {}, contributors: [{ login: owner, contributions: 5 }] },
  };

  const log = [];
  const J = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
  const err = (status, message) => J({ message }, status);
  const base = '/repos/' + owner + '/' + repo;
  const treeAt = (ref) => trees.get(commits.get(ref === branch ? head : ref).tree);

  async function fetchImpl(url, init = {}) {
    const u = new URL(url);
    const p = u.pathname;
    const method = (init.method || 'GET').toUpperCase();
    const body = init.body ? JSON.parse(init.body) : null;
    const accept = (init.headers && init.headers.accept) || '';
    log.push(method + ' ' + p + u.search);
    if (!/^Bearer \S+/.test((init.headers && init.headers.authorization) || '')) { return err(401, 'Bad credentials'); }

    if (p === base + '/git/ref/heads/' + branch) { return J({ object: { sha: head } }); }
    let m;
    if ((m = p.match(new RegExp('^' + base + '/git/commits/([0-9a-f]{40})$'))) && method === 'GET') {
      const c = commits.get(m[1]); return c ? J({ sha: m[1], tree: { sha: c.tree } }) : err(404, 'Not Found');
    }
    if (p === base + '/git/blobs' && method === 'POST') { return J({ sha: put(Buffer.from(body.content, 'base64')) }, 201); }
    if (p === base + '/git/trees' && method === 'POST') {
      const t = new Map(trees.get(body.base_tree));
      body.tree.forEach((e) => { if (e.sha === null) { t.delete(e.path); } else { if (!blobs.has(e.sha)) { return; } t.set(e.path, e.sha); } });
      return J({ sha: mkTree(t) }, 201);
    }
    if (p === base + '/git/commits' && method === 'POST') { return J({ sha: mkCommit(body.tree, body.parents, body.message) }, 201); }
    if (p === base + '/git/refs/heads/' + branch && method === 'PATCH') {
      const c = commits.get(body.sha);
      if (!c || c.parents[0] !== head) { return err(422, 'Update is not a fast forward'); }
      head = body.sha; return J({ ref: 'refs/heads/' + branch });
    }
    if ((m = p.match(new RegExp('^' + base + '/contents/(.+)$')))) {
      const path = decodeURIComponent(m[1]);
      const ref = u.searchParams.get('ref') || branch;
      if (ref !== branch && !commits.has(ref)) { return err(404, 'No commit found'); }
      const s = treeAt(ref).get(path);
      return s ? J({ sha: s, content: blobs.get(s).toString('base64'), encoding: 'base64' }) : err(404, 'Not Found');
    }
    if (p === base + '/commits') {
      const path = u.searchParams.get('path');
      const out = []; let cur = head;
      while (cur) {
        const c = commits.get(cur);
        const here = trees.get(c.tree).get(path);
        const prev = c.parents[0] ? trees.get(commits.get(c.parents[0]).tree).get(path) : null;
        if (here && here !== prev) { out.push({ sha: cur, commit: { message: c.message, author: { name: 'Admin', date: c.date } } }); }
        cur = c.parents[0];
      }
      return J(out);
    }
    if (p === base + '/actions/runs') { return J({ workflow_runs: [{ name: 'Deploy GitHub Pages', status: 'completed', conclusion: 'success', html_url: 'https://github.com/x/actions/runs/1' }] }); }

    if (p === '/user/repos') {
      return J(Object.entries(others).map(([name, r]) => ({ name, private: r.private, fork: false, archived: false, description: r.description, language: r.language, pushed_at: '2026-10-20T00:00:00Z', html_url: 'https://github.com/' + owner + '/' + name, owner: { login: owner } })));
    }
    if ((m = p.match(/^\/repos\/[^/]+\/([^/]+)(\/.*)?$/)) && others[m[1]]) {
      const r = others[m[1]]; const rest = m[2] || '';
      if (rest === '') { return J({ full_name: owner + '/' + m[1], name: m[1], private: r.private, description: r.description, topics: r.topics, language: r.language, homepage: '', html_url: 'https://github.com/' + owner + '/' + m[1], created_at: '2025-03-01T00:00:00Z', pushed_at: '2026-10-20T00:00:00Z', default_branch: 'main' }); }
      if (rest === '/languages') { return J({ Python: 1000, TypeScript: 200 }); }
      if (rest.startsWith('/contributors')) { return J(r.contributors.map((c) => ({ ...c, html_url: 'https://github.com/' + c.login }))); }
      if (rest === '/readme') { return new Response(r.readme, { status: 200 }); }
      if (rest.startsWith('/git/trees/')) { return J({ truncated: false, tree: [{ path: 'README.md', type: 'blob', size: 10 }, ...Object.entries(r.files).map(([path, b]) => ({ path, type: 'blob', size: b.length }))] }); }
      if (rest.startsWith('/contents/')) {
        const f = r.files[decodeURIComponent(rest.slice(10))];
        return f ? new Response(f, { status: 200 }) : err(404, 'Not Found');
      }
    }
    return err(404, 'Not Found: ' + method + ' ' + p);
  }

  return {
    fetch: fetchImpl,
    log,
    state: { get head() { return head; }, commits, trees, blobs, others, owner, repo, branch,
      file: (path, ref) => { const s = treeAt(ref || branch).get(path); return s ? blobs.get(s) : null; },
      // simulate an edit made elsewhere (e.g. a git push)
      externalPush(path, buf) { const t = new Map(trees.get(commits.get(head).tree)); t.set(path, put(buf)); head = mkCommit(mkTree(t), [head], 'External change'); } },
  };
}
