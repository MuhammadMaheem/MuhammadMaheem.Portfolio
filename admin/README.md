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

## Security

What protects the admin, and what each part does:

- **Password plus an optional authenticator code.** Set `ADMIN_TOTP_SECRET` (base32) to require a 6-digit code from Google Authenticator, Authy or 1Password on every sign-in. A code works once. A wrong password and a wrong code give the same message.
- **Brute-force limits.**
  - Vercel's firewall blocks an address for 15 minutes after 5 sign-in attempts in a minute (rule "Admin login brute-force limit", enforced before the code runs).
  - The server adds a growing delay after each failed attempt and locks an address for 15 minutes after 5 failures (per server instance, so it is a second layer, not the only one).
  - Failed attempts are logged (address partly masked) in the Vercel function logs.
- **Session.** A signed `__Host-` cookie: HttpOnly, Secure, SameSite=Strict, tied to the browser that signed in, valid for 4 hours. Every request also needs a custom header, a JSON body and a same-origin check, which stops cross-site requests.
- **Least privilege.** The publish token can only touch this one repository. The server decides the repo and branch, and may only write `public/data.js`, images under `public/screenshots` or `public/profil-pic`, and the resume PDF. Everything else is refused. Uploads are checked for the real file type.
- **Content safety.** Text from the admin or from imports is escaped on the site, links may only be http, https, mailto or tel, and the server rejects anything else.
- **Browser protections.** A Content-Security-Policy on the admin and the site, HSTS, no framing, no sniffing, and integrity hashes on the two CDN scripts.
- **If you suspect a leak:** change `ADMIN_PASSWORD` and `SESSION_SECRET` in Vercel and redeploy (every session ends at once), then revoke and recreate the GitHub tokens. Fine-grained tokens expire, so set a calendar reminder to renew them.
- **Also worth doing:** turn on two-factor authentication for your GitHub and Vercel accounts, since they hold the real keys.

To set up the authenticator code, run `node scripts/totp-setup.mjs`, add the printed setup key to your authenticator app (time-based), check that its 6-digit code is accepted by a test sign-in, then set it in Vercel as `ADMIN_TOTP_SECRET` and redeploy. If you lose the app, remove `ADMIN_TOTP_SECRET` in Vercel and redeploy to sign in with the password alone.
