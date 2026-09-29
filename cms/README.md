# Project editor

This EmDash app manages the portfolio's published project fields and display
order. It runs as a separate Cloudflare Worker with D1 and R2. The public Astro
site reads a snapshot during its build, so CMS traffic cannot slow page requests.

## Local check

```bash
bun install
bunx emdash seed seed/seed.json --validate
bun run check
bun run dev
```

Open `/_emdash/admin` on the local URL. The first setup offers the six projects
from `seed/seed.json` as sample content. Select them when creating the admin.
Edit a project's `Display order` number to rearrange it; publish to make it
available to the next portfolio build. The public site sync needs an EmDash API
token with `content:read` and `media:read` access.

## Deployment

`cloudflare.config.ts` records the intended `cf` Worker bindings. EmDash's
current Astro adapter emits Wrangler build output, which `cf deploy` beta.5
cannot consume. For this app, `bun run deploy` uses the approved Wrangler
exception. Its `wrangler.jsonc` supplies the same D1, R2, and cron bindings.
The named D1 database and R2 bucket have been created with `cf`; the D1 UUID is
recorded in `wrangler.jsonc`. The deployed admin is at
`https://cms.aryak.dev/_emdash/admin`, protected by Cloudflare Access.
Complete the admin setup and select the six seeded projects. Do not point the public
workflow at this app until the six seeded projects are published and the
read-only API token works. The publishing workflow also sends a Cloudflare
Access service token, so its read requests can pass the CMS login gate.

After setup, set `EMDASH_URL` and `EMDASH_TOKEN` in the portfolio workflow and
run that workflow manually once. The native `portfolio-publish` plugin then
dispatches the workflow on publish, unpublish, and delete events in Projects
and Images. Failed dispatches remain queued and retry each minute. Store a
repository-scoped Actions write token as `PORTFOLIO_GITHUB_TOKEN` on the Worker. `cf` remains the CLI for inspecting and managing Cloudflare resources;
use `cf cli search` to confirm command syntax in this beta.

## Editable images

Images has three stable slugs: `portrait`, `oore-dashboard`, and `oore-builds`.
Replace an entry's image, set its alt text, and publish it. The two screenshots
also have optional dark-mode variants; omitting one uses the light image in both
themes. Keep these slugs and entries published. Media uploads store originals
in R2. Builds download Cloudflare Images variants and serve static files.

The seed includes the image schema. Fresh installs need these three entries
populated before enabling authenticated sync. SVG artwork and generated social
previews remain in code.
