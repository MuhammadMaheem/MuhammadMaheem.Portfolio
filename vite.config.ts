import { defineConfig, loadEnv } from "vite";
import { randomBytes } from "node:crypto";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// Vanilla static site (HTML/CSS/JS + Three.js/anime.js via CDN).
// - GitHub Pages serves it under /MuhammadMaheem.Portfolio/.
// - Vercel (VERCEL=1) serves it at the root and also hosts /admin and /api.
const onVercel = !!process.env.VERCEL;

// data.js is rewritten by the admin panel, so its URL carries a content hash:
// a publish that only changes data.js is never served from a stale cache.
function stampDataVersion() {
  return {
    name: "stamp-data-version",
    transformIndexHtml(html: string) {
      const file = path.resolve(__dirname, "public/data.js");
      const hash = createHash("sha1").update(fs.readFileSync(file)).digest("hex").slice(0, 10);
      return html.replace(/data\.js\?v=[^"']*/g, "data.js?v=" + hash);
    },
  };
}


// `vite dev`: serve /api/* from the same handlers Vercel runs, so the admin works locally.
// FAKE_GITHUB=1 swaps GitHub for an in-memory copy (no token needed, nothing is pushed).
function devApi() {
  return {
    name: "dev-api",
    apply: "serve" as const,
    async configureServer(server: any) {
      const mode = server.config.mode;
      const fileEnv = loadEnv(mode, __dirname, "");
      const src: Record<string, string | undefined> = { ...fileEnv, ...process.env };
      let fetchImpl: any;
      if (src.FAKE_GITHUB === "1") {
        const { createFakeGithub } = await import(path.resolve(__dirname, "tests/fake-github.mjs"));
        fetchImpl = createFakeGithub({ dataJsPath: path.resolve(__dirname, "public/data.js") }).fetch;
        if (!src.ADMIN_PASSWORD) {
          src.ADMIN_PASSWORD = randomBytes(9).toString("hex");
          console.log("\n  [fake GitHub] admin password for this run: " + src.ADMIN_PASSWORD + "\n");
        }
        src.SESSION_SECRET = src.SESSION_SECRET || randomBytes(32).toString("hex");
        src.GITHUB_TOKEN = src.GITHUB_TOKEN || "fake";
        src.LOGIN_DELAY_MS = src.LOGIN_DELAY_MS || "0";
      }
      const { makeApi } = await import(path.resolve(__dirname, "api/_lib/handlers.js"));
      const { readEnv } = await import(path.resolve(__dirname, "api/_lib/http.js"));
      const api = makeApi({ env: readEnv(src), fetchImpl });
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const m = String(req.url).match(/^(?:\/MuhammadMaheem\.Portfolio)?(\/api\/[a-z-]+)(\?.*)?$/);
        if (!m) { return next(); }
        const chunks: Buffer[] = [];
        let size = 0;
        for await (const c of req) { size += c.length; if (size > 6e6) { res.statusCode = 413; return res.end("{}"); } chunks.push(c); }
        let body: any;
        try { body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : undefined; } catch { body = undefined; }
        const url = new URL(req.url, "http://x");
        const out = await api.handle({
          method: req.method, path: m[1], query: Object.fromEntries(url.searchParams),
          headers: req.headers, body, ip: req.socket.remoteAddress,
        });
        res.statusCode = out.status;
        Object.entries(out.headers || {}).forEach(([k, v]) => res.setHeader(k, v as string));
        res.end(out.body);
      });
    },
  };
}

export default defineConfig({
  base: onVercel ? "/" : "/MuhammadMaheem.Portfolio/",
  plugins: [stampDataVersion(), devApi()],
  build: {
    rollupOptions: {
      input: onVercel
        ? { main: path.resolve(__dirname, "index.html"), admin: path.resolve(__dirname, "admin/index.html") }
        : { main: path.resolve(__dirname, "index.html") },
    },
  },
});
