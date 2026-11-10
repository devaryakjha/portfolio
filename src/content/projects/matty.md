---
name: Matty
short: Mattermost, without the wait.
description: 'A fast, native Mattermost client for macOS, Linux, Windows, and the web, written in Rust on GPUI. One process, no browser engine inside.'
category: Chat client
language: Rust / GPUI
state: Beta
href: 'https://demo.karyalabs.dev/matty/'
source: 'https://github.com/karyalabs/matty'
problem: 'The official Mattermost desktop app is a browser wrapped around the web client. It takes a while to open, holds on to memory, and keeps using CPU when nothing is happening.'
solution: 'Matty is one native process built with GPUI and gpuicn. It reads channels from a local cache, so it opens quickly, switches channels without a spinner, and keeps working offline.'
highlights:
  - 'Native apps for macOS, Linux, and Windows, plus the same app compiled to WebAssembly for the browser'
  - 'Peek at unread channels, threads beside the channel, and a quick switcher across teams and servers'
  - 'Offline first: a local cache for reading and an outbox that sends in order when you reconnect'
  - 'Measured against Mattermost Desktop with a benchmark that lives in the repository'
order: 3
draft: false
---
