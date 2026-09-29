# aryak.dev (Astro)

Ultra-light, static portfolio + blog built with Astro.

## Local dev

```bash
bun install
bun run dev
```

Astro runs on the default port it prints in the terminal.

## Build

```bash
bun run build
bun run preview
```

`bun run build` also generates matching 1200×630 social previews with the site's
monogram, portrait, and typography:

- `public/og.png` and `public/blog/og.png`
- `public/projects/<slug>/og.png`
- `public/blog/<slug>/og.png` (also served at the existing `twitter.png` URL)
- `public/apple-touch-icon.png`

Titles come from project data and blog frontmatter (`shortTitle` or `title`).
Run `bun scripts/check-site.mjs` after building to check routes, assets, and metadata.

## Content

- Blog posts: `src/content/blog/*.md`
- Static assets: `public/`
- Published projects: `src/data/work.snapshot.json`, refreshed from the separate EmDash app in `cms/`

The public site is still fully generated at build time. Editing or reordering a
published project changes the next build; a visitor never waits for EmDash or D1.
New projects get a simple default illustration and case study. The original six
keep their custom artwork and walkthroughs.

## Cloudflare Pages

Suggested settings:

- Build command: `bun install && bun run build`
- Output directory: `dist`
- Node version: `26.3.0` (Astro requires Node 22.12 or newer)

Redirects live in `public/_redirects`.

Deploy the current direct-upload Pages project:

```bash
make deploy PROJECT=<pages-project-name>
# optional preview branch deploy
make deploy PROJECT=<pages-project-name> BRANCH=<branch-name>
```

`cf` is used for Cloudflare account and resource work. Its 2026-09-29 beta
cannot upload to this existing direct-upload Pages project, so this deployment
step uses the approved Wrangler exception. `make deploy-static` builds and
uploads without refreshing GitHub activity. `make sync-projects` refreshes the
project snapshot with `EMDASH_URL` and a read-only `EMDASH_TOKEN`.

`.github/workflows/publish-portfolio.yml` publishes static builds on pushes to
`main`, polls EmDash every 15 minutes, and refreshes GitHub activity daily at
00:07 UTC. It skips a Pages upload when the code and both snapshots match a
previous successful upload. Configure repository variable `EMDASH_URL` and
secrets `EMDASH_TOKEN` (EmDash `content:read`), `CF_ACCESS_CLIENT_ID`,
`CF_ACCESS_CLIENT_SECRET`, `CLOUDFLARE_API_TOKEN`, and
`CLOUDFLARE_ACCOUNT_ID`. `PORTFOLIO_GH_TOKEN` is optional; without it, the
workflow uses its GitHub token for public activity. Until EmDash is configured,
the workflow keeps building with the checked-in project snapshot.

## GitHub contribution snapshot

`make refresh-contributions` fetches the current 26-week calendar for `devaryakjha`
into `public/github-contributions.json`. Requires an authenticated `gh` CLI
(`gh auth login`, or `GH_TOKEN` in CI). Only dates, aggregate counts, and intensity
levels are saved; no credentials or repository details enter the site.

`make deploy` refreshes this snapshot before building and stops if the refresh
fails. Ordinary builds stay offline and use the saved snapshot. The scheduled
workflow updates it once per day. This is a deployment-time snapshot, not a live
feed.

The home page renders the snapshot at build time, including three recent public
commits from GitHub search. Commit search can lag behind new pushes. Run
`bun run dev` to preview the real section; `prototypes/` is not published.
