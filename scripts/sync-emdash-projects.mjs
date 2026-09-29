import assert from 'node:assert/strict';
import { writeFileSync, renameSync } from 'node:fs';

import { list } from './cms-client.mjs';

const projects = await list('projects');

assert(projects.length > 0, 'EmDash has no published projects; keeping the last snapshot');
const seen = new Set();
const required = ['name', 'short', 'description', 'category', 'language', 'state', 'href', 'source', 'problem', 'solution'];
const work = projects.map(item => {
  assert(item.status === 'published' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug), 'Invalid published project slug');
  assert(!seen.has(item.slug), `Duplicate project slug: ${item.slug}`);
  seen.add(item.slug);
  const data = item.data;
  for (const field of required) {
    assert(typeof data[field] === 'string' && data[field].trim(), `${item.slug}: missing ${field}`);
  }
  assert(Number.isSafeInteger(data.rank) && data.rank >= 0, `${item.slug}: invalid rank`);
  for (const field of ['href', 'source']) {
    assert(new URL(data[field]).protocol === 'https:', `${item.slug}: ${field} must use HTTPS`);
  }
  assert(typeof data.highlights === 'string', `${item.slug}: missing highlights`);
  return {
    slug: item.slug,
    name: data.name,
    short: data.short,
    description: data.description,
    category: data.category,
    language: data.language,
    state: data.state,
    href: data.href,
    source: data.source,
    problem: data.problem,
    solution: data.solution,
    highlights: data.highlights.split('\n').map(line => line.trim()).filter(Boolean),
    rank: data.rank,
  };
});
work.sort((a, b) => a.rank - b.rank || a.slug.localeCompare(b.slug));
for (const project of work) delete project.rank;

const output = new URL('../src/data/work.snapshot.json', import.meta.url);
writeFileSync(`${output.pathname}.tmp`, `${JSON.stringify(work, null, 2)}\n`);
renameSync(`${output.pathname}.tmp`, output);
console.log(`Synced ${work.length} published projects from EmDash.`);
