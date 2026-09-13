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

## Cloudflare Pages

Suggested settings:

- Build command: `bun install && bun run build`
- Output directory: `dist`
- Node version: `26.3.0` (Astro requires Node 22.12 or newer)

Redirects live in `public/_redirects`.

Deploy with Wrangler:

```bash
make deploy PROJECT=<pages-project-name>
# optional preview branch deploy
make deploy PROJECT=<pages-project-name> BRANCH=<branch-name>
```

## GitHub contribution snapshot

`make refresh-contributions` fetches the current 26-week calendar for `devaryakjha`
into `public/github-contributions.json`. Requires an authenticated `gh` CLI
(`gh auth login`, or `GH_TOKEN` in CI). Only dates, aggregate counts, and intensity
levels are saved; no credentials or repository details enter the site.

`make deploy` refreshes this snapshot before building and stops if the refresh
fails. Ordinary builds stay offline and use the saved snapshot. This is a
deployment-time snapshot, not a live feed.

The home page renders the snapshot at build time, including three recent public
commits from GitHub search. Commit search can lag behind new pushes. Run
`bun run dev` to preview the real section; `prototypes/` is not published.
