// Small helpers shared by every endpoint.
export class HttpError extends Error {
  constructor(status, message, extra) {
    super(message);
    this.status = status;
    this.extra = extra || {};
  }
}

export const json = (status, data, headers) => ({
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...(headers || {}) },
  body: JSON.stringify(data),
});

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function readEnv(src = process.env) {
  return {
    password: src.ADMIN_PASSWORD || '',
    secret: src.SESSION_SECRET || '',
    token: src.GITHUB_TOKEN || '',
    importToken: src.GITHUB_IMPORT_TOKEN || src.GITHUB_TOKEN || '',
    owner: src.GITHUB_OWNER || 'MuhammadMaheem',
    repo: src.GITHUB_REPO || 'MuhammadMaheem.Portfolio',
    branch: src.GITHUB_BRANCH || 'main',
    loginDelayMs: src.LOGIN_DELAY_MS === undefined ? 400 : Number(src.LOGIN_DELAY_MS),
  };
}
