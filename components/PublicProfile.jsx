'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getPublicBookmarks, calcBookmarkStats, READING_STATUS } from '@/lib/bookmarks';
import { getPublicProfile, updateUserProfile, calcUserLevel, getUserShortId } from '@/lib/profile';
import { useAuth } from '@/context/AuthContext';
import PremiumSubscribe from '@/components/PremiumSubscribe';

// ─── Badge ────────────────────────────────────────────────
function Badge({ count }) {
  if (count >= 1000) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 border border-yellow-500/50 text-yellow-400">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
      {Math.floor(count / 1000)}K+ Komik
    </span>
  );
  if (count >= 100) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 border border-purple-500/50 text-purple-400">
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2L2 9l10 13 10-13L12 2zm0 3.5L19 9l-7 9-7-9 7-7.5z" /></svg>
      Kolektor
    </span>
  );
  if (count >= 50) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 border border-blue-500/50 text-blue-400">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>
      Pembaca Aktif
    </span>
  );
  return null;
}

// ─── Stat Card ────────────────────────────────────────────
function StatCard({ value, label, color }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[60px]">
      <span className={`font-display text-xl font-bold ${color}`}>{value}</span>
      <span className="text-text-muted text-[10px] font-medium leading-tight text-center">{label}</span>
    </div>
  );
}

