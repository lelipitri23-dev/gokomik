'use client';
import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';

const PAGE_SIZE = 50;

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function ChapterList({ chapters = [], mangaSlug }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chapters;
    return chapters.filter(
      (ch) =>
        ch.title?.toLowerCase().includes(q) ||
        ch.slug?.toLowerCase().includes(q)
    );
  }, [chapters, query]);

  const handleSearch = useCallback((e) => {
    setQuery(e.target.value);
    setPage(1);
  }, []);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const displayed = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = page < totalPages;

  return (
    <div>
      {}
      {chapters.length > 20 && (
        <div className="mb-3 relative">
          <input
            type="search"
            placeholder="Cari chapter..."
            value={query}
            onChange={handleSearch}
            className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-red transition-colors pr-10"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              aria-label="Hapus pencarian"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {}
      {query && (
        <p className="text-[10px] text-text-muted mb-2">
          {filtered.length === 0
            ? 'Chapter tidak ditemukan'
            : `${filtered.length} chapter ditemukan`}
        </p>
      )}

      {}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1" style={{ contentVisibility: 'auto' }}>
        {displayed.length === 0 ? (
          <p className="text-center text-text-muted text-sm py-8">
            Tidak ada chapter.
          </p>
        ) : (
          displayed.map((ch) => (
            <Link
              key={ch.slug}
              href={`/read/${mangaSlug}/${ch.slug}`}
              className="chapter-item group flex items-center justify-between p-3 rounded-xl bg-bg-elevated border border-border hover:border-accent-red transition-all"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary group-hover:text-accent-red transition-colors truncate">
                  {ch.title}
                </p>
                {ch.createdAt && (
                  <p className="text-[10px] text-text-muted mt-0.5">{formatDate(ch.createdAt)}</p>
                )}
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-text-muted group-hover:text-accent-red flex-shrink-0 ml-2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))
        )}
      </div>

      {}
      {hasMore && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="mt-3 w-full py-3 rounded-xl bg-bg-elevated border border-border text-text-secondary text-sm font-semibold hover:border-accent-red hover:text-accent-red transition-all"
        >
          Muat lebih banyak ({filtered.length - displayed.length} tersisa)
        </button>
      )}
    </div>
  );
}
