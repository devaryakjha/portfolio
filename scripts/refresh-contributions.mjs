import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, renameSync } from 'node:fs';

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
const snapshot = { username, from: iso(start), to: iso(end), updatedAt: now.toISOString(), days };
const output = new URL('../public/github-contributions.json', import.meta.url);
writeFileSync(`${output.pathname}.tmp`, JSON.stringify(snapshot, null, 2) + '\n');
renameSync(`${output.pathname}.tmp`, output);

console.log(`Updated ${username}: ${days.reduce((sum, day) => sum + day.count, 0)} contributions across ${days.length} days (${snapshot.from}–${snapshot.to}).`);
