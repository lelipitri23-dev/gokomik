// ==========================================
// KONFIGURASI BASE URL
// ==========================================

const BACKEND = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '');
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

const getBase = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  // Server-side: if env accidentally points to this Next app (/api),
  // route through internal API to avoid missing direct backend endpoints.
  const sameHostApi = BACKEND.toLowerCase() === `${SITE_URL}/api`.toLowerCase();
  if (sameHostApi) {
    return `${SITE_URL}/api`;
  }
  return BACKEND;
};

// ==========================================
// NORMALISASI DATA
// ==========================================

export function normalizeManga(m) {
  if (!m) return null;
  const rating = parseFloat(m.rating) || 0;
  const chapters = Array.isArray(m.chapters) ? m.chapters : [];
  const latestChapter = chapters[0] || null;

  return {
    ...m,
    coverImage: m.coverImage || '',
    type: m.type || '',
    status: m.status || '',
    author: m.author || '',
    synopsis: m.synopsis || '',
    genres: m.genres || [],
    tags: m.genres || [],
    rating,
    chapter_count: m.chapter_count ?? chapters.length,
    last_chapter: m.last_chapter || latestChapter?.title || '',
    last_chapter_slug: m.last_chapter_slug || latestChapter?.slug || '',
    last_update: m.lastUpdated || m.updatedAt || null,
  };
}

export function normalizeMangaList(list = []) {
  return list.map(normalizeManga);
}

// ==========================================
// FETCH WRAPPER
// ==========================================

async function fetchAPI(endpoint, options = {}) {
  const base = getBase();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    const res = await fetch(`${base}${cleanEndpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'API Error');

    return json;
  } catch (err) {
    console.error(`[API] ${endpoint}:`, err.message);
    return { success: false, data: null, pagination: null, error: err.message };
  }
}

// ==========================================
// 1. HOME PAGE DATA
// ==========================================
export async function getHomeData() {
  const res = await fetchAPI('/home');
  if (!res.success || !res.data) return res;

  return {
    ...res,
    data: {
      trending: normalizeMangaList(res.data.trending || []),
      manhwas: normalizeMangaList(res.data.manhwas || []),
      manhuas: normalizeMangaList(res.data.manhuas || []),
      mangas: normalizeMangaList(res.data.mangas || []),
    },
  };
}

// ==========================================
// 2. MANGA LIST — Smart routing ke backend yang sesuai
// Backend:
//   GET /manga-list?page=&limit=         → semua manga A-Z
//   GET /search?q=...&page=&limit=       → cari by judul
//   GET /filter/genre/:val?page=&limit=  → filter genre
//   GET /filter/type/:val?page=&limit=   → filter type
//   GET /filter/status/:val?page=&limit= → filter status
// ==========================================
export async function getMangaList(params = {}) {
  const { q, genre, type, status, order, page = 1, limit = 24 } = params;

  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('limit', String(limit));

  if (q?.trim()) qs.set('q', q.trim());
  if (genre && genre !== 'all') qs.set('genre', genre);
  if (type && type !== 'all') qs.set('type', type);
  if (status && status !== 'all') qs.set('status', status);
  if (order && order !== 'latest') qs.set('order', order);

  const endpoint = `/manga-list?${qs.toString()}`;

  const res = await fetchAPI(endpoint);
  if (!res.success || !res.data) return res;

  return {
    ...res,
    data: normalizeMangaList(Array.isArray(res.data) ? res.data : []),
  };
}

// ==========================================
// 3. MANGA DETAIL
// Backend: GET /manga/:slug → { info, chapters }
// ==========================================
export async function getMangaDetail(slug) {
  const res = await fetchAPI(`/manga/${encodeURIComponent(slug)}`);
  if (!res.success || !res.data) return res;

  const info = normalizeManga(res.data.info);
  // Backend baru menaruh list chapter di data.info.chapters.
  const chapters = Array.isArray(res.data.chapters)
    ? res.data.chapters
    : (Array.isArray(info?.chapters) ? info.chapters : []);

  return {
    ...res,
    data: {
      info,
      chapters,
      recommendations: normalizeMangaList(res.data.recommendations || []),
    },
  };
}

// ==========================================
// 4. READ CHAPTER
// Backend: GET /read/:slug/:chapterSlug → { chapter, manga, navigation }
// ==========================================
export async function getChapter(slug, chapterSlug) {
  const res = await fetchAPI(
    `/read/${encodeURIComponent(slug)}/${encodeURIComponent(chapterSlug)}`
  );
  if (!res.success || !res.data) return res;

  return {
    ...res,
    data: {
      chapter: res.data.chapter,
      manga: normalizeManga(res.data.manga),
      navigation: res.data.navigation || { next: null, prev: null },
    },
  };
}

// ==========================================
// 5. GENRE LIST
// Backend: GET /genres → [{ name, count }]
// ==========================================
export async function getGenres() {
  return fetchAPI('/genres');
}

// ==========================================
// 6. USER API
// ==========================================

export async function syncUser(userData) {
  return fetchAPI('/users/sync', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function getUser(googleId) {
  return fetchAPI(`/users/${googleId}`);
}

export async function getUserLibrary(googleId, { page = 1, limit = 100 } = {}) {
  return fetchAPI(`/users/${googleId}/library?page=${page}&limit=${limit}`);
}

export async function addToLibrary(googleId, { slug, mangaData }) {
  return fetchAPI(`/users/${googleId}/library`, {
    method: 'POST',
    body: JSON.stringify({ slug, mangaData }),
  });
}

export async function removeFromLibrary(googleId, slug) {
  return fetchAPI(`/users/${googleId}/library/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
  });
}

