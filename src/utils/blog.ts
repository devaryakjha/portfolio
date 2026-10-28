export type BlogFrontmatter = {
  excerpt?: string;
  summary?: string;
  title: string;
  shortTitle?: string;
  date: string;
  tags?: string;
};

type MarkdownModule = {
  frontmatter: BlogFrontmatter;
  Content: any;
};

const modules = import.meta.glob("../content/blog/*.md", {
  eager: true,
}) as Record<string, MarkdownModule>;

export type BlogPost = {
  slug: string;
  frontmatter: BlogFrontmatter;
  Content: MarkdownModule["Content"];
};

function toSlug(path: string) {
  const last = path.split("/").pop() ?? "";
  return last.replace(/\.md$/, "");
}

const ALL_POSTS: BlogPost[] = Object.entries(modules)
  .map(([path, mod]) => ({
    slug: toSlug(path),
    frontmatter: mod.frontmatter,
    Content: mod.Content,
  }))
  .filter((p) => Boolean(p.slug))
  .sort((a, b) => {
    const ad = +new Date(a.frontmatter.date);
    const bd = +new Date(b.frontmatter.date);
    return bd - ad;
  });

export function getAllPosts() {
  return ALL_POSTS;
}
