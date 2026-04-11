# Deployment

This project is deployed to **Cloudflare Pages** and served at
<https://violencetown.russelldangerr.com/>. The playable game lives at `/game/`.

## Architecture

| Layer | What | Where configured |
|---|---|---|
| Hosting | Cloudflare Pages | Cloudflare dashboard → Workers & Pages → `violencetown` project |
| Source | `RussellDangerr/violencetown` GitHub repo | Linked via Cloudflare's GitHub app integration |
| Watched branch | `main` (auto-deploys on push) | Pages project settings |
| Build command | None — static site, files served as-is | Pages project settings |
| Output directory | Repo root (`/`) | Pages project settings |
| Default domain | `violencetown.pages.dev` | Cloudflare-assigned |
| Custom domain | `violencetown.russelldangerr.com` | Pages project → Custom domains |
| DNS | CNAME record in the `russelldangerr.com` zone | Cloudflare dashboard → DNS |
| SSL certificate | Cloudflare-managed, automatic | No action required |

## How a deployment happens

1. A commit is pushed to `main` on GitHub.
2. Cloudflare Pages detects the push via the GitHub app webhook.
3. Cloudflare runs the build (none configured — it just copies the repo tree).
4. Cloudflare publishes the new tree to its edge network.
5. Both `violencetown.pages.dev` and `violencetown.russelldangerr.com` serve
   the new version within ~30 seconds.

Deploys can be monitored in the Cloudflare dashboard under
Workers & Pages → `violencetown` → Deployments. Each deployment is labeled
with the triggering commit's message.

## Why the game is at `/game/`

The repo's [game/](game/) directory contains the actual playable HTML, JS,
CSS, maps, and sprites. The repo root holds non-game files — a landing page,
documentation, and planning docs under [plans/](plans/). Cloudflare Pages
serves the repo root, so URLs map directly to paths in the repo:
`violencetown.russelldangerr.com/game/` resolves to
[game/index.html](game/index.html).

## Sibling project (the root domain)

The root `russelldangerr.com` domain is served by a **separate** Cloudflare
Pages project named `mywebsite`, linked to a private
`RussellDangerr/mywebsite` repo. That site's homepage has a card linking to
this project's subdomain. Changes in this repo do not affect
`russelldangerr.com`, and vice versa. The two projects are independent
Cloudflare Pages deployments that only know about each other via an
application-layer link.

## Changing deployment settings

Cloudflare dashboard → Workers & Pages → `violencetown` → Settings.

Everything lives in the dashboard, not in this repo. There is no
`wrangler.toml`, no `.github/workflows/pages.yml`, no `CNAME` file —
Cloudflare Pages is zero-config from the repo's perspective. The tradeoff is
that the hosting configuration is not discoverable by reading the code, which
is exactly what this document exists to compensate for.

## Fallback URL

GitHub Pages is also enabled on this repo as a redundant mirror. If the
Cloudflare Pages project ever breaks or is deleted, the same content is
available at <https://russelldangerr.github.io/violencetown/>, served
directly by GitHub Pages from the `main` branch's root. No custom domain
there — just the plain `.github.io` URL — but it's a working fallback while
the primary is repaired.

## Verifying what's actually serving a URL

If you ever need to confirm which host is serving a URL, run:

```
curl -sI https://violencetown.russelldangerr.com/game/
```

Look for the `Server:` header. `Server: cloudflare` means Cloudflare is
serving directly (current setup). `Server: GitHub.com` with
`Via: 1.1 varnish` means GitHub Pages is serving. If you see both patterns
in one response, the site has moved to a layered setup (something in front
of something else).
