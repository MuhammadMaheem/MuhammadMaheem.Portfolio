import { makeApi } from './handlers.js';

// Adapts the framework-free handlers to Vercel's Node (req, res) functions.
let api;
export function vercelHandler(path) {
  return async function handler(req, res) {
    api = api || makeApi();
    const url = new URL(req.url, 'http://x');
    const result = await api.handle({
      method: req.method,
      path,
      query: Object.fromEntries(url.searchParams),
      headers: req.headers,
      body: req.body && typeof req.body === 'object' ? req.body : undefined,
      ip: req.socket && req.socket.remoteAddress,
    });
    res.statusCode = result.status;
    Object.entries(result.headers || {}).forEach(([k, v]) => res.setHeader(k, v));
    res.end(result.body);
  };
}
