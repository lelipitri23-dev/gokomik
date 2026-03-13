export const READING_STATUS = {
  READING:  'reading',
  TO_READ:  'to_read',
  FINISHED: 'finished',
  DROPPED:  'dropped',
};

export const READING_STATUS_LABEL = {
  reading:  'Sedang Dibaca',
  to_read:  'Mau Dibaca',
  finished: 'Selesai',
  dropped:  'Dihentikan',
};

function proxyBase() {
  if (typeof window !== 'undefined') {
    return '/api';
  }
  const isDev = process.env.NODE_ENV === 'development';
  const siteUrl = isDev
    ? 'http://localhost:3000'
    : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  return `${siteUrl.replace(/\/+$/, '')}/api`;
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${proxyBase()}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    ...options,
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }
  return json.data;
}

export async function addBookmark(userId, manga, readingStatus = READING_STATUS.READING) {
  await apiFetch(`/users/${userId}/library`, {
    method: 'POST',
    body: JSON.stringify({
      slug: manga.slug,
      mangaData: {
        title:            manga.title            || '',
        coverImage:       manga.coverImage       || manga.thumb || '',
        type:             manga.type             || '',
        status:           manga.status           || '',
        rating:           manga.rating           || 0,
        readingStatus,
        lastChapterTitle: manga.last_chapter      || manga.lastChapterTitle || '',
        lastChapterSlug:  manga.last_chapter_slug || manga.lastChapterSlug  || '',
      },
    }),
  });
}

export async function removeBookmark(userId, mangaSlug) {
  await apiFetch(`/users/${userId}/library/${encodeURIComponent(mangaSlug)}`, {
    method: 'DELETE',
  });
}

export async function updateReadingStatus(userId, mangaSlug, readingStatus) {

  const library = await apiFetch(`/users/${userId}/library`);
  const item = library.find(b => b.slug === mangaSlug);
  if (!item) return;

  await apiFetch(`/users/${userId}/library`, {
    method: 'POST',
    body: JSON.stringify({
      slug: mangaSlug,
      mangaData: { ...item.mangaData, readingStatus },
    }),
  });
}

export async function isBookmarked(userId, mangaSlug) {
  if (!userId || !mangaSlug) return false;
  try {
    const library = await apiFetch(`/users/${userId}/library`);
    return library.some(b => b.slug === mangaSlug);
  } catch {
    return false;
  }
}

export async function getBookmarkData(userId, mangaSlug) {
  if (!userId || !mangaSlug) return null;
  try {
    const library = await apiFetch(`/users/${userId}/library`);
    const item = library.find(b => b.slug === mangaSlug);
    if (!item) return null;
    return normalizeLibraryItem(item);
  } catch {
    return null;
  }
}

export async function getUserBookmarks(userId) {
  if (!userId) return [];
  try {
    const library = await apiFetch(`/users/${userId}/library`);
    return library.map(normalizeLibraryItem);
  } catch (err) {
    console.error('[Bookmarks] getUserBookmarks error:', err.message);
    return [];
  }
}

export async function getPublicBookmarks(userId) {
  if (!userId) return [];
  try {
    const profile = await apiFetch(`/users/${userId}/public-profile`);
    return (profile.library || []).map(normalizeLibraryItem);
  } catch (err) {
    console.error('[Bookmarks] getPublicBookmarks error:', err.message);
    return [];
  }
}

export function calcBookmarkStats(bookmarks) {
  return bookmarks.reduce(
    (acc, b) => {
      const s = b.readingStatus || READING_STATUS.READING;
      if      (s === READING_STATUS.READING)  acc.reading++;
      else if (s === READING_STATUS.TO_READ)  acc.toRead++;
      else if (s === READING_STATUS.FINISHED) acc.finished++;
      else if (s === READING_STATUS.DROPPED)  acc.dropped++;
      return acc;
    },
    { reading: 0, toRead: 0, finished: 0, dropped: 0 }
  );
}

export async function toggleBookmark(userId, manga, readingStatus = READING_STATUS.READING) {
  const already = await isBookmarked(userId, manga.slug);
  if (already) {
    await removeBookmark(userId, manga.slug);
    return false;
  } else {
    await addBookmark(userId, manga, readingStatus);
    return true;
  }
}

function normalizeLibraryItem(item) {
  if (!item) return null;
  const d = item.mangaData || {};
  return {

    id:               item.slug,
    mangaSlug:        item.slug,
    slug:             item.slug,
    title:            d.title            || '',
    coverImage:       d.coverImage       || '',
    type:             d.type             || '',
    status:           d.status           || '',
    rating:           d.rating           || 0,
    readingStatus:    d.readingStatus    || READING_STATUS.READING,
    lastChapter:      d.lastChapterTitle || '',
    lastChapterSlug:  d.lastChapterSlug  || '',
    addedAt:          item.addedAt,

    mangaData:        d,
  };
}
