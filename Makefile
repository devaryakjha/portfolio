.PHONY: build check refresh-github

build:
	bun run build

check:
	bun run check

refresh-github:
	bun scripts/refresh-github.mjs
