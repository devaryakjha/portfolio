---
title: "Shipping Chek on top of Chibi Manga"
shortTitle: "Chek over Chibi Manga"
description: "Chek replaced Chibi Manga on the App Store as an update, not a new app. Here is what that took in the code."
date: "2026-11-03T13:45:00.000Z"
---

Chek 2.0 isn't a new App Store listing. It is an update to Chibi Manga.

If you had Chibi Manga installed, Chek arrives as its next version. This post is about what that decision asks of the code.

## The decision

Chek is a ground-up redesign and the direct successor to Chibi Manga, and it replaces it on the App Store.

The reason the code records is people's books. Because Chek is the same app, the books someone imported into Chibi Manga are still in its Documents folder after the update, and Chek can carry them over.

## Same identity

To the App Store, an update has to be the same app. So Chek keeps Chibi Manga's bundle id, `run.chibi.manga`, and its team, `KZX5HZ32P9`. In `apple/Chek.xcodeproj` the app's `PRODUCT_BUNDLE_IDENTIFIER` is still `run.chibi.manga`, and the tests are `run.chibi.manga.tests`.

The version and build also have to stay above Chibi Manga's. Its last builds were 1.6, build 13. Chek ships with `MARKETING_VERSION = 2.0` and `CURRENT_PROJECT_VERSION = 12`. The next build after that is 14.

## A store of its own

Chibi Manga left a SwiftData store on every device that updates. It sits in the default location, with a different schema.

Chek never opens it. `ModelContainer.chek()` in `apple/Chek/Model/ChekSchema.swift` gives Chek's store its own name:

```swift
let configuration = ModelConfiguration("Chek", schema: Schema(versionedSchema: ChekSchema.self), isStoredInMemoryOnly: inMemory)
```

A store of its own keeps the two schemas from meeting. Chek's models are versioned from the start in `ChekSchema`, now at `ChekSchemaV4`, so later changes migrate instead of resetting.

## Bringing the books across

Chibi Manga kept imported books in `Documents/imports`. It listed them in `.library.json`, with the page each one was left on.

On first launch, `LibraryStore.carryOverChibiMangaLibrary()` moves each book into Chek's library. It works one book at a time, so a large library doesn't open every book at once. Each book then lives in its own folder under Application Support, found by its id, because the app container's path changes between installs.

A few details from `apple/Chek/Library/ChibiMangaLibrary.swift`:

- Only `fileName`, `currentPage` and `lastReadAt` are decoded. Other fields can change between Chibi Manga versions without breaking anything.
- Chibi Manga stored absolute paths, which point into the old app container. Chek finds each file by name instead.
- When it's done, the list is renamed to `.library.imported-into-chek.json`, not deleted. A book that couldn't be read stays on the device with its place on record.
- A book that fails to import says so once, like any failed import, instead of vanishing.

The App Store screenshots use the same path. `apple/AppStore/scripts/seed.sh` installs a fresh build in the simulator, stages openly licensed books in `Documents/imports` with a `.library.json`, and launches the app so it carries them over.

## Mature content is turned on from the web

Chek reads from servers, and some sources rate series as mature. App Review Guideline 1.2 says adult content from a web service must be off by default and turned on through a website.

So the iOS app offers Everyone and Teen. Mature appears in the app only when it was chosen on the web. Adults turn it on at [app.chek.page](https://app.chek.page) after confirming their age. The app opens that page in Safari, signed in with a one-time code from the server. The choice is kept by the library, so it holds on every device that reads it.

The rule is short: there is no way to turn it on in the app.

## What it cost

Chek carries Chibi Manga's name in its bundle id for good.

The carry-over code stays in the app. On most launches it finds no `.library.json` and returns.

Some readers who come from Chibi Manga miss it. Settings has a Chibi Manga Look toggle that brings back its green and its cat on the Home Screen. The About section's footer says "Chek replaces Chibi Manga."

## What it does not do

It only carries over the books Chibi Manga imported on the device. The code reads `.library.json` and nothing else.

The page carries over only where pages are fixed. For comics and PDFs, `BookImporter` turns the zero-based page into a position at the start of that page. Reflowable books have no fixed pages, so an EPUB starts from the beginning. It still shows as being read, because a saved page in Chibi Manga means someone was reading it.

## Feedback

If your Chibi Manga books didn't come across, or opened on the wrong page, [open an issue](https://github.com/readchek/chek/issues/new/choose). One issue list covers every Chek repository. Or email me at [me@aryak.dev](mailto:me@aryak.dev).
