import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { site } from "../data/site";
import { getAllPosts } from "../utils/blog";

// Posts mix Markdown with HTML figures, so raw HTML is allowed and then sanitized.
const parser = new MarkdownIt({ html: true });
// Feed readers resolve paths against the feed, not the site, so make every link absolute.
const absolute = (value: string) => new URL(value, site.url).href;

export const GET: APIRoute = async () => {
  const posts = await getAllPosts();
  return rss({
    title: site.name,
    description: site.description,
    site: site.url,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id}`,
      content: sanitizeHtml(parser.render(post.body ?? ""), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "figure", "figcaption"]),
        allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ["src", "alt", "width", "height"] },
        transformTags: {
          a: (tagName, attribs) => ({ tagName, attribs: attribs.href ? { ...attribs, href: absolute(attribs.href) } : attribs }),
          img: (tagName, attribs) => ({ tagName, attribs: attribs.src ? { ...attribs, src: absolute(attribs.src) } : attribs }),
        },
      }),
    })),
    customData: "<language>en</language>",
  });
};
