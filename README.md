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
- Editable portrait and screenshots: EmDash Images, snapshotted to `src/data/media.snapshot.json` and `public/cms/`
- Code-generated artwork and other static assets: `public/`
- Published projects: `src/data/work.snapshot.json`, refreshed from the separate EmDash app in `cms/`

The site also publishes `/rss.xml` (full posts), `/llms.txt`, and a sitemap.
Response headers for Pages live in `public/_headers`, redirects in
`public/_redirects`.

The public site is fully generated at build time. Editing or reordering a
published project changes the next build; a visitor never waits for EmDash or D1.
New projects get a simple default illustration and case study until they get custom
artwork in `ProjectArtwork.astro` and a walkthrough. Oore CI, Chek, Tagflow, gpuicn,
Anpec, and Seisei have both.

## Deployment

`.github/workflows/publish-portfolio.yml` does all deployment; there is no local
deploy command.

- On every pull request and push to `main`, the `check` job installs, builds, and
  runs `bun run check` against the committed snapshots. It needs no secrets.
- On pushes to `main`, the daily schedule (00:07 UTC, 05:37 IST), and manual or
  CMS dispatches, the `publish` job syncs published projects and images from
  EmDash, refreshes GitHub activity, builds, checks, and uploads `dist` to the
  `portfolio` Pages project with Wrangler (pinned in `package.json`). It skips the
  upload when the same commit and snapshots were already published.

Publishing or unpublishing a project or image in EmDash dispatches the workflow
through the native EmDash plugin. The workflow reads published content, downloads
responsive WebP variants from Cloudflare Images, and deploys static files to
Pages. Visitors load images from the portfolio domain; no request waits for the
CMS. Failed dispatches stay queued in EmDash and retry each minute. Draft saves do
not rebuild. CMS-only builds keep the deployed GitHub activity snapshot.

Configure repository variable `EMDASH_URL` and secrets `EMDASH_TOKEN` (EmDash
`content:read` and `media:read`), `CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`,
`CLOUDFLARE_API_TOKEN`, and `CLOUDFLARE_ACCOUNT_ID`. Store a fine-grained GitHub
token with Actions write access to this repository as the CMS Worker secret
`PORTFOLIO_GITHUB_TOKEN`. `PORTFOLIO_GH_TOKEN` is optional for activity.
`make sync-projects` and `make sync-media` refresh the snapshots locally with
`EMDASH_URL` and a read-only `EMDASH_TOKEN`. Offline builds use the checked-in
snapshots and image files.

## GitHub contribution snapshot

`make refresh-contributions` fetches the current 26-week calendar for `devaryakjha`
into `public/github-contributions.json`. Requires an authenticated `gh` CLI
(`gh auth login`, or `GH_TOKEN` in CI). Only dates, aggregate counts, and intensity
levels are saved; no credentials or repository details enter the site.

Ordinary builds stay offline and use the saved snapshot; the publish job refreshes
it. This is a deployment-time snapshot, not a live feed.
