import { definePlugin } from 'emdash';

const collections = new Set(['projects', 'images']);
const endpoint = 'https://api.github.com/repos/devaryakjha/portfolio/actions/workflows/publish-portfolio.yml/dispatches';

async function dispatch(ctx) {
  const pending = await ctx.kv.getVersioned('pending-build');
  if (!pending) return;
  const token = process.env.PORTFOLIO_GITHUB_TOKEN;
  if (!token) throw new Error('PORTFOLIO_GITHUB_TOKEN is not configured; build remains queued');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2026-03-10',
      'User-Agent': 'aryakdev-cms',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ref: 'main', inputs: { source: 'cms' } }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Build trigger failed: HTTP ${response.status}; will retry`);
  await ctx.kv.compareAndDelete('pending-build', pending.revision);
  ctx.log.info('Portfolio build requested');
}

async function changed(event, ctx) {
  if (!collections.has(event.collection)) return;
  await ctx.kv.set('pending-build', { changedAt: new Date().toISOString() });
  // Preserve the event if GitHub is unavailable. The CMS minute trigger retries it.
  await ctx.cron?.schedule('retry-build', { schedule: '* * * * *' });
  await dispatch(ctx);
}

export function createPlugin() {
  return definePlugin({
    id: 'portfolio-publish',
    version: '1.0.0',
    capabilities: ['content:read'],
    hooks: {
      'content:afterPublish': changed,
      'content:afterUnpublish': changed,
      'content:afterDelete': changed,
      cron: async (event, ctx) => {
        if (event.name === 'retry-build') await dispatch(ctx);
      },
    },
  });
}
