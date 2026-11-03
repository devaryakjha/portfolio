import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import vm from 'node:vm';

// Run after bun run build.
const root = path.resolve('dist');
const pages = fs.readdirSync(root, { recursive: true }).filter(p => p.endsWith('.html'));
const work = JSON.parse(fs.readFileSync('src/data/work.snapshot.json', 'utf8'));
const posts = fs.readdirSync('src/content/blog').filter(file => file.endsWith('.md'));
assert.equal(pages.length, 4 + posts.length + work.length, 'Home, about, projects, writing, posts, and 404');
const socialImages = new Set();
for (const slug of ['oore-build', 'chek', 'tagflow', 'gpuicn', 'anpec', 'seisei']) {
  if (!work.some(project => project.slug === slug)) continue;
  const html = fs.readFileSync(path.join(root, 'projects', slug, 'index.html'), 'utf8');
  assert.equal((html.match(/<figcaption(?:\s|>)/g) || []).length, 2, `${slug}: two labeled walkthrough examples`);
}
for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${page}: one heading`);
  assert.ok(html.includes('rel="canonical"'), `${page}: canonical URL`);
  const og = html.match(/property="og:image" content="([^"]+)"/)?.[1];
  const twitter = html.match(/name="twitter:image" content="([^"]+)"/)?.[1];
  assert.ok(og?.startsWith('https://aryak.dev/'), `${page}: absolute social image URL`);
  assert.equal(twitter, og, `${page}: consistent Twitter preview`);
  assert.ok(html.includes('property="og:image:alt"') && html.includes('name="twitter:image:alt"'), `${page}: image descriptions`);
  socialImages.add(path.join(root, new URL(og).pathname));
  assert.ok(!html.includes('theme.js'), `${page}: theme script is inlined`);
  for (const [, url] of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    const target = path.join(root, url);
    assert.ok(fs.existsSync(target) || fs.existsSync(path.join(target, 'index.html')), `${page}: missing ${url}`);
  }
}
for (const image of socialImages) {
  const { width, height, format } = await sharp(image).metadata();
  assert.deepEqual([width, height, format], [1200, 630, 'png'], `${image}: social image dimensions`);
}
const icon = await sharp(path.join(root, 'apple-touch-icon.png')).metadata();
assert.deepEqual([icon.width, icon.height], [180, 180], 'Home-screen icon dimensions');
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
// Profile and article markup must describe the same person and resolve to the canonical domain.
const readSchemas = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
const readSchema = html => readSchemas(html)[0] ?? null;
assert.equal(readSchema(home)['@type'], 'WebSite');
const about = fs.readFileSync(path.join(root, 'about/index.html'), 'utf8');
const profile = readSchema(about);
assert.equal(profile['@type'], 'ProfilePage');
assert.equal(profile.mainEntity.name, 'Aryakumar Jha');
assert.deepEqual(profile.mainEntity.alternateName, ['Arya Jha', 'Arya Kumar Jha', 'devaryakjha']);
assert.equal(profile.mainEntity.url, 'https://aryak.dev/about');
assert.deepEqual(profile.mainEntity.knowsAbout, ['Flutter', 'Dart', 'Swift', 'Rust', 'iOS', 'Go']);
for (const page of pages.filter(p => /^blog\/.+\/index.html$/.test(p))) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const [schema, breadcrumbs] = readSchemas(html);
  assert.equal(schema['@type'], 'BlogPosting');
  assert.equal(schema.author['@id'], profile.mainEntity['@id']);
  assert.equal(schema.publisher['@id'], profile.mainEntity['@id']);
  assert.ok(schema.dateModified && schema.mainEntityOfPage, `${page}: modified date and main entity`);
  assert.equal(breadcrumbs['@type'], 'BreadcrumbList');
  assert.deepEqual(breadcrumbs.itemListElement.map(item => item.name).slice(0, 2), ['Home', 'Writing']);
  for (const property of ['published_time', 'modified_time', 'author']) assert.ok(html.includes(`property="article:${property}"`), `${page}: article:${property}`);
}
// Apps are SoftwareApplication; libraries and packages are SoftwareSourceCode.
for (const project of work) {
  const html = fs.readFileSync(path.join(root, 'projects', project.slug, 'index.html'), 'utf8');
  const [schema, breadcrumbs] = readSchemas(html);
  assert.equal(schema['@type'], ['chek', 'oore-build'].includes(project.slug) ? 'SoftwareApplication' : 'SoftwareSourceCode', `${project.slug}: structured data type`);
  assert.equal(schema.name, project.name);
  assert.equal(schema.author['@id'], profile.mainEntity['@id']);
  if (schema['@type'] === 'SoftwareSourceCode') assert.equal(schema.codeRepository, project.source);
  assert.deepEqual(breadcrumbs.itemListElement.map(item => item.name), ['Home', 'Work', project.name]);
  assert.ok(html.includes(`<title>${project.name}: `), `${project.slug}: descriptive title`);
}
// Feeds and discovery files.
const postSlugs = posts.map(file => file.slice(0, -3));
assert.ok(home.includes('rel="alternate" type="application/rss+xml"'), 'RSS feed is advertised');
const rss = fs.readFileSync(path.join(root, 'rss.xml'), 'utf8');
for (const slug of postSlugs) assert.ok(rss.includes(`<link>https://aryak.dev/blog/${slug}</link>`), `RSS lists ${slug}`);
assert.equal((rss.match(/<content:encoded>/g) || []).length, postSlugs.length, 'RSS carries full posts');
assert.ok(!/(?:src|href)=&quot;\//.test(rss), 'RSS links are absolute');
const llms = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');
assert.ok(llms.startsWith('# Aryakumar Jha\n'));
for (const project of work) assert.ok(llms.includes(`(https://aryak.dev/projects/${project.slug})`), `llms.txt lists ${project.slug}`);
for (const slug of postSlugs) assert.ok(llms.includes(`(https://aryak.dev/blog/${slug})`), `llms.txt lists ${slug}`);
const headers = fs.readFileSync(path.join(root, '_headers'), 'utf8');
assert.ok(headers.includes('/_astro/*') && headers.includes('immutable') && headers.includes('X-Content-Type-Options: nosniff'), 'Pages headers');
assert.ok(fs.readFileSync(path.join(root, 'sitemap-0.xml'), 'utf8').includes('https://aryak.dev/about'));
// Exercise the real theme script with system preferences and unavailable storage.
const themeScript = fs.readFileSync('src/scripts/theme.js', 'utf8');
for (const [saved, dark, blocked, expected] of [[null, false, false, 'light'], [null, true, false, 'dark'], ['light', true, false, 'light'], ['dark', false, false, 'dark'], ['invalid', false, false, 'light'], [null, true, true, 'dark']]) {
  const root = { dataset: {} };
  const button = { hidden: true, setAttribute(_, value) { this.label = value; }, addEventListener(_, listener) { this.click = listener; } };
  const system = { matches: dark, addEventListener(_, listener) { this.change = listener; } };
  const meta = {};
  let ready, stored;
  vm.runInNewContext(themeScript, {
    document: { documentElement: root, querySelector: () => button, querySelectorAll: () => [meta], addEventListener(_, listener) { ready = listener; } },
    matchMedia: () => system,
    localStorage: { getItem() { if (blocked) throw Error('Blocked'); return saved; }, setItem(_, value) { if (blocked) throw Error('Blocked'); stored = value; } },
  });
  assert.equal(root.dataset.theme, expected, 'Theme applies before page content');
  ready();
  assert.equal(button.hidden, false);
  system.matches = !dark;
  system.change();
  const followsSystem = saved !== 'light' && saved !== 'dark';
  assert.equal(root.dataset.theme, followsSystem ? (dark ? 'light' : 'dark') : expected);
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  button.click();
  assert.equal(root.dataset.theme, next, 'Toggle works even without storage');
  assert.equal(button.label, `Switch to ${next === 'dark' ? 'light' : 'dark'} mode`);
  assert.equal(meta.content, next === 'dark' ? '#080808' : '#faf9f6');
  if (!blocked) assert.equal(stored, next, 'Saves explicit choice');
  system.matches = dark;
  system.change();
  assert.equal(root.dataset.theme, next, 'Explicit choice overrides system changes');
}
assert.deepEqual([...home.matchAll(/data-artwork="([^"]+)"/g)].map(m => m[1]), work.map(p => p.slug), 'Project artwork order matches published content');
// Verify loops stop offscreen and while the tab is hidden, then resume together.
{
  let intersect, visibilityChange;
  const artwork = { running: false, toggleAttribute(_, value) { this.running = value; }, removeAttribute() { this.running = false; } };
  const document = { hidden: false, querySelectorAll: () => [artwork], addEventListener(_, listener) { visibilityChange = listener; } };
  vm.runInNewContext(fs.readFileSync('src/scripts/artwork-motion.js', 'utf8'), {
    document,
    IntersectionObserver: class { constructor(listener) { intersect = listener; } observe() {} },
  });
  intersect([{ target: artwork, isIntersecting: true, intersectionRatio: 1 }]);
  assert.equal(artwork.running, true);
  document.hidden = true; visibilityChange();
  assert.equal(artwork.running, false, 'Hidden tabs pause artwork');
  document.hidden = false; visibilityChange();
  assert.equal(artwork.running, true, 'Returning to the tab resumes visible artwork');
  intersect([{ target: artwork, isIntersecting: false, intersectionRatio: 0 }]);
  assert.equal(artwork.running, false, 'Offscreen artwork pauses');
  visibilityChange();
  assert.equal(artwork.running, false, 'Offscreen artwork stays paused on tab changes');
}
// The published workbench must render real snapshot values.
const activity = JSON.parse(fs.readFileSync(path.join(root, 'github-contributions.json'), 'utf8'));
assert.equal((home.match(/data-detail=/g) || []).length, activity.days.length);
assert.ok(home.includes('id="workbench"') && !home.includes('illustrative'));
for (const day of activity.days) {
  const date = new Date(day.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
  assert.ok(home.replaceAll("Sept", "Sep").includes(`data-detail="${date.replace("Sept", "Sep")} · ${day.count} contribution${day.count === 1 ? '' : 's'}"`));
}
const sitemap = fs.readFileSync(path.join(root, 'sitemap-0.xml'), 'utf8');
assert.equal((sitemap.match(/<lastmod>/g) || []).length, (sitemap.match(/<loc>/g) || []).length, 'Every sitemap URL has lastmod');
assert.ok(!home.includes('bench-feed') && !home.includes('grid-ticker'), 'Removed home sections stay removed');
console.log(`Checked ${pages.length} pages, local links/assets, canonical URLs, sitemap, social previews, and ${work.length} project artworks.`);
