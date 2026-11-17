import { defineConfig } from "vite";
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

export default defineConfig({
  base: onVercel ? "/" : "/MuhammadMaheem.Portfolio/",
  plugins: [stampDataVersion()],
  build: {
    rollupOptions: {
      input: onVercel
        ? { main: path.resolve(__dirname, "index.html"), admin: path.resolve(__dirname, "admin/index.html") }
        : { main: path.resolve(__dirname, "index.html") },
    },
  },
});
