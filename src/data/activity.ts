import snapshot from '../../public/github-activity.json';

// Written by scripts/refresh-github.mjs at publish time; builds read the committed snapshot.
export type Release = { slug: string; name: string; tag: string; title: string; date: string; url: string };
export type Activity = {
  username: string;
  from: string;
  to: string;
  updatedAt: string;
  days: { date: string; count: number; level: number }[];
  releases: Release[];
};

export const activity: Activity = { ...snapshot, releases: snapshot.releases ?? [] };
export const latestRelease = (slug: string) => activity.releases.find(release => release.slug === slug);
export const formatDate = (date: string, options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }) =>
  new Date(date).toLocaleDateString('en-GB', { ...options, timeZone: 'UTC' });
