import assert from 'node:assert/strict';

export const origin = new URL(process.env.EMDASH_URL || 'https://cms.aryak.dev');
assert(origin.protocol === 'https:' || (origin.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(origin.hostname)), 'CMS must use HTTPS');
assert(process.env.EMDASH_TOKEN, 'Set EMDASH_TOKEN');
const headers = { Authorization: `Bearer ${process.env.EMDASH_TOKEN}` };
const id = process.env.CF_ACCESS_CLIENT_ID;
const secret = process.env.CF_ACCESS_CLIENT_SECRET;
assert(Boolean(id) === Boolean(secret), 'Set both Cloudflare Access token fields');
if (id) Object.assign(headers, { 'CF-Access-Client-Id': id, 'CF-Access-Client-Secret': secret });

export async function request(path) {
  const url = new URL(path, origin);
  assert(url.origin === origin.origin, 'CMS credentials must stay on the CMS origin');
  const response = await fetch(url, { headers, redirect: 'error', signal: AbortSignal.timeout(30000) });
  assert(response.ok, `CMS request failed: ${url.pathname}, HTTP ${response.status}`);
  return response;
}

export async function list(collection) {
  const items = [];
  let cursor;
  do {
    const url = new URL(`/_emdash/api/content/${collection}`, origin);
    url.searchParams.set('status', 'published');
    url.searchParams.set('limit', '100');
    if (cursor) url.searchParams.set('cursor', cursor);
    const body = await (await request(url)).json();
    assert(body.success && Array.isArray(body.data?.items), 'Invalid CMS content response');
    items.push(...body.data.items);
    cursor = body.data.nextCursor;
  } while (cursor);
  return items;
}
