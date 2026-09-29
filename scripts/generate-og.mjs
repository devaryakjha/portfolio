import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import matter from 'gray-matter';
import sharp from 'sharp';
import { work } from '../src/data/work.ts';

const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));
function lines(title) {
  const result = [''];
  for (const word of title.split(/\s+/)) {
    const last = result.length - 1;
    if (result[last] && `${result[last]} ${word}`.length > 23) result.push(word);
    else result[last] += `${result[last] ? ' ' : ''}${word}`;
  }
  assert.ok(result.length <= 3 && result.every(line => line.length <= 23), `Social title is too long: ${title}. Supply a shorter title.`);
  return result;
}
assert.equal(escape('A & <B>'), 'A &amp; &lt;B&gt;');
assert.deepEqual(lines('From the interface. To the internals.'), ['From the interface. To', 'the internals.']);

const media = JSON.parse(await fs.readFile('src/data/media.snapshot.json', 'utf8'));
const portraitSource = `public${media.portrait.light.original}`;
const portrait = (await sharp(portraitSource).png().toBuffer()).toString('base64');
async function generate(file, label, title, subtitle) {
  const titleLines = Array.isArray(title) ? title : lines(title);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#333"/></pattern></defs>
    <rect width="1200" height="630" fill="#080808"/>
    <path d="M48 48h1104v534H48zM48 136h1104M48 518h1104M826 136v382" fill="none" stroke="#333"/>
    <path d="M76 72h44v44H76z" fill="none" stroke="#666"/>
    <text x="84" y="102" fill="#eee" font-family="Arial,sans-serif" font-size="28" font-weight="800" letter-spacing="-4">aj</text>
    <text x="138" y="100" fill="#eee" font-family="Arial,sans-serif" font-size="20">Aryakumar Jha</text>
    <text x="1124" y="99" text-anchor="end" fill="#999" font-family="monospace" font-size="16">aryak.dev</text>
    <text x="76" y="190" fill="#999" font-family="monospace" font-size="15">${escape(label)}</text>
    ${titleLines.map((line,i)=>`<text x="72" y="${277+i*77}" fill="${i===titleLines.length-1&&titleLines.length>1?'#999':'#eee'}" font-family="Arial,sans-serif" font-size="68" letter-spacing="-3">${escape(line)}</text>`).join('')}
    <rect x="827" y="137" width="324" height="380" fill="url(#dots)"/>
    <image x="853" y="190" width="272" height="272" href="data:image/png;base64,${portrait}"/>
    <text x="76" y="556" fill="#aaa" font-family="monospace" font-size="15">${escape(subtitle)}</text>
    <text x="1124" y="556" text-anchor="end" fill="#777" font-family="monospace" font-size="14">Bangalore, India</text>
  </svg>`;
  const output = path.join('public', file);
  await fs.mkdir(path.dirname(output), { recursive: true });
  await sharp(Buffer.from(svg)).png().toFile(output);
}

await generate('og.png', 'Software engineer / Zerodha', ['From the interface.', 'To the internals.'], 'Native apps. Developer tools. Open source.');
await generate('blog/og.png', 'Writing / Aryakumar Jha', 'Field notes_', 'On making software and learning along the way.');
for (const project of work) {
  await generate(`projects/${project.slug}/og.png`, `${project.category} / ${project.language}`, project.name, project.short);
}
for (const file of (await fs.readdir('src/content/blog')).filter(file => file.endsWith('.md'))) {
  const slug = file.slice(0, -3);
  const { data } = matter(await fs.readFile(path.join('src/content/blog', file), 'utf8'));
  await generate(`blog/${slug}/og.png`, `Field notes / ${String(data.date).slice(0, 4)}`, data.shortTitle || data.title, 'Writing by Aryakumar Jha');
  // Preserve previously published Twitter image URLs; both platforms use one composition.
  await fs.copyFile(`public/blog/${slug}/og.png`, `public/blog/${slug}/twitter.png`);
}
await sharp('public/favicon.svg').resize(180, 180).png().toFile('public/apple-touch-icon.png');
console.log('Generated site, writing, and project social previews plus the home-screen icon.');
