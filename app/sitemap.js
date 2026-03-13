import { getAllMangaSlugs } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://komikverse.com';

const DEPLOY_DATE = process.env.NEXT_PUBLIC_DEPLOY_DATE || '2025-01-01';

export const revalidate = 86400;

export default async function sitemap() {
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date(DEPLOY_DATE),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/manga`,
      lastModified: new Date(DEPLOY_DATE),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/genres`,
      lastModified: new Date(DEPLOY_DATE),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    const mangas = await getAllMangaSlugs();
    const mangaPages = mangas.map((manga) => ({
      url: `${SITE_URL}/manga/${manga.slug}`,

      lastModified: manga.lastUpdated
        ? new Date(manga.lastUpdated)
        : new Date(DEPLOY_DATE),
      changeFrequency: manga.status?.toLowerCase() === 'ongoing' ? 'daily' : 'weekly',
      priority: 0.8,
    }));

    return [...staticPages, ...mangaPages];
  } catch {
    return staticPages;
  }
}
