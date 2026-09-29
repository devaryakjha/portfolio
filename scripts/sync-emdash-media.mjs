import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile, rename } from 'node:fs/promises';
import sharp from 'sharp';
import { list, request, origin } from './cms-client.mjs';

await mkdir('public/cms', { recursive: true });
const snapshot = {};

async function image(value, alt, widths) {
  assert(value?.id && (!value.provider || value.provider === 'local'), 'Choose an uploaded CMS image');
  const metadata = await (await request(`/_emdash/api/media/${encodeURIComponent(value.id)}`)).json();
  assert(metadata.success, 'Invalid media metadata');
  const media = metadata.data?.item;
  assert(media?.status === 'ready' && /^[A-Za-z0-9._-]+$/.test(media.storageKey), 'CMS image is not ready');
  const source = new URL(`/_emdash/api/media/file/${media.storageKey}`, origin);
  assert(source.origin === origin.origin && source.pathname.startsWith('/_emdash/api/media/file/'), 'Invalid CMS media source');
  const response = await request(source);
  assert(response.headers.get('content-type')?.startsWith('image/'), 'CMS media must be an image');
  const bytes = Buffer.from(await response.arrayBuffer());
  assert(bytes.length <= 16 * 1024 * 1024, 'CMS image exceeds 16 MiB');
  const info = await sharp(bytes).metadata();
  assert(info.width && info.height, 'CMS image has no dimensions');
  const digest = createHash('sha256').update(bytes).digest('hex').slice(0, 20);
  const extension = info.format === 'jpeg' ? 'jpg' : info.format;
  const original = `/cms/${digest}-original.${extension}`;
  await writeFile(`public${original}`, bytes);
  const variants = [];
  for (const width of [...new Set(widths.map(w => Math.min(w, info.width)))]) {
    const url = new URL('/_image', origin);
    url.searchParams.set('href', source.href);
    url.searchParams.set('w', String(width));
    url.searchParams.set('f', 'webp');
    url.searchParams.set('q', '85');
    const transformed = Buffer.from(await (await request(url)).arrayBuffer());
    const size = await sharp(transformed).metadata();
    assert(size.format === 'webp' && size.width === width, 'Cloudflare returned an invalid image variant');
    const hash = createHash('sha256').update(transformed).digest('hex').slice(0, 20);
    const path = `/cms/${hash}-${width}.webp`;
    await writeFile(`public${path}`, transformed);
    variants.push({ path, width });
  }
  return {
    src: variants.at(-1).path,
    srcset: variants.map(v => `${v.path} ${v.width}w`).join(', '),
    original, width: info.width, height: info.height,
    alt: alt || media.alt || value.alt || '',
  };
}

for (const item of await list('images')) {
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) && !Object.hasOwn(snapshot, item.slug), 'Invalid or duplicate image key');
  const widths = item.slug === 'portrait' ? [240, 400, 640] : [640, 960, 1440];
  const value = item.data.image;
  snapshot[item.slug] = {
    light: await image(value, item.data.alt, widths),
    ...(value.darkVariant ? { dark: await image(value.darkVariant, item.data.alt, widths) } : {}),
  };
  snapshot[item.slug].dark ??= snapshot[item.slug].light;
}
for (const key of ['portrait', 'oore-dashboard', 'oore-builds']) assert(snapshot[key], `Publish the ${key} image entry`);
const output = 'src/data/media.snapshot.json';
await writeFile(`${output}.tmp`, `${JSON.stringify(snapshot, null, 2)}\n`);
await rename(`${output}.tmp`, output);
console.log(`Synced ${Object.keys(snapshot).length} image entries and Cloudflare-optimized static variants.`);
