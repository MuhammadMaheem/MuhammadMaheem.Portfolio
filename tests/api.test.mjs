import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { makeApi } from '../api/_lib/handlers.js';
import { sign, uaTag, _resetLoginLimits } from '../api/_lib/auth.js';
import { hotp, base32Decode, base32Encode, verifyTotp, _resetTotp } from '../api/_lib/totp.js';
import { parseDataJs, checkWritePath } from '../api/_lib/validate.js';
import { createFakeGithub } from './fake-github.mjs';

// a random password per run: nothing real is ever written into the tests
const PASSWORD = randomBytes(12).toString('hex');
const SECRET = randomBytes(32).toString('hex');
const env = { password: PASSWORD, secret: SECRET, token: 'tok', importToken: 'tok2', owner: 'MuhammadMaheem', repo: 'MuhammadMaheem.Portfolio', branch: 'main', loginDelayMs: 0 };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

const UA = 'test-browser/1.0';
const goodCookie = (secret = SECRET, extra = {}) => '__Host-adm=' + sign({ exp: Date.now() / 1000 + 600, v: 2, ua: uaTag(UA), ...extra }, secret);

function setup(envOver = {}) {
  _resetLoginLimits(); _resetTotp();
  const gh = createFakeGithub();
  const api = makeApi({ env: { ...env, ...envOver }, fetchImpl: gh.fetch });
  const call = (method, path, { body, query = {}, headers = {}, cookie = true } = {}) => api.handle({
    method, path, query, body,
    headers: { host: 'admin.test', 'x-admin': '1', origin: 'https://admin.test', 'user-agent': UA, 'content-type': 'application/json', ...(cookie ? { cookie: goodCookie() } : {}), ...headers },
    ip: '1.2.3.4',
  });
  return { gh, api, call };
}
const parse = (r) => JSON.parse(r.body);

