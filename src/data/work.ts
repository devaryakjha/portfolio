import { getCollection } from 'astro:content';

// Listed projects in directory order. Scripts outside Astro read the same files through scripts/projects.mjs.
export const work = (await getCollection('projects', ({ data }) => !data.draft))
  .sort((a, b) => a.data.order - b.data.order)
  .map(({ id, data: { order: _order, draft: _draft, ...project } }) => ({ slug: id, ...project }));
