import ReaderClient from './ReaderClient';
import { getChapter } from '@/lib/api';

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL  || 'https://kiryuu.id';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Kiryuu';

async function getChapterData(slug, chapterSlug) {
  try {
    const res = await getChapter(slug, chapterSlug);
    if (!res?.success || !res?.data) return null;
    return res.data;
  } catch {
    return null;
  }
}

function cleanChapterTitle(mangaTitle, chapterTitle) {
  if (!chapterTitle) return chapterTitle;
  const escaped = mangaTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return chapterTitle.replace(new RegExp(`^${escaped}\\s*`, 'i'), '').trim();
}

export async function generateMetadata({ params }) {
  const { slug, chapterSlug } = await params;
  const data = await getChapterData(slug, chapterSlug);

  if (!data) {
    return {
      title: `Baca Komik - ${SITE_NAME}`,
      description: `Baca chapter komik online gratis di ${SITE_NAME}.`,
      robots: { index: false, follow: true },
    };
  }

  const { manga, chapter } = data;
  const cleanTitle   = cleanChapterTitle(manga.title, chapter.title);
  const title        = `${manga.title} ${cleanTitle} Bahasa Indonesia`;
  const description  = `Baca ${title} bahasa Indonesia gratis di ${SITE_NAME}`;
  const canonicalUrl = `${SITE_URL}/read/${slug}/${chapterSlug}`;
  const coverImage   = manga.coverImage || `${SITE_URL}/og-image.png`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'id_ID',
      images: [{ url: coverImage, width: 460, height: 650, alt: manga.title }],
    },
    robots: { index: true, follow: true, noarchive: true },
  };
}

export default async function ReaderPage({ params }) {
  const { slug, chapterSlug } = await params;
  const data = await getChapterData(slug, chapterSlug);

  const manga   = data?.manga;
  const chapter = data?.chapter;

  const cleanTitle   = manga && chapter
    ? cleanChapterTitle(manga.title, chapter.title)
    : chapterSlug;

  const canonicalUrl = `${SITE_URL}/read/${slug}/${chapterSlug}`;
  const mangaUrl     = `${SITE_URL}/manga/${slug}`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',           item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: manga?.title || 'Manga', item: mangaUrl },
      { '@type': 'ListItem', position: 3, name: cleanTitle,        item: canonicalUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ReaderClient />
    </>
  );
}
