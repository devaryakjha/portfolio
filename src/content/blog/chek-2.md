---
summary: "Chek 2.0 is out on the App Store, and Chek now runs on the web."
excerpt: "Chek 2.0 is out: one reader for books and comics on iPhone, iPad, and the web, with an optional self-hosted server."
title: "Chek 2.0: Just One More Chapter"
shortTitle: "Chek 2.0"
date: "2026-10-28T21:30:00.000Z"
tags: "Chek, iOS, Swift, Rust, Self-hosted, Reading"
---

<figure class="post-hero">
  <img src="/blog/chek-2/hero-1300.webp" srcset="/blog/chek-2/hero-1300.webp 1300w, /blog/chek-2/hero-2000.webp 2000w" sizes="(max-width: 700px) 100vw, 650px" width="1300" height="557" alt="Chek on three iPhones, showing a comic, the home screen, and a book, under the line “Just one more chapter.”" />
</figure>

**Chek 2.0** is out on the App Store, and Chek now runs in the browser too.

Chek is a reader for books and comics. It takes over from Chibi Manga, and the idea is simple: one place for everything you read, whether it lives in your own files or on your own server.

## Your own files

Add EPUB, PDF, CBZ and CBT comics, MOBI, AZW3, FictionBook, Markdown, or plain text from Files. Each one opens where you left it, offline and without an account.

<figure class="post-phones">
  <img src="/projects/chek/iphone-library-720.webp" srcset="/projects/chek/iphone-library-360.webp 360w, /projects/chek/iphone-library-720.webp 720w" sizes="(max-width: 700px) 45vw, 300px" width="720" height="1469" loading="lazy" decoding="async" alt="The Chek library on iPhone, a grid of book covers." />
  <img src="/projects/chek/iphone-comic-720.webp" srcset="/projects/chek/iphone-comic-360.webp 360w, /projects/chek/iphone-comic-720.webp 720w" sizes="(max-width: 700px) 45vw, 300px" width="720" height="1469" loading="lazy" decoding="async" alt="Chek reading Pepper&amp;Carrot Episode 8 on iPhone, three panels stacked down the page." />
  <figcaption>Your library, and a comic read panel by panel.</figcaption>
</figure>

Books and comics are drawn by Chek Reader, the reading engine behind the app. It is a standalone Swift package, so other apps can use it too.

## Your own server

If you want your library on every device, run a Chek server. It is written in Rust and ships as a Docker image for amd64 and arm64. It:

- scans your folders for metadata
- reads from Komga and Kavita
- syncs your place, bookmarks, and highlights
- speaks OPDS 2
- adds new sources through WebAssembly extensions

<figure class="post-phones">
  <img src="/blog/chek-2/iphone-shared-720.webp" width="720" height="1469" loading="lazy" decoding="async" alt="A shared Family Library from a Chek server on iPhone, with recently added books, collections, and sites." />
  <img src="/blog/chek-2/iphone-site-720.webp" width="720" height="1469" loading="lazy" decoding="async" alt="Browsing the Project Gutenberg Classics source in Chek, a grid of public-domain book covers." />
  <figcaption>A shared library from your server, and a source added by an extension.</figcaption>
</figure>

The server is optional. The app never needs it.

## On the web

The same library now opens at [app.chek.page](https://app.chek.page), with Reading Now, shared libraries, sites, and search. To try it without setting anything up, use the demo at demo.chek.page.

<figure>
  <img src="/blog/chek-2/web-comic-1120.webp" width="1120" height="700" loading="lazy" decoding="async" alt="Little Nemo in the Chek web app, a full comic page with a page slider below it." />
  <figcaption>Little Nemo, in the browser.</figcaption>
</figure>

## What it doesn't do

There are no ads, tracking, or analytics. If you run a server, keeping it updated is up to you.

## Try it

- [Chek on the App Store](https://apps.apple.com/us/app/chek-books-comics/id6761271144)
- [Web app](https://app.chek.page)
- [Docs](https://docs.chek.page)
- [Source](https://github.com/readchek/chek)

If something breaks, [open an issue](https://github.com/readchek/chek/issues/new/choose). One issue list covers every Chek repository.

<p class="post-credits">Screenshots use public-domain books and Little Nemo, and Pepper&amp;Carrot by David Revoy (CC BY 4.0).</p>
