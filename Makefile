.PHONY: build check refresh-contributions sync-projects sync-media

build:
	bun run build

check:
	bun run check

refresh-contributions:
	bun scripts/refresh-contributions.mjs

sync-projects:
	bun scripts/sync-emdash-projects.mjs

sync-media:
	bun scripts/sync-emdash-media.mjs
