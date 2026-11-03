import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import astroExpressiveCode from "astro-expressive-code";
import matter from "gray-matter";

import { execFileSync } from "node:child_process";
// Posts report when they last changed; every other page reports the last commit, so a
// rebuild of the same commit (the daily publish) doesn't tell crawlers everything moved.
const buildDate = new Date(execFileSync("git", ["log", "-1", "--format=%cI"], { encoding: "utf8" }).trim() || Date.now());
const blogDir = "src/content/blog";
const postDates = new Map(
  fs.readdirSync(blogDir).filter((file) => file.endsWith(".md")).map((file) => {
    const { data } = matter(fs.readFileSync(path.join(blogDir, file), "utf8"));
    return [`https://aryak.dev/blog/${file.slice(0, -3)}`, new Date(data.updated ?? data.date)];
  }),
);

export default defineConfig({
  site: "https://aryak.dev",
  trailingSlash: "never",
  integrations: [
    sitemap({
      serialize(item) {
        item.lastmod = (postDates.get(item.url.replace(/\/$/, "")) ?? buildDate).toISOString();
        return item;
      },
    }),
    astroExpressiveCode({
      themes: ["github-dark", "github-light"],
      themeCssSelector: (theme) => `[data-theme="${theme.type}"]`,
      frames: {
        showCopyToClipboardButton: true,
      },
    }),
  ],
});
