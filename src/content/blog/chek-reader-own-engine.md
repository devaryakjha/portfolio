---
title: "Why Chek Reader is its own package"
shortTitle: "Chek Reader's engine"
description: "Chek's reading engine is a standalone Swift package with its own engine, not a Readium wrapper. Here is why, and what it costs."
date: "2026-11-03T13:40:00.000Z"
---

Chek reads books and comics through **Chek Reader**. It is a standalone Swift package in [readchek/chek-reader](https://github.com/readchek/chek-reader), under Apache-2.0. The Chek app pins it to `0.1.0`.

I don't wrap Readium or any other reader. Chek Reader has its own engine. This post is about that decision.

## The decision

Chek Reader doesn't adopt or wrap Readium or any other reader.

There is one exception, and it is on purpose. Reading positions are `Locator` values, and their JSON matches the Readium Locator model. A place saved by Chek Reader can be stored and synced as it is, and other Readium-compatible apps and servers can read it.

So the engine is mine, but the shape of a saved place is shared.

## Why

The goal for 1.0 is written down. Chek Reader should be on par with or better than every existing reader package: Readium's Swift toolkit, Apple Books, Preview for PDF and Chibi Manga's current renderer. It should have published benchmarks to show it. I can't beat a reader I'm wrapping.

The `Benchmarks` folder holds that comparison. The first baseline ran on 17 October 2026, Readium 3.11.1 on the iPhone 18 Pro simulator. The first Chek Reader run followed on 18 October. Apple Books and Preview can't be scripted, so the benchmarks README has a manual protocol instead, filmed at 240 fps.

The package also has to work for apps that aren't Chek. Nothing in the repo may depend on Chek or know about it. It has no Chek-specific code, no account and no server of its own.

## How it is split

Each format is its own SwiftPM product. `ChekReaderEPUB`, `ChekReaderPDF`, `ChekReaderComics`, `ChekReaderText`, `ChekReaderMOBI` and `ChekReaderFB2` each depend on `ChekReaderCore` and nothing else. An app that only opens EPUB and PDF links those two and registers them:

```swift
ReaderFormats.register(EPUBModule.self, PDFModule.self)
```

Apps compile only the formats they include. Opening one the app left out fails with `ReaderError.formatNotIncluded`, and the error names the product to add. The `ChekReader` umbrella re-exports the default set. CBR and CB7 live in `ChekReaderArchives`, which links libarchive and stays out of the umbrella.

Each kind of publication renders with the tool that suits it:

- Reflowable books go through SwiftUI `WebView` and `WebPage`. A TypeScript script in `Scripts/Reader` lays each chapter out in CSS columns, one screen per page. It compiles into `reader.js`, which is committed so the package builds without Node.
- PDF uses PDFKit.
- Comics use ImageIO with Core Animation.

The script only does what the native side tells it. The native side owns every navigation decision. `WebNavigator` keeps the chapter before and the two after loaded off screen. It reuses its `WebPage`s, because starting a new web content process takes seconds in the simulator.

The core, format and navigator targets stay free of UIKit, AppKit and SwiftUI. That lets CI build and test the parsers on Linux as well as macOS.

## What it cost

Writing my own parsers means I own their safety. Every archive and XML document is checked against `ReaderLimits` while it's read. The defaults are 20,000 archive entries, 4 GB expanded in total, 512 MB for one resource, a compression ratio of 200, and XML nested 256 deep. Going over any of them fails with `.limitExceeded`. The rule is to never trust a size, count or offset read from a file.

There is no DRM support. Chek Reader doesn't decrypt anything. A protected book fails with `ReaderError.drmProtected`, and an app that has the rights decrypts through its own `ResourceProvider`.

Mac Catalyst isn't supported, because the SwiftUI `WebPage` APIs aren't available there. Chek Reader runs on Apple Silicon Macs as a native macOS target instead.

Every format is mine to maintain: EPUB, PDF, CBZ and CBT, plain text and Markdown, FictionBook, MOBI and AZW3, and CBR and CB7 in the add-on.

## What is still rough

The 18 October run is honest about the weak spot. Turning into a new chapter took 1.9 to 2.4 seconds at the median, close to WebKit's cold load of a chapter in a new web view. On War and Peace, where 90 of 150 turns cross a chapter, the median turn was 2234 ms. Readium's was 4.8 ms.

Web pages are now reused between chapters, which is meant to close most of that gap. There is no published run after that change yet.

Positions for War and Peace took 122 ms, against Readium's 16.4 ms. They're built in the background, so they don't hold up opening.

PDF and comics were ahead of Readium on every timing in that run. Comics showed their first page 30 times sooner.

All of these are simulator numbers. The benchmarks README says only device runs count as performance claims, and none is published yet.

A few smaller gaps:

- PDF doesn't report `turnsPastEnd`, the signal an app uses to open a series' next chapter.
- Search finds nothing in comics.
- `@readchek/reader`, the web version, isn't on npm yet. You install it from the repo at a tag.
- The package isn't taking outside contributions yet.

## Feedback

If you try Chek Reader in your own app, or it gets something wrong, [open an issue on readchek/chek-reader](https://github.com/readchek/chek-reader/issues). Or email me at [me@aryak.dev](mailto:me@aryak.dev).
