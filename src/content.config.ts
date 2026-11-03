import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    shortTitle: z.string().optional(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
  }),
});

// Project links render as visible anchors, so only https URLs get through.
const httpsUrl = z.string().url().refine((url) => url.startsWith("https://"), "Use an https:// URL");

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    name: z.string(),
    short: z.string(),
    description: z.string(),
    category: z.string(),
    language: z.string(),
    state: z.string(),
    href: httpsUrl,
    source: httpsUrl,
    problem: z.string(),
    solution: z.string(),
    highlights: z.array(z.string()),
    order: z.number().int().positive(),
    // Drafts get no page, card, social image, sitemap or llms.txt entry.
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, projects };
