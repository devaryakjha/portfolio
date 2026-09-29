PROJECT ?= $(CF_PAGES_PROJECT)
BRANCH ?= main

.PHONY: build deploy deploy-static refresh-contributions sync-projects

build:
	bun run build

refresh-contributions:
	bun scripts/refresh-contributions.mjs

sync-projects:
	bun scripts/sync-emdash-projects.mjs

deploy: refresh-contributions deploy-static

deploy-static:
	@if [ -z "$(PROJECT)" ]; then \
		echo "Missing Cloudflare Pages project name."; \
		echo "Use: make deploy PROJECT=<pages-project-name> [BRANCH=main]"; \
		echo "Or set CF_PAGES_PROJECT in your environment."; \
		exit 1; \
	fi
	@echo "Deploying dist/ to Cloudflare Pages project '$(PROJECT)' (branch: $(BRANCH))"
	bun run build
	bun scripts/check-site.mjs
	bunx tsc --noEmit
	git diff --check
	bunx wrangler@4.143.1 pages deploy dist --project-name "$(PROJECT)" --branch "$(BRANCH)"
