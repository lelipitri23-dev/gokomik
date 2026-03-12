import { getHomeData } from '@/lib/api';
import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://komikcast.online';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Komikcast';

const AMP_BOILERPLATE = `body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`;
const AMP_NOSCRIPT = `body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}`;

const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d0d0d; color: #e0e0e0; }
header { background: #111; border-bottom: 1px solid #222; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; }
header h1 { font-size: 20px; font-weight: 800; color: #e53e3e; letter-spacing: 2px; }
header a { font-size: 12px; color: #888; text-decoration: none; }
.section { padding: 16px; }
.section-title { font-size: 11px; font-weight: 800; letter-spacing: 3px; color: #666; margin-bottom: 12px; text-transform: uppercase; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.card { background: #161616; border: 1px solid #222; border-radius: 10px; overflow: hidden; text-decoration: none; display: block; }
.card-info { padding: 8px; }
.card-title { font-size: 11px; font-weight: 700; color: #e0e0e0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-meta { font-size: 10px; color: #888; margin-top: 4px; }
.badge { display: inline-block; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 99px; margin-top: 4px; }
.badge-manhwa { background: #3d2680; color: #a78bfa; }
.badge-manhua { background: #7c2d12; color: #fb923c; }
.badge-manga { background: #1e3a5f; color: #60a5fa; }
footer { padding: 20px 16px; border-top: 1px solid #222; text-align: center; margin-top: 16px; }
footer p { font-size: 11px; color: #555; }
footer a { color: #888; text-decoration: none; margin: 0 8px; font-size: 11px; }
`;

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET() {
  const res = await getHomeData();
  const data = res?.data || {};
  const { trending = [], manhwas = [], manhuas = [], mangas = [], manhuas = [] } = data;

  const allManga = [
    ...trending.slice(0, 6),
    ...manhwas.slice(0, 6),
    ...manhuas.slice(0, 4),
    ...mangas.slice(0, 6),
    ...manhuas.slice(0, 4),
  ].filter((m, i, arr) => arr.findIndex((x) => x.slug === m.slug) === i).slice(0, 30);

  const cards = allManga.map((manga) => {
    const type = (manga.type || '').toLowerCase();
    const badgeClass = type === 'manhwa' ? 'badge-manhwa' : type === 'manhua' ? 'badge-manhua' : 'badge-manga';
    const cover = manga.coverImage
      ? `<amp-img src="${escHtml(manga.coverImage)}" alt="${escHtml(manga.title)}" width="120" height="170" layout="responsive"></amp-img>`
      : '';
    return `
      <a href="${SITE_URL}/manga/${escHtml(manga.slug)}" class="card">
        ${cover}
        <div class="card-info">
          <p class="card-title">${escHtml(manga.title)}</p>
          ${type ? `<span class="badge ${badgeClass}">${escHtml(manga.type)}</span>` : ''}
          ${manga.last_chapter ? `<p class="card-meta">${escHtml(manga.last_chapter)}</p>` : ''}
        </div>
      </a>`;
  }).join('');

  const html = `<!doctype html>
<html amp lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <link rel="canonical" href="${SITE_URL}">
  <title>${escHtml(SITE_NAME)} - Baca Manga Komik Bahasa Indonesia</title>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <style amp-boilerplate>${AMP_BOILERPLATE}</style>
  <noscript><style amp-boilerplate>${AMP_NOSCRIPT}</style></noscript>
  <style amp-custom>${CSS}</style>
</head>
<body>
  <header>
    <h1>${escHtml(SITE_NAME)}</h1>
    <a href="${SITE_URL}">Versi Lengkap →</a>
  </header>
  <div class="section">
    <p class="section-title">Manga Terbaru</p>
    <div class="grid">${cards}</div>
  </div>
  <footer>
    <a href="${SITE_URL}/privacy-policy">Privacy Policy</a>
    <a href="${SITE_URL}/terms">Terms of Service</a>
    <p>© 2026 ${escHtml(SITE_NAME)} · Baca Manga Komik Bahasa Indonesia</p>
  </footer>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
