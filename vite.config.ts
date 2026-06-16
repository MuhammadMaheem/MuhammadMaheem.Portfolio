import { defineConfig } from "vite";

// https://vite.dev/config/
// Vanilla static site (HTML/CSS/JS + Three.js/anime.js via CDN).
// `base` matches the GitHub Pages project path so public assets referenced
// as `/styles.css`, `/data.js`, ... resolve under the deploy subpath.
export default defineConfig({
  base: "/MuhammadMaheem.Portfolio/",
  plugins: [],
});
