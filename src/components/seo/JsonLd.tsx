import { SITE_CONFIG } from '@/lib/site';

export function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${SITE_CONFIG.url}/#webapp`,
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'All modern web browsers (Chrome, Safari, Firefox, Edge)',
        browserRequirements: 'Requires JavaScript. Requires HTML5 Canvas support.',
        description: SITE_CONFIG.description,
        image: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
        screenshot: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
        inLanguage: 'en-US',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'Infinite freeform hardware-accelerated canvas',
          '13 dynamic card types including notes, tasks, code, tables, audio, and embeds',
          'Milanote-style translucent section frames and auto-tidy 2D matrix alignment',
          'Curated workspace modes tailored for 10 creative roles',
          'Local-first offline storage with optional Supabase cloud synchronization',
          'Radar minimap and smart magnetic alignment guides',
          'Interactive web link and rich media embeds (YouTube, Spotify, Figma)',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_CONFIG.url}/#website`,
        url: SITE_CONFIG.url,
        name: SITE_CONFIG.name,
        description: SITE_CONFIG.description,
        inLanguage: 'en-US',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