// Ambil semua riwayat baca
export async function getUserHistory(googleId, { page = 1, limit = 100 } = {}) {
  return fetchAPI(`/users/${googleId}/history?page=${page}&limit=${limit}`, { cache: 'no-store' });
}

export async function addToHistory(googleId, historyData) {
  return fetchAPI(`/users/${googleId}/history`, {
    method: 'POST',
    body: JSON.stringify(historyData),
  });
}

// Hapus satu item history berdasarkan slug manga
export async function removeFromHistory(googleId, slug) {
  return fetchAPI(`/users/${googleId}/history/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
  });
}

// Hapus semua history (opsional filter by type)
export async function clearHistory(googleId, type = null) {
  const qs = type ? `?type=${encodeURIComponent(type)}` : '';
  return fetchAPI(`/users/${googleId}/history${qs}`, { method: 'DELETE' });
}

export async function getUserNotifications(googleId) {
  return fetchAPI(`/users/${googleId}/notifications`);
}

export async function markNotificationsRead(googleId) {
  return fetchAPI(`/users/${googleId}/notifications/read`, {
    method: 'PUT',
  });
}

export async function getPublicProfile(googleId) {
  return fetchAPI(`/users/${googleId}/public-profile`);
}

export async function updateBio(googleId, bio) {
  return fetchAPI(`/users/${googleId}/bio`, {
    method: 'PATCH',
    body: JSON.stringify({ bio }),
  });
}

// ==========================================
// 7. USER LIST PUBLIK
// Backend: GET /users?q=&page=&limit= → [{ googleId, displayName, ... }]
// ==========================================

export async function getUsers({ q = '', page = 1, limit = 20 } = {}) {
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('limit', String(limit));
  if (q.trim()) qs.set('q', q.trim());
  return fetchAPI(`/users?${qs.toString()}`);
}

// ==========================================
// 8. SITEMAP
// ==========================================
export async function getAllMangaSlugs() {
  const res = await fetchAPI(`/manga-list?page=1&limit=1000`);
  if (!res.success || !res.data) return [];
  return normalizeMangaList(Array.isArray(res.data) ? res.data : []);
}

// ==========================================
// 9. PROFILE (re-export untuk konsistensi)
// ==========================================
export { updateUserProfile } from './profile';