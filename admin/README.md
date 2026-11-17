# Portfolio admin: setup

The admin lives at `https://<your-vercel-domain>/admin/` (not linked from the site). It edits `public/data.js` and publishes by committing to GitHub. GitHub Pages then rebuilds the public site, as it does for any push to `main`.

Your password and GitHub tokens are **Vercel environment variables**. They are never in the repo or in the browser.

## 1. Create two GitHub tokens

GitHub > Settings > Developer settings > Personal access tokens > **Fine-grained tokens** > Generate new token.

1. **Publish token** (`GITHUB_TOKEN`)
   - Repository access: *Only select repositories* > `MuhammadMaheem.Portfolio`
   - Permissions: *Contents: Read and write*, *Actions: Read-only*, *Metadata: Read-only*
2. **Import token** (`GITHUB_IMPORT_TOKEN`, optional but needed for private repos)
   - Repository access: *All repositories* (or pick the ones you want to import)
   - Permissions: *Contents: Read-only*, *Metadata: Read-only*

Keeping them separate means the token that can write is limited to this one repo.

## 2. Set the environment variables in Vercel

Project > Settings > Environment Variables (Production):

| Name | Value |
| --- | --- |
| `ADMIN_PASSWORD` | A long passphrase you choose. Not a short name-plus-number pattern: the admin URL is public and will be probed. |
| `SESSION_SECRET` | Random text, 32+ characters. Make one with `openssl rand -hex 32`. |
| `GITHUB_TOKEN` | The publish token |
| `GITHUB_IMPORT_TOKEN` | The import token (optional) |

Optional: `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH` (defaults: `MuhammadMaheem`, `MuhammadMaheem.Portfolio`, `main`).

Type these into the Vercel dashboard yourself. Do not paste them into chat, commits or files. Redeploy after changing them.

## 3. Deploy

Connect the Vercel project to the GitHub repo (Framework: Vite, build `npm run build`, output `dist`). Vercel sets `VERCEL=1`, which makes the build use the root path and include `/admin` and `/api`. The GitHub Pages build does not include either.

## Using it

- Edit anything, then open **Preview** to see the real site with your draft. Nothing is public yet.
- **Publish** makes one commit, uploads new images, and shows when the site is live.
- **Publish > Earlier versions** restores any earlier version as a new commit.
- Drafts autosave on this device. If the site was changed elsewhere (for example a `git push`), publishing stops with a conflict message instead of overwriting.
- After an admin publish, run `git pull` before editing the repo by hand.

## Local testing

```bash
npm run dev:fake   # admin + an in-memory fake GitHub; the password is printed in the terminal
npm run dev:admin  # admin against the real GitHub, reading .env.local (copy .env.example)
npm test           # API unit tests
```
