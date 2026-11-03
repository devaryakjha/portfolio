// The portrait and Oore screenshots, served from public/. Each has 640, 960 and 1440 pixel
// WebP variants (240, 400 and 640 for the portrait) and a full-size file the screenshots link to.
type Image = { src: string; srcset: string; original: string; width: number; height: number; alt: string };

const screenshot = (name: string, alt: string): Image => {
  const path = `/projects/oore-build/${name}`;
  return {
    src: `${path}-1440.webp`,
    srcset: `${path}-640.webp 640w, ${path}-960.webp 960w, ${path}-1440.webp 1440w`,
    original: `${path}-full.webp`,
    width: 1440,
    height: 900,
    alt,
  };
};
const dashboardAlt = 'Oore dashboard showing running builds, the queue, runner availability, and a source error that needs attention.';
const buildsAlt = 'Oore builds list with projects, queued and running jobs, completed builds, branches, commits, and build triggers.';

export const media = {
  portrait: {
    light: {
      src: '/portrait/arya-640.webp',
      srcset: '/portrait/arya-240.webp 240w, /portrait/arya-400.webp 400w, /portrait/arya-640.webp 640w',
      original: '/portrait/arya-640.webp',
      width: 1254,
      height: 1254,
      alt: 'Line drawing of Arya with glasses and a crooked grin',
    },
  },
  'oore-dashboard': {
    light: screenshot('dashboard-light', dashboardAlt),
    dark: screenshot('dashboard-dark', dashboardAlt),
  },
  'oore-builds': {
    light: screenshot('builds-light', buildsAlt),
    dark: screenshot('builds-dark', buildsAlt),
  },
} satisfies Record<string, Record<string, Image>>;
