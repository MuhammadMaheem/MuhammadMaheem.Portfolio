let onAuthLost = () => {};
export const setAuthLostHandler = (f) => { onAuthLost = f; };

async function call(method, path, body, raw) {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: { 'x-admin': '1', ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (raw && res.ok) { return res; }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== '/api/login') { onAuthLost(); }
  if (!res.ok) { throw Object.assign(new Error(data.error || 'Request failed (' + res.status + ')'), { status: res.status, data }); }
  return data;
}

const q = (o) => '?' + new URLSearchParams(o).toString();

export const api = {
  login: (password, code) => call('POST', '/api/login', { password, code }),
  logout: () => call('POST', '/api/logout', {}),
  session: () => call('GET', '/api/session'),
  content: () => call('GET', '/api/content'),
  repos: (query) => call('GET', '/api/repos' + q({ q: query || '' })),
  repo: (name) => call('GET', '/api/repo' + q({ name })),
  assetBlob: async (params) => (await call('GET', '/api/asset' + q(params), null, true)).blob(),
  upload: (path, b64) => call('POST', '/api/upload', { path, b64 }),
  publish: (payload) => call('POST', '/api/publish', payload),
  history: () => call('GET', '/api/history'),
  restore: (sha) => call('POST', '/api/restore', { sha }),
  deploy: (sha) => call('GET', '/api/deploy-status' + q({ sha })),
};
