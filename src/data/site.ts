export const site = {
  name: "Aryakumar Jha",
  url: "https://aryak.dev",
  description:
    "Aryakumar Jha is a software engineer at Zerodha in Bangalore. Explore his open-source Flutter and Dart tools, Rust projects, and writing.",
} as const;

export const person = {
  '@type': 'Person',
  '@id': `${site.url}/about#person`,
  name: site.name,
  alternateName: ['Arya Jha', 'Arya Kumar Jha', 'devaryakjha'],
  url: `${site.url}/about`,
  jobTitle: 'Software Engineer',
  description: 'Software engineer at Zerodha in Bangalore, working with Flutter, Dart, Rust, and Go.',
  worksFor: { '@type': 'Organization', name: 'Zerodha', url: 'https://zerodha.com' },
  sameAs: ['https://github.com/devaryakjha'],
};
