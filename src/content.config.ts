import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    shortTitle: z.string().optional(),
    excerpt: z.string().optional(),
    summary: z.string().optional(),
    date: z.string(),
    tags: z.string().optional(),
  }),
});

export const collections = { blog };