// ─── MangaCard (List Style) ───────────────────────────────
function MangaCard({ bookmark: b }) {
  // Simulate progress bar based on lastChapter / chapter count or random
  const progressPercent = Math.min(100, Math.floor(Math.random() * 50) + 20); 

  return (
    <Link href={`/manga/${b.slug}`} className="group flex gap-3 p-3 bg-bg-elevated border border-border rounded-xl hover:border-accent-red/50 transition-colors">
      {/* Thumbnail */}
      <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-bg-card">
        {b.coverImage ? (
          <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-border flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-text-muted"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7h8M8 12h8M8 17h5" /></svg>
          </div>
        )}
      </div>
      
      {/* Info */}
      <div className="flex flex-col flex-1 py-1 overflow-hidden">
        <h3 className="text-text-primary text-sm font-bold line-clamp-1 group-hover:text-accent-red transition-colors">{b.title}</h3>
        <p className="text-text-muted text-xs mt-1">
          Chapter {b.lastChapter || '1'} • <span className="opacity-80">2 jam lalu</span>
        </p>
        
        {/* Progress Bar */}
        <div className="mt-auto">
          <div className="flex items-center justify-between text-[10px] text-text-muted mb-1 font-semibold">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-bg-card rounded-full h-1.5 overflow-hidden">
            <div className="bg-accent-red h-full rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────
const TABS = [
  { key: 'all', label: 'All' },
  { key: 'comments', label: 'Comments' },
  { key: 'history', label: 'History' },
];

// ─── Edit Profile Modal ───────────────────────────────────
function EditProfileModal({ profile, onSave, onClose }) {
  const { uploadPhoto } = useAuth();
  const [name, setName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [preview, setPreview] = useState(profile?.photoURL || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  // Pilih foto dari device
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview lokal instan
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setError('');
    setUploading(true);

    try {
      const url = await uploadPhoto(file);
      setPhotoURL(url);
      setPreview(url);
    } catch (err) {
      setError('Gagal upload foto: ' + err.message);
      setPreview(photoURL); // rollback preview
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (name.trim().length < 2) { setError('Nama minimal 2 karakter'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({ displayName: name.trim(), photoURL, bio });
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  const initials = name?.[0]?.toUpperCase() || '?';

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-bg-card border border-border rounded-2xl overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-text-primary text-base">Edit Profil</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Foto Profil */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-accent-red/50 bg-bg-elevated">
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-accent-red/30 to-purple-900/50 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{initials}</span>
                  </div>
                )}
              </div>
              {/* Spinner overlay saat upload */}
              {uploading && (
                <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center">
                  <svg className="animate-spin w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
                  </svg>
                </div>
              )}
              {/* Tombol kamera */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-accent-red border-2 border-bg-card flex items-center justify-center hover:bg-accent-redDark transition-colors disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-3.5 h-3.5">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <p className="text-text-muted text-[11px]">Ketuk ikon kamera untuk ganti foto</p>
          </div>

          {/* Nama */}
          <div>
            <label className="block text-text-secondary text-xs font-semibold mb-1.5">Nama Tampilan</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={50}
              placeholder="Masukkan nama..."
              className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 text-text-primary text-sm outline-none focus:border-accent-red transition-colors placeholder-text-muted"
            />
            <p className="text-text-muted text-[10px] mt-1 text-right">{name.length}/50</p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-text-secondary text-xs font-semibold mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={100}
              rows={2}
              placeholder="Tulis sesuatu tentang dirimu..."
              className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2.5 text-text-primary text-sm outline-none focus:border-accent-red transition-colors placeholder-text-muted resize-none"
            />
            <p className="text-text-muted text-[10px] mt-1 text-right">{bio.length}/100</p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-text-secondary text-sm font-semibold hover:border-accent-red/50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex-1 py-2.5 rounded-xl bg-accent-red text-white text-sm font-bold hover:bg-accent-redDark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
                </svg>
                Menyimpan...
              </>
            ) : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────
export default function PublicProfile({ userId }) {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const tabsRef = useRef(null);

  const isOwn = user?.uid === userId;

  useEffect(() => {
    if (!userId) return;
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileData, bookmarkData] = await Promise.all([
        getPublicProfile(userId),
        getPublicBookmarks(userId),
      ]);
      setProfile(profileData);
      setBookmarks(bookmarkData);
    } catch (err) {
      console.error('[PublicProfile] load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async ({ displayName, photoURL, bio }) => {
    const updated = await updateUserProfile(userId, { displayName, photoURL, bio });
    setProfile(prev => ({ ...prev, ...updated }));
    await refreshUser({ displayName, photoURL });
  };

  const stats = calcBookmarkStats(bookmarks);
  const total = bookmarks.length;
  // Fallback rendering
  const filtered = activeTab === 'comments' ? [] : bookmarks;
  const tabCount = (key) => key === 'comments' ? profile?.stats?.totalComments || 0 : total;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile && !loading && bookmarks.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Navbar />
        <div className="pt-24 flex flex-col items-center gap-4 text-center px-4">
          <div className="w-16 h-16 bg-bg-elevated rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-text-muted">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <p className="font-display text-xl text-text-secondary tracking-wider">PENGGUNA TIDAK DITEMUKAN</p>
          <p className="text-text-muted text-sm">Profil ini tidak ada atau belum pernah login.</p>
          <Link href="/" className="mt-2 px-6 py-3 bg-accent-red text-white font-bold rounded-xl text-sm">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  const displayName = profile?.displayName || 'Pengguna';
  const handle = `@${displayName.toLowerCase().replace(/\s+/g, '')}`;

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />

      {showEditProfile && (
        <EditProfileModal
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}

      <main className="pt-14 pb-24 max-w-2xl mx-auto">
        <div className="relative mx-4 mt-5 bg-bg-card border border-border rounded-2xl overflow-hidden">
          {profile?.isPremium ? (
            <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/xT9KVmINRKGsIzd0YM/giphy.gif')] bg-cover bg-center opacity-20 pointer-events-none mix-blend-screen" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-accent-red/5 via-transparent to-purple-900/10 pointer-events-none" />
          )}
          <div className="relative p-6 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-bg-elevated shadow-xl mb-3">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accent-red/50 to-purple-900/80 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{displayName[0]?.toUpperCase()}</span>
                </div>
              )}
            </div>

            {/* Nama */}
            <h1 className="font-display text-2xl text-text-primary tracking-wide leading-none">{displayName}</h1>
            <p className="text-text-muted text-sm font-semibold mt-1">{handle}</p>

            {/* Baris Badges */}
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-gray-800 text-xs font-bold text-gray-200 border border-gray-700">
                {profile?.isAdmin ? 'Admin' : profile?.isPremium ? 'Premium User' : 'Member Biasa'}
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-800 text-xs font-bold text-gray-200 border border-gray-700">
                Lvl. {calcUserLevel(profile?.stats?.totalReadingMinutes || 0)}
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-800 text-xs font-bold text-gray-400 border border-gray-700">
                {getUserShortId(profile?._id || profile?.googleId || userId)}
              </span>
            </div>

            <div className="mt-4 max-w-sm w-full">
              <p className="text-text-muted text-sm italic leading-relaxed">
                {profile?.bio ? `"${profile.bio}"` : isOwn ? 'Belum ada bio. Klik edit untuk menambahkan.' : ''}
              </p>
              {isOwn && (
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-bg-elevated text-text-primary text-xs font-bold hover:bg-border transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  Edit Profil
                </button>
              )}
            </div>
            
            {/* Stats Baris */}
            <div className="mt-6 w-full pt-5 border-t border-border flex items-center justify-between px-2">
              <StatCard value={profile?.stats?.totalReadingMinutes || 0} label="Menit Membaca" color="text-accent-red" />
              <div className="w-px h-10 bg-border" />
              <StatCard value={profile?.stats?.totalComments || 0} label="Komentar" color="text-blue-400" />
              <div className="w-px h-10 bg-border" />
              {/* Fallback to registeredAt or assume current month if missing */}
              <StatCard 
                value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : 'Mar 2026'} 
                label="Bergabung" 
                color="text-gray-300" 
              />
            </div>
          </div>
        </div>

        {/* ─── Premium Subscription Block ─── */}
        {isOwn && !profile?.isPremium && (
          <div className="mt-5 px-4">
            <PremiumSubscribe />
          </div>
        )}

        {/* Bookmarks */}
        <div className="mt-5 px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base text-text-primary tracking-widest">BOOKMARKS</h2>
            <span className="text-text-muted text-xs font-semibold">{total} Komik</span>
          </div>
          <div ref={tabsRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4 -mx-1 px-1">
            {TABS.map(tab => {
              const count = tabCount(tab.key);
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === tab.key ? 'bg-accent-red text-white shadow-lg shadow-accent-red/30' : 'bg-bg-card border border-border text-text-muted hover:border-accent-red/40 hover:text-text-secondary'}`}
                >
                  {tab.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-bg-elevated text-text-muted'}`}>{count}</span>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-14 h-14 bg-bg-elevated rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-text-muted"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
              </div>
              <p className="text-text-secondary font-semibold text-sm">Tidak ada komik di sini</p>
              {isOwn && activeTab === 'all' && (
                <Link href="/manga" className="mt-1 px-5 py-2.5 bg-accent-red text-white font-bold rounded-xl text-sm hover:bg-accent-redDark transition-colors">Jelajahi Komik</Link>
              )}
            </div>
          )}
          {filtered.length > 0 && (
            <div className="flex flex-col gap-3">
              {filtered.map(b => <MangaCard key={b.slug} bookmark={b} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
