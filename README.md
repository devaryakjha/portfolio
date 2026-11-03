# aryak.dev (Astro)

Ultra-light, static portfolio and blog built with Astro and Bun, hosted on
Cloudflare Pages. The Node version lives in `.node-version`.

## Local dev

```bash
bun install
bun run dev
```

Astro runs on the default port it prints in the terminal.

## Build and check

```bash
bun run build
bun run check   # or: make check
bun run preview
```

`bun run build` also generates matching 1200×630 social previews with the site's
monogram, portrait, and typography:

- `public/og.png` and `public/blog/og.png`
- `public/projects/<slug>/og.png`
- `public/blog/<slug>/og.png` (also served at the existing `twitter.png` URL)
- `public/apple-touch-icon.png`

Titles come from project data and post frontmatter (`shortTitle` or `title`);
post previews show the post's `description`.
`bun run check` runs after a build. It checks routes, local links and assets,
metadata, structured data, feeds, the sticker maths, and types.

## Content

- Posts: `src/content/blog/*.md`, an Astro content collection (see
  `src/content.config.ts`). Frontmatter: `title`, optional `shortTitle`,
  `description`, `date`, and optional `updated`.
- Projects: `src/content/projects/<slug>.md`, a second collection. The file name
  is the URL slug. Frontmatter: `name`, `short`, `description`, `category`,
  `language`, `state`, `href` and `source` (https URLs), `problem`, `solution`,
  `highlights` (a list), `order` (position in the project directory), and
  `draft`. The body is unused for now.
- Portrait and Oore screenshots: `public/portrait/` and
  `public/projects/oore-build/`, listed with their sizes and alt text in
  `src/data/media.ts`.
- Code-generated artwork and other static assets: `public/`

`draft: true` unlists a project: it gets no page, home card, social preview,
sitemap or `llms.txt` entry, and `bun run check` fails if one appears. Seisei is a
draft for now.

A new project needs custom artwork in `ProjectArtwork.astro` and a walkthrough
(`ProjectWalkthrough.astro`, or its own component like `OoreWalkthrough.astro`
and `ChekWalkthrough.astro`). Oore CI, Chek, Tagflow, gpuicn, Anpec, and Seisei
have both.

The site also publishes `/rss.xml` (full posts), `/llms.txt`, and a sitemap.
Response headers for Pages live in `public/_headers`, redirects in
`public/_redirects`.

## Deployment

`.github/workflows/publish-portfolio.yml` does all deployment; there is no local
deploy command.

- On every pull request and push to `main`, the `check` job installs, builds, and
  runs `bun run check` against the committed files. It needs no secrets.
- On pushes to `main` (after `check` passes), the daily schedule (00:07 UTC,
  05:37 IST), and manual runs, the `publish` job refreshes GitHub activity,
  builds, checks, and uploads `dist` to the `portfolio` Pages project with
  Wrangler (pinned in `package.json`).

Editing a project or an image is a commit to `main`; the push publishes it.

Repository secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` for
Wrangler, and optionally `PORTFOLIO_GH_TOKEN` for GitHub activity (the
workflow's own token is used otherwise).

## GitHub activity snapshot

`make refresh-github` writes `public/github-activity.json`: the current 26-week
contribution calendar for `devaryakjha` (dates, aggregate counts, and intensity
levels) and the latest GitHub release of each listed project, read from the
repository in its `source` URL. A repository without releases is left out; if a
request fails, that project keeps its entry from the previous snapshot. Requires
an authenticated `gh` CLI (`gh auth login`, or `GH_TOKEN` in CI). No credentials
enter the site.

The home page shows the calendar and the releases; a project page shows its
latest release beside the source link. Ordinary builds stay offline and use the
committed snapshot; the publish job refreshes it. This is a deployment-time
snapshot, not a live feed.
