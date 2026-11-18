import { HttpError, json, sleep, readEnv } from './http.js';
import { requireAuth, passwordMatches, sessionCookie, clearCookie, loginAllowed, loginFailed, loginSucceeded, failDelayMs } from './auth.js';
import { matchTotp, markTotpUsed } from './totp.js';
import { makeGithub, portfolioRepo } from './github.js';
import { checkWritePath, checkMagic, MAX_FILE_BYTES, parseDataJs, serializeDataJs, validateSite } from './validate.js';
import { readmeImages, resolveImage, folderImages, readmeText, isImagePath } from './repoimport.js';

const NAME = /^[A-Za-z0-9._-]{1,100}$/;
const SHA = /^[0-9a-f]{40}$/;
const ASSET_TYPES = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };
const MAX_ASSET = 8 * 1024 * 1024;

// ctx = { env, fetchImpl }. Each handler gets (req, ctx) and returns a response object.
export function makeApi({ env: envIn, fetchImpl } = {}) {
  const env = envIn || readEnv();
  const writer = () => portfolioRepo(makeGithub({ token: env.token, fetchImpl }), env);
  const reader = () => makeGithub({ token: env.importToken, fetchImpl });

  const configured = () => env.password.length >= 8 && env.secret.length >= 32;

  const routes = {
    'POST /api/login': async (req) => {
      if (!configured()) { throw new HttpError(503, 'Admin is not configured on the server'); }
      const ip = String(req.headers['x-forwarded-for'] || req.ip || 'x').split(',')[0].trim();
      if (!loginAllowed(ip)) { throw new HttpError(429, 'Too many attempts. Try again in 15 minutes.'); }
      if (env.loginDelayMs) { await sleep(failDelayMs(ip, env.loginDelayMs)); }
      const body = req.body && typeof req.body === 'object' ? req.body : {};
      // both checks always run, and one message covers both, so nothing reveals which part was wrong
      const pwOk = passwordMatches(body.password, env.password);
      const step = env.totpSecret ? matchTotp(env.totpSecret, body.code) : 0;
      const codeOk = step !== null;
      if (!(pwOk && codeOk)) {
        loginFailed(ip);
        console.warn('admin login failed from ' + ip.replace(/(\d+\.\d+)\.\d+\.\d+/, '$1.x.x'));
        throw new HttpError(401, env.totpSecret ? 'Wrong password or code' : 'Wrong password');
      }
      loginSucceeded(ip);
      if (env.totpSecret) { markTotpUsed(env.totpSecret, step); }
      return json(200, { ok: true }, { 'set-cookie': sessionCookie(env.secret, req.headers.host, req.headers['user-agent']) });
    },

    'POST /api/logout': async (req) => json(200, { ok: true }, { 'set-cookie': clearCookie(req.headers.host) }),

    'GET /api/session': async () => json(200, {
      ok: true, owner: env.owner, repo: env.repo, branch: env.branch,
      canImportPrivate: !!env.importToken,
    }),

    // current site content and the blob SHA it came from (used to detect edits made elsewhere)
    'GET /api/content': async () => {
      const w = writer();
      const [head, file] = await Promise.all([w.headSha(), w.file('public/data.js')]);
      return json(200, { site: parseDataJs(file.text), blob: file.sha, head });
    },

    'GET /api/repos': async (req) => {
      const q = String(req.query.q || '').toLowerCase().slice(0, 60);
      const gh = reader();
      let list = [];
      for (let page = 1; page <= 2; page++) {
        const r = await gh.get('/user/repos?per_page=100&sort=pushed&affiliation=owner&page=' + page);
        list = list.concat(r);
        if (r.length < 100) { break; }
      }
      const out = list
        .filter((r) => r.owner && r.owner.login.toLowerCase() === env.owner.toLowerCase() && !r.archived)
        .filter((r) => !q || r.name.toLowerCase().includes(q) || String(r.description || '').toLowerCase().includes(q))
        .map((r) => ({
          name: r.name, private: !!r.private, fork: !!r.fork, description: r.description || '',
          language: r.language || '', pushedAt: r.pushed_at, url: r.html_url,
        }));
      return json(200, { repos: out });
    },

    'GET /api/repo': async (req) => {
      const name = String(req.query.name || '');
      if (!NAME.test(name)) { throw new HttpError(400, 'Bad repo name'); }
      const gh = reader();
      const base = '/repos/' + env.owner + '/' + name;
      const meta = await gh.get(base);
      const branch = meta.default_branch;
      const safe = (p) => p.catch(() => null);
      const [langs, contributors, readme, tree] = await Promise.all([
        safe(gh.get(base + '/languages')),
        safe(gh.get(base + '/contributors?per_page=20')),
        safe(gh.get(base + '/readme', { accept: 'application/vnd.github.raw+json', text: true })),
        safe(gh.get(base + '/git/trees/' + encodeURIComponent(branch) + '?recursive=1')),
      ]);
      const entries = (tree && tree.tree) || [];
      const paths = new Set(entries.filter((e) => e.type === 'blob').map((e) => e.path));
      const text = readme || '';
      const readmePath = [...paths].find((p) => /^readme(\.md|\.markdown|\.txt)?$/i.test(p)) || 'README.md';
      const fromReadme = [];
      const external = [];
      readmeImages(text).forEach((im) => {
        const r = resolveImage(im.src, { owner: env.owner, repo: name, readmePath, tree: paths });
        if (r.path && isImagePath(r.path)) { fromReadme.push({ path: r.path, alt: im.alt, source: 'readme' }); }
        else if (r.url) { external.push({ url: r.url, alt: im.alt, source: 'readme' }); }
        else { external.push({ url: im.src, alt: im.alt, reason: r.reason || 'Not copyable' }); }
      });
      const seen = new Set(fromReadme.map((i) => i.path));
      const folder = folderImages(entries).filter((i) => !seen.has(i.path)).map((i) => ({ ...i, source: 'folder' }));
      const { intro, bullets } = readmeText(text);
      return json(200, {
        meta: {
          name, fullName: meta.full_name, private: !!meta.private, description: meta.description || '',
          topics: meta.topics || [], language: meta.language || '', homepage: meta.homepage || '',
          url: meta.html_url, created: meta.created_at, pushed: meta.pushed_at, defaultBranch: branch,
        },
        languages: langs ? Object.keys(langs) : [],
        contributors: (contributors || [])
          .filter((c) => c.type !== 'Bot' && !/\[bot\]$/.test(c.login))
          .map((c) => ({ login: c.login, url: c.html_url, contributions: c.contributions, self: c.login.toLowerCase() === env.owner.toLowerCase() })),
        readme: { intro, bullets },
        images: [...fromReadme, ...folder],
        external,
        truncated: !!(tree && tree.truncated),
      });
    },

    // streams one image, so private-repo screenshots can be shown and copied without exposing the token
    'GET /api/asset': async (req) => {
      const name = String(req.query.repo || '');
      const path = String(req.query.path || '');
      const url = String(req.query.url || '');
      let buf;
      let ext;
      if (url) {
        if (!/^https:\/\/(github\.com\/user-attachments\/assets\/[0-9a-f-]+|user-images\.githubusercontent\.com\/[\w./-]+)$/i.test(url)) {
          throw new HttpError(400, 'URL not allowed');
        }
        const r = await (fetchImpl || fetch)(url, { redirect: 'follow' });
        if (!r.ok) { throw new HttpError(404, 'Image not reachable'); }
        buf = Buffer.from(await r.arrayBuffer());
        const t = r.headers.get('content-type') || '';
        ext = Object.keys(ASSET_TYPES).find((k) => ASSET_TYPES[k] === t.split(';')[0]);
      } else {
        if (!NAME.test(name) || !isImagePath(path) || path.includes('..') || path.length > 300) { throw new HttpError(400, 'Bad image reference'); }
        const gh = reader();
        buf = await gh.get('/repos/' + env.owner + '/' + name + '/contents/' + path.split('/').map(encodeURIComponent).join('/'), { accept: 'application/vnd.github.raw+json', binary: true });
        ext = path.split('.').pop().toLowerCase();
      }
      if (!ext || !ASSET_TYPES[ext]) { throw new HttpError(415, 'Not an image'); }
      if (buf.length > MAX_ASSET) { throw new HttpError(413, 'Image is larger than 8 MB'); }
      if (!checkMagic('x.' + ext, buf)) { throw new HttpError(415, 'File is not a real image'); }
      return { status: 200, headers: { 'content-type': ASSET_TYPES[ext], 'cache-control': 'private, max-age=300', 'x-content-type-options': 'nosniff' }, body: buf };
    },

    // one file becomes a git blob now; publish later refers to it by SHA
    'POST /api/upload': async (req) => {
      const { path, b64 } = req.body || {};
      checkWritePath(path);
      if (path === 'public/data.js') { throw new HttpError(400, 'Use publish for data.js'); }
      if (typeof b64 !== 'string' || !/^[A-Za-z0-9+/=]+$/.test(b64)) { throw new HttpError(400, 'Bad file data'); }
      const buf = Buffer.from(b64, 'base64');
      if (buf.length > MAX_FILE_BYTES) { throw new HttpError(413, 'File is larger than 3 MB'); }
      if (!checkMagic(path, buf)) { throw new HttpError(415, 'File type does not match its extension'); }
      return json(200, { sha: await writer().blob(b64), path });
    },

    'POST /api/publish': async (req) => {
      const { site, baseBlob, files = [], deletes = [], message } = req.body || {};
      validateSite(site);
      if (!Array.isArray(files) || !Array.isArray(deletes) || files.length > 60 || deletes.length > 60) { throw new HttpError(400, 'Too many files'); }
      const w = writer();
      const current = await w.file('public/data.js');
      if (baseBlob && current.sha !== baseBlob) {
        throw new HttpError(409, 'The site was changed somewhere else since you loaded it. Reload to merge.', { code: 'changed' });
      }
      files.forEach((f) => {
        checkWritePath(f.path);
        if (f.path === 'public/data.js') { throw new HttpError(400, 'data.js is written from the content field'); }
        if (!SHA.test(f.sha || '')) { throw new HttpError(400, 'Bad file reference'); }
      });
      deletes.forEach((p) => { checkWritePath(p); if (p === 'public/data.js') { throw new HttpError(400, 'Cannot delete data.js'); } });
      const dataSha = await w.blob(Buffer.from(serializeDataJs(site), 'utf8').toString('base64'));
      const msg = String(message || 'Update portfolio from admin').split('\n')[0].slice(0, 120);
      const sha = await w.commitFiles({
        message: msg,
        writes: [{ path: 'public/data.js', sha: dataSha }, ...files.map((f) => ({ path: f.path, sha: f.sha }))],
        deletes,
      });
      return json(200, { sha, blob: dataSha });
    },

    'GET /api/history': async () => {
      const list = await writer().history('public/data.js', 20);
      return json(200, {
        commits: list.map((c) => ({ sha: c.sha, message: c.commit.message.split('\n')[0], date: c.commit.author.date, author: c.commit.author.name })),
      });
    },

    'POST /api/restore': async (req) => {
      const sha = String((req.body && req.body.sha) || '');
      if (!SHA.test(sha)) { throw new HttpError(400, 'Bad commit'); }
      const w = writer();
      const old = await w.file('public/data.js', sha);
      validateSite(parseDataJs(old.text));
      const blob = await w.blob(Buffer.from(old.text, 'utf8').toString('base64'));
      const out = await w.commitFiles({ message: 'Restore content from ' + sha.slice(0, 7), writes: [{ path: 'public/data.js', sha: blob }] });
      return json(200, { sha: out });
    },

    'GET /api/deploy-status': async (req) => {
      const sha = String(req.query.sha || '');
      if (!SHA.test(sha)) { throw new HttpError(400, 'Bad commit'); }
      const r = await writer().runs(sha);
      const run = (r.workflow_runs || []).find((x) => /pages/i.test(x.name || '')) || (r.workflow_runs || [])[0];
      if (!run) { return json(200, { status: 'waiting' }); }
      return json(200, { status: run.status, conclusion: run.conclusion, url: run.html_url });
    },
  };

  async function handle(req) {
    try {
      const key = req.method + ' ' + req.path;
      const fn = routes[key];
      if (!fn) { throw new HttpError(404, 'No such endpoint'); }
      if (key !== 'POST /api/login') { requireAuth(req, env); }
      return await fn(req);
    } catch (e) {
      if (e instanceof HttpError) { return json(e.status, { error: e.message, ...e.extra }); }
      console.error('admin api error:', e && e.stack ? e.stack : e);
      return json(500, { error: 'Unexpected server error' });
    }
  }
  return { handle, routes };
}
