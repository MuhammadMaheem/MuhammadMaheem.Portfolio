import { HttpError } from './http.js';

const API = 'https://api.github.com';

// Thin GitHub REST client. `fetchImpl` is injectable so tests can use a fake GitHub.
export function makeGithub({ token, fetchImpl = globalThis.fetch }) {
  async function call(method, path, body, opts = {}) {
    if (!token) { throw new HttpError(503, 'GitHub token is not configured on the server'); }
    const res = await fetchImpl(path.startsWith('http') ? path : API + path, {
      method,
      headers: {
        authorization: 'Bearer ' + token,
        accept: opts.accept || 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28',
        'user-agent': 'portfolio-admin',
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) {
      if (opts.binary) { return Buffer.from(await res.arrayBuffer()); }
      if (opts.text) { return res.text(); }
      return res.status === 204 ? null : res.json();
    }
    let detail = '';
    try { detail = (await res.json()).message || ''; } catch { /* no body */ }
    if (res.status === 401) { throw new HttpError(502, 'GitHub rejected the server token (expired or revoked)'); }
    if (res.status === 403 && /rate limit/i.test(detail)) { throw new HttpError(429, 'GitHub rate limit reached, try again later'); }
    if (res.status === 403) { throw new HttpError(502, 'The GitHub token lacks permission for this action'); }
    if (res.status === 404) { throw new HttpError(404, 'Not found on GitHub' + (detail ? ' (' + detail + ')' : '')); }
    if (res.status === 409 || res.status === 422) { throw new HttpError(409, 'GitHub refused the update: ' + detail); }
    throw new HttpError(502, 'GitHub error ' + res.status + (detail ? ': ' + detail : ''));
  }
  return {
    get: (p, o) => call('GET', p, null, o),
    post: (p, b) => call('POST', p, b),
    patch: (p, b) => call('PATCH', p, b),
  };
}

const enc = encodeURIComponent;

// Everything the admin does to the portfolio repo itself.
export function portfolioRepo(gh, { owner, repo, branch }) {
  const base = '/repos/' + owner + '/' + repo;
  const api = {
    base,
    headSha: async () => (await gh.get(base + '/git/ref/heads/' + enc(branch))).object.sha,
    commit: (sha) => gh.get(base + '/git/commits/' + sha),
    async file(path, ref) {
      const f = await gh.get(base + '/contents/' + path.split('/').map(enc).join('/') + '?ref=' + enc(ref || branch));
      return { sha: f.sha, text: Buffer.from(f.content || '', 'base64').toString('utf8') };
    },
    blob: async (b64) => (await gh.post(base + '/git/blobs', { content: b64, encoding: 'base64' })).sha,
    // one commit with any number of changed files: [{path, sha}] to write, [path] to delete
    async commitFiles({ message, writes, deletes = [] }) {
      const head = await api.headSha();
      const parent = await api.commit(head);
      const tree = await gh.post(base + '/git/trees', {
        base_tree: parent.tree.sha,
        tree: [
          ...writes.map((w) => ({ path: w.path, mode: '100644', type: 'blob', sha: w.sha })),
          ...deletes.map((p) => ({ path: p, mode: '100644', type: 'blob', sha: null })),
        ],
      });
      const commit = await gh.post(base + '/git/commits', { message, tree: tree.sha, parents: [head] });
      try {
        await gh.patch(base + '/git/refs/heads/' + enc(branch), { sha: commit.sha, force: false });
      } catch (e) {
        if (e.status === 409) { throw new HttpError(409, 'The site changed while you were publishing. Reload and try again.'); }
        throw e;
      }
      return commit.sha;
    },
    history: (path, n = 20) => gh.get(base + '/commits?sha=' + enc(branch) + '&path=' + enc(path) + '&per_page=' + n),
    runs: (sha) => gh.get(base + '/actions/runs?head_sha=' + enc(sha) + '&per_page=10'),
  };
  return api;
}
