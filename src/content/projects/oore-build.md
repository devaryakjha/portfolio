---
name: Oore CI
short: 'Mobile releases, on your own terms.'
description: 'Build, sign, and distribute Flutter apps on your own macOS infrastructure. I started Oore to make my own release workflow less fragmented.'
category: Build infrastructure
language: Rust / TypeScript
state: Public alpha
href: 'https://oore.build'
source: 'https://github.com/oore-ci/oore.build'
problem: 'Mobile release pipelines often become fragmented: build logic in one place, signing in another, and distribution as a separate workflow.'
solution: 'Oore CI centralizes build orchestration, signing workflows, and internal artifact delivery into one self-hosted system designed for Flutter mobile teams.'
highlights:
  - 'Build, sign, and publish Flutter apps to the App Store and Google Play from one pipeline'
  - Shared signing library with per-workflow signing and publishing
  - Pipelines and workflows defined in .oore.yaml files in your repository
  - 'Daemon, CLI, and web UI, with concurrent builds per macOS runner'
order: 1
draft: false
---

