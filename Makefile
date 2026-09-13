PROJECT ?= $(CF_PAGES_PROJECT)
BRANCH ?= main

.PHONY: build deploy refresh-contributions

build:
	bun run build

refresh-contributions:
	bun scripts/refresh-contributions.mjs

deploy:
	@if [ -z "$(PROJECT)" ]; then \
		echo "Missing Cloudflare Pages project name."; \
		echo "Use: make deploy PROJECT=<pages-project-name> [BRANCH=main]"; \
		echo "Or set CF_PAGES_PROJECT in your environment."; \
		exit 1; \
	fi
	bun scripts/refresh-contributions.mjs
	@echo "Deploying dist/ to Cloudflare Pages project '$(PROJECT)' (branch: $(BRANCH))"
	bun run build
	bun scripts/check-site.mjs
	bunx tsc --noEmit
	git diff --check
	wrangler pages deploy dist --project-name "$(PROJECT)" --branch "$(BRANCH)"
