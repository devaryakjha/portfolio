import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import vm from 'node:vm';

// Run after bun run build.
const root = path.resolve('dist');
const pages = fs.readdirSync(root, { recursive: true }).filter(p => p.endsWith('.html'));
assert.equal(pages.length, 11, 'Home, six projects, writing, two posts, and 404');
assert.ok(!fs.existsSync(path.join(root, 'explore')), 'No preview routes');
const socialImages = new Set();
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
  assert.ok(!/noindex|\/explore\/|Compare designs|theme\.js/.test(html), `${page}: final presentation`);
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
assert.equal(new Set([...home.matchAll(/data-artwork="([^"]+)"/g)].map(m => m[1])).size, 6, 'Six distinct project artworks');
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
const sitemap = fs.readFileSync(path.join(root, 'sitemap-0.xml'), 'utf8');
assert.ok(!sitemap.includes('/explore/'), 'No preview URLs in sitemap');
console.log(`Checked ${pages.length} pages, local links/assets, canonical URLs, sitemap, social previews, and six project artworks.`);
