import { getMangaDetail } from '@/lib/api';
import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kiryuu.online';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Kiryuu';

const AMP_BOILERPLATE = `body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`;
const AMP_NOSCRIPT = `body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}`;

const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d0d0d; color: #e0e0e0; }
header { background: #111; border-bottom: 1px solid #222; padding: 12px 16px; display: flex; align-items: center; gap: 12px; }
header a.back { font-size: 20px; color: #888; text-decoration: none; }
header h1 { font-size: 14px; font-weight: 800; color: #e53e3e; letter-spacing: 2px; }
.hero { display: flex; gap: 14px; padding: 16px; }
.cover { flex: none; width: 96px; border-radius: 10px; overflow: hidden; border: 2px solid #e53e3e; }
.info { flex: 1; }
.manga-title { font-size: 16px; font-weight: 800; color: #fff; line-height: 1.3; margin-bottom: 10px; }
.badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.badge { font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 99px; border: 1px solid; }
.badge-manhwa { background: #3d2680; border-color: #7c3aed; color: #a78bfa; }
.badge-manhua { background: #7c2d12; border-color: #ea580c; color: #fb923c; }
.badge-manga { background: #1e3a5f; border-color: #2563eb; color: #60a5fa; }
.badge-ongoing { background: #14532d; border-color: #16a34a; color: #4ade80; }
.badge-completed { background: #1f2937; border-color: #4b5563; color: #9ca3af; }
.meta { font-size: 11px; color: #999; margin-top: 4px; }
.section { padding: 0 16px 16px; }
.section-title { font-size: 10px; font-weight: 800; letter-spacing: 3px; color: #555; margin-bottom: 10px; padding-top: 14px; border-top: 1px solid #1a1a1a; text-transform: uppercase; }
.synopsis { font-size: 13px; color: #aaa; line-height: 1.7; }
.genres { display: flex; flex-wrap: wrap; gap: 6px; }
.genre-tag { font-size: 10px; font-weight: 700; padding: 4px 10px; background: #161616; border: 1px solid #2a2a2a; border-radius: 8px; color: #888; text-decoration: none; }
.chapter-list { display: flex; flex-direction: column; gap: 8px; }
.chapter-item { display: flex; align-items: center; justify-content: space-between; background: #161616; border: 1px solid #222; border-radius: 10px; padding: 10px 14px; text-decoration: none; color: #d0d0d0; }
.chapter-item span { font-size: 12px; font-weight: 600; }
.chapter-date { font-size: 10px; color: #555; }
.btn-full { display: block; text-align: center; margin: 16px; padding: 14px; background: #e53e3e; color: #fff; text-decoration: none; border-radius: 12px; font-size: 13px; font-weight: 800; letter-spacing: 1px; }
footer { padding: 20px 16px; border-top: 1px solid #1a1a1a; text-align: center; }
footer p { font-size: 11px; color: #555; }
`;

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export async function GET(request, { params }) {
  const { slug } = params;
  const res = await getMangaDetail(slug);
  if (!res?.data?.info) {
    return new NextResponse('Manga tidak ditemukan', { status: 404 });
  }

  const { info: manga, chapters = [] } = res.data;
  const coverImage = manga.coverImage || manga.thumb || '';
  const genres = manga.tags || manga.genres || [];
  const type = (manga.type || '').toLowerCase();
  const status = (manga.status || '').toLowerCase();
  const recentChapters = chapters.slice(0, 50);

  const badgeClass = type === 'manhwa' ? 'badge-manhwa' : type === 'manhua' ? 'badge-manhua' : 'badge-manga';
  const statusClass = status === 'ongoing' ? 'badge-ongoing' : 'badge-completed';

  const cover = coverImage
    ? `<div class="cover"><amp-img src="${escHtml(coverImage)}" alt="${escHtml(manga.title)}" width="96" height="136" layout="responsive"></amp-img></div>`
    : '';

  const genresHtml = genres.length > 0
    ? `<div class="section"><p class="section-title">Genre</p><div class="genres">${genres.map(g => `<a href="${SITE_URL}/manga?genre=${encodeURIComponent(g)}" class="genre-tag">${escHtml(g)}</a>`).join('')}</div></div>`
    : '';

  const synopsisHtml = manga.synopsis
    ? `<div class="section"><p class="section-title">Sinopsis</p><p class="synopsis">${escHtml(manga.synopsis)}</p></div>`
    : '';

  const chaptersHtml = recentChapters.length > 0
    ? `<div class="section">
        <p class="section-title">Daftar Chapter ${chapters.length > 50 ? `(50 dari ${chapters.length})` : ''}</p>
        <div class="chapter-list">${recentChapters.map(ch =>
          `<a href="${SITE_URL}/read/${escHtml(slug)}/${escHtml(ch.slug)}" class="chapter-item">
            <span>${escHtml(ch.title)}</span>
            ${ch.createdAt ? `<span class="chapter-date">${formatDate(ch.createdAt)}</span>` : ''}
          </a>`
        ).join('')}</div>
      </div>`
    : '';

  const html = `<!doctype html>
<html amp lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <link rel="canonical" href="${SITE_URL}/manga/${escHtml(slug)}">
  <title>${escHtml(manga.title)} - ${escHtml(SITE_NAME)}</title>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <style amp-boilerplate>${AMP_BOILERPLATE}</style>
  <noscript><style amp-boilerplate>${AMP_NOSCRIPT}</style></noscript>
  <style amp-custom>${CSS}</style>
</head>
<body>
  <header>
    <a href="${SITE_URL}" class="back">←</a>
    <h1>${escHtml(SITE_NAME)}</h1>
  </header>

  <div class="hero">
    ${cover}
    <div class="info">
      <h2 class="manga-title">${escHtml(manga.title)}</h2>
      <div class="badges">
        ${type ? `<span class="badge ${badgeClass}">${escHtml(manga.type)}</span>` : ''}
        ${status ? `<span class="badge ${statusClass}">${escHtml(manga.status)}</span>` : ''}
      </div>
      ${manga.author ? `<p class="meta">Pengarang: ${escHtml(manga.author)}</p>` : ''}
      ${manga.rating > 0 ? `<p class="meta">★ ${Number(manga.rating).toFixed(1)}</p>` : ''}
      <p class="meta">${chapters.length} Chapter</p>
    </div>
  </div>

  <a href="${SITE_URL}/manga/${escHtml(slug)}" class="btn-full">Baca Selengkapnya di ${escHtml(SITE_NAME)} →</a>

  ${genresHtml}
  ${synopsisHtml}
  ${chaptersHtml}

  <footer><p>© 2026 ${escHtml(SITE_NAME)} · Baca Manga Komik Bahasa Indonesia</p></footer>
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
