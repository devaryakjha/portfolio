import type { APIRoute } from "astro";
import { site } from "../data/site";
import { work } from "../data/work";
import { getAllPosts } from "../utils/blog";

export const GET: APIRoute = async () => {
  const posts = await getAllPosts();
  const body = [
    `# ${site.name}`,
    "",
    site.description,
    "",
    "## Projects",
    "",
    ...work.map((p) => `- [${p.name}](${site.url}/projects/${p.slug}): ${p.short}`),
    "",
    "## Writing",
    "",
    ...posts.map((p) => `- [${p.data.title}](${site.url}/blog/${p.id}): ${p.data.description}`),
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
