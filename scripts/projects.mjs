import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

// Listed projects for scripts that run outside Astro, matching src/data/work.ts.
const dir = new URL('../src/content/projects/', import.meta.url);

export function readProjects({ includeDrafts = false } = {}) {
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.md'))
    .map(file => ({ slug: path.basename(file, '.md'), ...matter(fs.readFileSync(new URL(file, dir), 'utf8')).data }))
    .filter(project => includeDrafts || !project.draft)
    .sort((a, b) => a.order - b.order);
}
