import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { readProjects } from './projects.mjs';

const username = 'devaryakjha';
const dayMs = 86400000;
const iso = date => date.toISOString().slice(0, 10);
const now = new Date();
const end = new Date(`${iso(now)}T00:00:00Z`);
const start = new Date(+end - ((end.getUTCDay() + 6) % 7 + 25 * 7) * dayMs);
const levels = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'];
const query = `query { user(login: "${username}") { contributionsCollection(from: "${iso(start)}T00:00:00Z", to: "${now.toISOString()}") { contributionCalendar { weeks { contributionDays { date contributionCount contributionLevel } } } } } }`;
// gh reads GH_TOKEN in CI, or the local gh login. Credentials never enter the output.
const response = JSON.parse(execFileSync('gh', ['api', 'graphql', '-f', `query=${query}`], { encoding: 'utf8' }));
assert(!response.errors, 'GitHub returned GraphQL errors');
const days = response.data.user.contributionsCollection.contributionCalendar.weeks
  .flatMap(week => week.contributionDays)
  .filter(day => day.date >= iso(start) && day.date <= iso(end))
  .sort((a, b) => a.date.localeCompare(b.date))
  .map(day => ({ date: day.date, count: day.contributionCount, level: levels.indexOf(day.contributionLevel) }));
// Runnable integrity check: reject missing/duplicate dates and malformed counts before replacing the cache.
assert.equal(days.length, Math.round((end - start) / dayMs) + 1);
days.forEach((day, index) => {
  assert.equal(day.date, iso(new Date(+start + index * dayMs)));
  assert(Number.isSafeInteger(day.count) && day.count >= 0 && day.level >= 0);
});

// The newest published release of each listed project, prereleases included: Oore's alphas and
// Tagflow's betas are its real releases, and GitHub's "latest" would pick an old stable sub-package
// tag over them. A repository without releases is left out; any other failure keeps that project's
// entry from the previous snapshot, so one bad request doesn't blank the list.
const output = new URL('../public/github-activity.json', import.meta.url);
const previous = existsSync(output) ? JSON.parse(readFileSync(output, 'utf8')).releases ?? [] : [];
const releases = [];
for (const project of readProjects()) {
  const repo = new URL(project.source).pathname.match(/^\/([\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/)?.[1];
  assert(new URL(project.source).hostname === 'github.com' && repo, `${project.slug}: source is not a GitHub repository`);
  const result = spawnSync('gh', ['api', `repos/${repo}/releases?per_page=30`], { encoding: 'utf8' });
  if (result.status !== 0) {
    console.warn(`${project.slug}: could not list releases of ${repo}; keeping the previous entry.`);
    releases.push(...previous.filter(release => release.slug === project.slug));
    continue;
  }
  const release = JSON.parse(result.stdout)
    .filter(item => !item.draft && item.published_at)
    .sort((a, b) => b.published_at.localeCompare(a.published_at))[0];
  if (!release) continue;
  releases.push({ slug: project.slug, name: project.name, tag: release.tag_name, title: release.name || release.tag_name, date: release.published_at, url: release.html_url });
}
releases.sort((a, b) => b.date.localeCompare(a.date));
for (const release of releases) {
  assert(['slug', 'name', 'tag', 'title', 'date', 'url'].every(key => typeof release[key] === 'string' && release[key]), `${release.slug}: incomplete release`);
  assert(!Number.isNaN(Date.parse(release.date)), `${release.slug}: release date`);
  assert(release.url.startsWith('https://github.com/'), `${release.slug}: release URL`);
}
assert.equal(new Set(releases.map(release => release.slug)).size, releases.length, 'One release per project');

const snapshot = { username, from: iso(start), to: iso(end), updatedAt: now.toISOString(), days, releases };
writeFileSync(`${output.pathname}.tmp`, JSON.stringify(snapshot, null, 2) + '\n');
renameSync(`${output.pathname}.tmp`, output);

console.log(`Updated ${username}: ${days.reduce((sum, day) => sum + day.count, 0)} contributions across ${days.length} days (${snapshot.from}–${snapshot.to}), ${releases.length} latest releases.`);
