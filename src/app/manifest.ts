import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_CONFIG.title,
    short_name: SITE_CONFIG.shortName,
    description: SITE_CONFIG.description,
    start_url: '/',
    display: 'standalone',
    background_color: SITE_CONFIG.themeColorLight,
    theme_color: SITE_CONFIG.themeColorLight,
    icons: [
      {
        src: '/drag2placeLogo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/drag2placeLogo.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
