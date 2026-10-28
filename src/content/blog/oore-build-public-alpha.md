---
summary: "Why I built a self-hosted release workflow for Flutter, and why I’m sharing it."
excerpt: "I built Oore CI for my own Flutter release workflow, and I am now opening it up in public alpha for anyone dealing with similar mobile CI pain."
title: "Oore CI Is Public Alpha"
shortTitle: "Oore CI Alpha"
date: "2026-02-18T08:35:00.000Z"
tags: "Oore CI, Flutter, CI/CD, Mobile DevOps, Rust, Self-hosted"
---

I’m opening **Oore CI** in **public alpha** today.

This started as a personal project I built for my own workflow. I wanted a better way to run Flutter mobile CI on my own macOS machine, handle signing, and share internal builds without stitching together too many tools.

Now I’m opening it up because I think others may have the same problem, and because open source feedback usually makes projects better much faster.

## Why I made this

I work on Flutter apps, and the same friction kept repeating:

- build setup that drifts over time
- signing steps spread across scripts and manual notes
- internal distribution that takes more effort than it should

So I started building Oore CI as a focused, self-hosted tool for this exact use case.

## What it does right now (alpha)

Current alpha includes:

- `oored` daemon for orchestration, build scheduling, and API
- `oore` CLI for setup, diagnostics, and runner operations
- Web UI for builds, projects, users, and instance management
- Flutter build support for Android, iOS, and macOS (on macOS host)
- GitHub and GitLab webhook-triggered builds
- Pipeline configuration via repo YAML with UI fallback
- Artifact distribution via signed, time-limited links
- OIDC auth support (Google, Okta, Azure AD, Auth0, Keycloak, and other OIDC providers)
- Role-based access control for team permissions
- Artifact storage options: local filesystem, S3, or R2

## What alpha means here

This is **v0.1.x public alpha**, so a few things are expected:

- APIs can change
- Config formats can change
- CLI flags can change
- rough edges will exist

There is a `stable` channel, but at this stage it means default install/update channel, not 1.0 maturity.

## Quick start

Install:

```bash
curl -fsSL https://oore.build/install | bash
```

Then choose:

- **Local-first** path (daemon + CLI setup), or
- **Hosted UI** path via [ci.oore.build](https://ci.oore.build) with an HTTPS-reachable backend URL

Docs:

- [Public alpha guide](https://docs.oore.build/getting-started/public-alpha)
- [Oore CI docs](https://docs.oore.build)

## If this helps you, I’d love your help too

I’m sharing this early so it can improve in the open.

If you try it, feedback on any of these would be super helpful:

- Onboarding clarity
- Build and signing setup pain points
- Runner reliability and diagnostics
- UI gaps in day-to-day usage
- missing pieces that block real usage

You can open an issue here:

- [GitHub Issues](https://github.com/devaryakjha/oore.build/issues)

Or just email me directly:

- [me@aryak.dev](mailto:me@aryak.dev)

Thanks for reading, and thanks in advance if you give it a try.