test('login: wrong password is refused, right password sets a session cookie', async () => {
  const { call } = setup();
  const bad = await call('POST', '/api/login', { body: { password: 'nope' }, cookie: false });
  assert.equal(bad.status, 401);
  const ok = await call('POST', '/api/login', { body: { password: PASSWORD }, cookie: false });
  assert.equal(ok.status, 200);
  assert.match(ok.headers['set-cookie'], /^__Host-adm=/);
  assert.match(ok.headers['set-cookie'], /HttpOnly/);
  assert.match(ok.headers['set-cookie'], /SameSite=Strict/);
  assert.match(ok.headers['set-cookie'], /Secure/);
  assert.match(ok.headers['set-cookie'], /Path=\//);
});

test('login locks after repeated failures', async () => {
  const { call } = setup();
  for (let i = 0; i < 5; i++) { await call('POST', '/api/login', { body: { password: 'x' + i }, cookie: false }); }
  const r = await call('POST', '/api/login', { body: { password: PASSWORD }, cookie: false });
  assert.equal(r.status, 429);
});

test('login is unavailable when the server is not configured', async () => {
  const api = makeApi({ env: { ...env, password: '' }, fetchImpl: () => { throw new Error('no network'); } });
  const r = await api.handle({ method: 'POST', path: '/api/login', query: {}, body: { password: 'x' }, headers: { host: 'a' }, ip: '9.9.9.9' });
  assert.equal(r.status, 503);
});

test('protected endpoints refuse missing, forged and expired sessions, and missing header or foreign origin', async () => {
  const { call } = setup();
  assert.equal((await call('GET', '/api/session', { cookie: false })).status, 401);
  assert.equal((await call('GET', '/api/session', { headers: { cookie: goodCookie('f'.repeat(32)) } })).status, 401);
  assert.equal((await call('GET', '/api/session', { headers: { cookie: goodCookie(SECRET, { exp: 1 }) } })).status, 401);
  assert.equal((await call('GET', '/api/session', { headers: { cookie: 'adm=' + goodCookie().split('=')[1] } })).status, 401, 'the plain name is not accepted on https hosts');
  assert.equal((await call('GET', '/api/session', { headers: { 'user-agent': 'another-browser' } })).status, 401, 'a copied cookie does not work from another browser');
  assert.equal((await call('POST', '/api/logout', { headers: { 'content-type': 'text/plain' } })).status, 415, 'POST must be JSON');
  assert.equal((await call('GET', '/api/session', { headers: { 'x-admin': '0' } })).status, 403);
  assert.equal((await call('GET', '/api/session', { headers: { origin: 'https://evil.test' } })).status, 403);
  assert.equal((await call('GET', '/api/session')).status, 200);
});

test('content returns the parsed site and its blob sha', async () => {
  const { call } = setup();
  const r = await call('GET', '/api/content');
  assert.equal(r.status, 200);
  const d = parse(r);
  assert.equal(d.site.identity.name, 'Muhammad Maheem');
  assert.match(d.blob, /^[0-9a-f]{40}$/);
});

test('write paths are allowlisted', () => {
  ['public/screenshots/App/01.png', 'public/screenshots/App/sub/a b.jpg', 'public/Muhammad-Maheem-Resume.pdf', 'public/data.js'].forEach((p) => assert.equal(checkWritePath(p), p));
  ['index.html', 'api/login.js', 'public/screenshots/../../api/x.png', 'public/screenshots/a/b.svg', 'public/screenshots/a/b.html', '.github/workflows/pages.yml', 'public/render.js', 'public/screenshots/' + 'a/'.repeat(6) + 'x.png']
    .forEach((p) => assert.throws(() => checkWritePath(p), (e) => e.status === 400, p));
});

test('upload checks type and magic bytes, then returns a blob sha', async () => {
  const { call } = setup();
  const ok = await call('POST', '/api/upload', { body: { path: 'public/screenshots/New/01.png', b64: PNG.toString('base64') } });
  assert.equal(ok.status, 200);
  assert.match(parse(ok).sha, /^[0-9a-f]{40}$/);
  const lie = await call('POST', '/api/upload', { body: { path: 'public/screenshots/New/01.png', b64: Buffer.from('<script>x</script>').toString('base64') } });
  assert.equal(lie.status, 415);
  const wrongPlace = await call('POST', '/api/upload', { body: { path: 'index.html', b64: PNG.toString('base64') } });
  assert.equal(wrongPlace.status, 400);
});

test('publish makes one commit with data.js and the uploaded image, then history and deploy status work', async () => {
  const { call, gh } = setup();
  const c = parse(await call('GET', '/api/content'));
  c.site.identity.tagline = 'Edited from the admin';
  const up = parse(await call('POST', '/api/upload', { body: { path: 'public/screenshots/New/01.png', b64: PNG.toString('base64') } }));
  const before = gh.state.commits.size;
  const r = await call('POST', '/api/publish', { body: { site: c.site, baseBlob: c.blob, files: [{ path: up.path, sha: up.sha }], message: 'Edit tagline' } });
  assert.equal(r.status, 200);
  const { sha } = parse(r);
  assert.equal(gh.state.head, sha);
  assert.equal(gh.state.commits.size, before + 1, 'exactly one new commit');
  assert.deepEqual(gh.state.file('public/screenshots/New/01.png'), PNG);
  const saved = parseDataJs(gh.state.file('public/data.js').toString());
  assert.equal(saved.identity.tagline, 'Edited from the admin');
  assert.equal(saved.projects.length, c.site.projects.length, 'nothing else lost');

  const hist = parse(await call('GET', '/api/history'));
  assert.equal(hist.commits[0].message, 'Edit tagline');
  const st = parse(await call('GET', '/api/deploy-status', { query: { sha } }));
  assert.equal(st.conclusion, 'success');
});

test('publish refuses when data.js changed elsewhere (409) and rejects bad content', async () => {
  const { call, gh } = setup();
  const c = parse(await call('GET', '/api/content'));
  gh.state.externalPush('public/data.js', Buffer.from(gh.state.file('public/data.js').toString() + '\n// edit elsewhere\n'));
  const r = await call('POST', '/api/publish', { body: { site: c.site, baseBlob: c.blob } });
  assert.equal(r.status, 409);
  assert.equal(parse(r).code, 'changed');
  const bad = await call('POST', '/api/publish', { body: { site: { identity: {} }, baseBlob: null } });
  assert.equal(bad.status, 400);
  const evil = await call('POST', '/api/publish', { body: { site: c.site, files: [{ path: 'index.html', sha: 'a'.repeat(40) }] } });
  assert.equal(evil.status, 400);
});

test('publish is refused when the branch moves during the commit (fast-forward only)', async () => {
  const { call, gh } = setup();
  const c = parse(await call('GET', '/api/content'));
  const realFetch = gh.fetch;
  const racing = makeApi({
    env,
    fetchImpl: async (url, init) => {
      if (init && init.method === 'PATCH') { gh.state.externalPush('README.md', Buffer.from('race')); }
      return realFetch(url, init);
    },
  });
  const r = await racing.handle({
    method: 'POST', path: '/api/publish', query: {}, body: { site: c.site, baseBlob: c.blob },
    headers: { host: 'admin.test', 'x-admin': '1', 'user-agent': UA, 'content-type': 'application/json', cookie: goodCookie() }, ip: 'r',
  });
  assert.equal(r.status, 409);
});

test('restore writes an earlier version as a new commit', async () => {
  const { call, gh } = setup();
  const first = gh.state.head;
  const c = parse(await call('GET', '/api/content'));
  c.site.identity.tagline = 'Changed';
  await call('POST', '/api/publish', { body: { site: c.site, baseBlob: c.blob } });
  const r = await call('POST', '/api/restore', { body: { sha: first } });
  assert.equal(r.status, 200);
  assert.deepEqual(gh.state.file('public/data.js'), gh.state.file('public/data.js', first), 'content is back to the original');
  assert.equal((await call('POST', '/api/restore', { body: { sha: 'zz' } })).status, 400);
});

test('repos: lists the owner repos, private ones flagged, search works', async () => {
  const { call } = setup();
  const all = parse(await call('GET', '/api/repos')).repos;
  assert.deepEqual(all.map((r) => r.name).sort(), ['Cool-Bot', 'Plain-Public']);
  assert.equal(all.find((r) => r.name === 'Cool-Bot').private, true);
  assert.equal(parse(await call('GET', '/api/repos', { query: { q: 'plain' } })).repos.length, 1);
});

test('repo import: images resolved, bots dropped, README read as plain text', async () => {
  const { call } = setup();
  const d = parse(await call('GET', '/api/repo', { query: { name: 'Cool-Bot' } }));
  assert.equal(d.meta.private, true);
  assert.deepEqual(d.languages.sort(), ['Python', 'TypeScript']);
  assert.deepEqual(d.contributors.map((c) => c.login).sort(), ['MuhammadMaheem', 'friend-dev']);
  assert.ok(d.contributors.find((c) => c.login === 'MuhammadMaheem').self);
  const paths = d.images.map((i) => i.path);
  assert.ok(paths.includes('docs/home.png') && paths.includes('docs/chat.png'));
  assert.ok(paths.includes('screenshots/extra.png'), 'folder scan finds extra screenshot');
  assert.ok(!paths.includes('src/logo.png'), 'logos in src are skipped');
  assert.ok(d.external.some((e) => e.url === 'https://example.com/x.png' && e.reason));
  assert.match(d.readme.intro, /retrieval chatbot/i);
  assert.ok(!d.readme.intro.includes('<'));
  assert.deepEqual(d.readme.bullets, ['Hybrid search with reranking', 'Quality gate before deploy']);
  assert.equal((await call('GET', '/api/repo', { query: { name: '../etc' } })).status, 400);
});

test('asset streams an image and refuses odd references', async () => {
  const { call } = setup();
  const r = await call('GET', '/api/asset', { query: { repo: 'Cool-Bot', path: 'docs/home.png' } });
  assert.equal(r.status, 200);
  assert.equal(r.headers['content-type'], 'image/png');
  assert.equal((await call('GET', '/api/asset', { query: { repo: 'Cool-Bot', path: '../../x.png' } })).status, 400);
  assert.equal((await call('GET', '/api/asset', { query: { repo: 'Cool-Bot', path: 'README.md' } })).status, 400);
  assert.equal((await call('GET', '/api/asset', { query: { url: 'http://169.254.169.254/x.png' } })).status, 400);
  assert.equal((await call('GET', '/api/asset', { query: { url: 'https://evil.test/x.png' } })).status, 400);
});

test('TOTP matches the RFC 6238 test vector and refuses wrong or replayed codes', () => {
  _resetTotp();
  const secret = base32Encode(Buffer.from('12345678901234567890'));
  assert.equal(hotp(base32Decode(secret), Math.floor(59 / 30), 8), '94287082');
  assert.equal(verifyTotp(secret, '287082', 59000), true);
  assert.equal(verifyTotp(secret, '287082', 59000), false, 'same code twice');
  assert.equal(verifyTotp(secret, '000000', 59000), false);
  assert.equal(verifyTotp(secret, 'abcdef', 59000), false);
  assert.equal(verifyTotp(secret, '287082', 59000 + 5 * 60000), false, 'expired code');
  assert.equal(verifyTotp('', 'anything'), true, 'off when no secret is configured');
});

test('login with 2FA needs password and a valid code, and reveals which part failed to nobody', async () => {
  const secret = base32Encode(randomBytes(20));
  const { call } = setup({ totpSecret: secret });
  const code = hotp(base32Decode(secret), Math.floor(Date.now() / 30000));
  const noCode = await call('POST', '/api/login', { body: { password: PASSWORD }, cookie: false });
  const badPw = await call('POST', '/api/login', { body: { password: 'x', code }, cookie: false });
  assert.equal(noCode.status, 401); assert.equal(badPw.status, 401);
  assert.equal(parse(noCode).error, parse(badPw).error, 'same message either way');
  const ok = await call('POST', '/api/login', { body: { password: PASSWORD, code }, cookie: false });
  assert.equal(ok.status, 200);
  const replay = await call('POST', '/api/login', { body: { password: PASSWORD, code }, cookie: false });
  assert.equal(replay.status, 401, 'a code works once');
});

test('content with script-capable links or forbidden keys is refused', async () => {
  const { call } = setup();
  const c = parse(await call('GET', '/api/content'));
  const evil = JSON.parse(JSON.stringify(c.site));
  evil.projects[0].links = [{ label: 'x', url: 'javascript:alert(1)' }];
  assert.equal((await call('POST', '/api/publish', { body: { site: evil, baseBlob: c.blob } })).status, 400);
  const evil2 = JSON.parse(JSON.stringify(c.site));
  evil2.socials[0].url = 'data:text/html,<script>1</script>';
  assert.equal((await call('POST', '/api/publish', { body: { site: evil2, baseBlob: c.blob } })).status, 400);
  const evil3 = JSON.parse('{"identity":{"name":"x"},"projects":[],"changelog":[],"modules":[],"socials":[],"__proto__":{"a":1},"x":{"constructor":1}}');
  assert.equal((await call('POST', '/api/publish', { body: { site: evil3 } })).status, 400);
  const fine = JSON.parse(JSON.stringify(c.site));
  fine.socials[0].url = 'https://github.com/x'; fine.projects[0].links = [{ label: 'a', url: 'screenshots/rel.png' }];
  assert.equal((await call('POST', '/api/publish', { body: { site: fine, baseBlob: c.blob } })).status, 200);
});
