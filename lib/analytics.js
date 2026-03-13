import { logEvent } from './firebase';

export const trackPageView = (pageName, pageUrl) =>
  logEvent('page_view', { page_title: pageName, page_location: pageUrl });

export const trackMangaView = (manga) =>
  logEvent('view_item', {
    item_id: manga.slug,
    item_name: manga.title,
    item_category: manga.type || 'unknown',
    item_variant: manga.status || 'unknown',
    value: manga.rating || 0,
  });

export const trackReadChapter = (manga, chapterSlug) =>
  logEvent('read_chapter', {
    manga_slug: manga.slug,
    manga_title: manga.title,
    chapter_slug: chapterSlug,
    manga_type: manga.type || 'unknown',
  });

export const trackReadComplete = (manga, chapterSlug) =>
  logEvent('read_complete', {
    manga_slug: manga.slug,
    manga_title: manga.title,
    chapter_slug: chapterSlug,
  });

export const trackSearch = (keyword, resultCount = 0) =>
  logEvent('search', {
    search_term: keyword,
    result_count: resultCount,
  });

export const trackSearchClick = (keyword, mangaSlug) =>
  logEvent('select_search_result', {
    search_term: keyword,
    item_id: mangaSlug,
  });

export const trackBookmarkAdd = (manga) =>
  logEvent('add_to_wishlist', {
    item_id: manga.slug,
    item_name: manga.title,
  });

export const trackBookmarkRemove = (mangaSlug) =>
  logEvent('remove_from_wishlist', { item_id: mangaSlug });

export const trackLogin = (method) =>
  logEvent('login', { method });

export const trackSignUp = (method) =>
  logEvent('sign_up', { method });

export const trackGenreClick = (genre) =>
  logEvent('select_genre', { genre_name: genre });

export const trackFilter = (filterType, filterValue) =>
  logEvent('apply_filter', {
    filter_type: filterType,
    filter_value: filterValue,
  });

export const trackShare = (mangaSlug, method) =>
  logEvent('share', { item_id: mangaSlug, method });
