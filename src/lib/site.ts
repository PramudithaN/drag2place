/**
 * Drag2Place Site Configuration & SEO Metadata Constants
 * Single source of truth for crawler indexing, OpenGraph tags, sitemap, and JSON-LD schema.
 */

export const SITE_CONFIG = {
  name: 'Drag2Place',
  title: 'Drag2Place | Aesthetic Spatial Workspace & Visual Dashboard',
  shortName: 'Drag2Place',
  description:
    'An open-source aesthetic spatial personal workspace and visual dashboard inspired by Milanote. Organize tasks, deadlines, markdown notes, code snippets, media, and moodboards on an infinite freeform canvas.',
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://drag2place.vercel.app'),
  ogImage: '/drag2place-display.png',
  logo: '/drag2placeLogo.png',
  creator: '@drag2place',
  locale: 'en_US',
  themeColorLight: '#FAF8F5',
  themeColorDark: '#141311',
  keywords: [
    'Drag2Place',
    'spatial workspace',
    'infinite canvas',
    'milanote alternative',
    'miro alternative',
    'visual dashboard',
    'moodboard creator',
    'personal wiki',
    'digital whiteboard',
    'markdown notes canvas',
    'local-first productivity',
    'developer scratchpad',
    'task organizer',
    'spatial canvas',
    'creative whiteboard',
    'project planning canvas',
    'freeform canvas note taking',
  ],
} as const;
