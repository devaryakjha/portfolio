.PHONY: build check refresh-contributions

build:
	bun run build

check:
	bun run check

refresh-contributions:
	bun scripts/refresh-contributions.mjs
