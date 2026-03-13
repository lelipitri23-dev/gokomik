import { getHomeData } from '@/lib/api';
import Navbar from '@/components/Navbar';
import TrendingSlider from '@/components/TrendingSlider';
import MangaSection from '@/components/MangaSection';
import AdBanner from '@/components/AdBanner';
import SyncBanner from '@/components/SyncBanner';

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://komikcast.online';
const SITE_NAME_ENV = process.env.NEXT_PUBLIC_SITE_NAME || 'Komikcast';

export const metadata = {
  title: `${process.env.NEXT_PUBLIC_SITE_NAME} - Baca Manga Komik Bahasa Indonesia`,
  description: `Baca Manga Komik Bahasa Indonesia Update chapter terbaru setiap hari di ${process.env.NEXT_PUBLIC_SITE_NAME}!`,
  alternates: {
    canonical: SITE_URL,
    amphtml: `${SITE_URL}/amp`,
  },
};

export default async function HomePage() {
  const res = await getHomeData();
  const data = res?.data || {};

  const { recents = [], trending = [], manhwas = [], manhuas = [], mangas = [] } = data;
  const secondaryList = manhuas;
  const secondaryType = 'manhua';
  const secondaryTitle = 'MANHUA';

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />

      <main className="pt-14 pb-safe max-w-2xl mx-auto">
        <SyncBanner />
        {}
        <TrendingSlider trending={trending} />

        {}
        <AdBanner slot="HEADER_BANNER" className="px-4 my-2" />

        {}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {[
            { label: 'Terbaru', href: '/manga?order=latest' },
            { label: '19+', href: '#' },
            { label: 'Populer', href: '/manga?order=popular' },
            { label: 'Manga', href: '/manga?type=manga' },
            { label: 'Manhwa', href: '/manga?type=manhwa' },
            { label: 'Manhua', href: '/manga?type=manhua' },
            { label: 'Changelog', href: '/changelog' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex-none text-xs font-bold px-3 py-1.5 rounded-full bg-bg-elevated border border-border text-text-secondary hover:border-accent-red hover:text-accent-red transition-colors whitespace-nowrap"
            >
              {item.label}
            </a>
          ))}
        </div>

        {}
        {manhwas.length > 0 && (
          <MangaSection
            title="MANHWA"
            mangas={manhwas}
            href="/manga?type=manhwa"
          />
        )}

        {}
        <AdBanner slot="IN_CONTENT" className="px-4 my-3" />

        {}
        {secondaryList.length > 0 && (
          <MangaSection
            title={secondaryTitle}
            mangas={secondaryList}
            href={`/manga?type=${secondaryType}`}
          />
        )}

        {}
        {mangas.length > 0 && (
          <MangaSection
            title="MANGA"
            mangas={mangas}
            href="/manga?type=manga"
          />
        )}

        {}
        <footer className="px-4 pt-6 pb-2 border-t border-border mt-4">
          <div className="flex justify-center gap-4 mb-2">
            <a href="/privacy-policy" className="text-xs text-text-secondary hover:text-accent-red">
              Privacy Policy
            </a>
            <a href="/terms" className="text-xs text-text-secondary hover:text-accent-red">
              Terms of Service
            </a>
          </div>
          <p className="text-center text-text-muted text-xs">
            © 2026 {process.env.NEXT_PUBLIC_SITE_NAME} · Baca Manga Komik Bahasa Indonesia
          </p>
        </footer>
      </main>
    </div>
  );
}
