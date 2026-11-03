import { getCollection, type CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

/** Published posts, newest first. The entry id is the file name, which is the URL slug. */
export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await getCollection("blog");
  return posts.sort((a, b) => +b.data.date - +a.data.date);
}

/** When a post last changed, for feeds, sitemaps and structured data. */
export const lastModified = (post: BlogPost) => post.data.updated ?? post.data.date;
