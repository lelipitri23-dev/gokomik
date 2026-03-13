'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { calcUserLevel, getUserShortId } from '@/lib/profile';
import { useAuth } from '@/context/AuthContext';

function timeAgo(dateParam) {
  if (!dateParam) return '';
  const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
  const todaysDate = new Date();
  const seconds = Math.round((todaysDate - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return `${seconds} detik lalu`;
  else if (minutes < 60) return `${minutes} menit lalu`;
  else if (hours < 24) return `${hours} jam lalu`;
  else return `${days} hari lalu`;
}

function CommentItem({ comment }) {
  const { user, text, createdAt } = comment;
  const isPremium = user?.isPremium;
  const isAdmin = user?.isAdmin;

  const RoleBadge = () => {
    if (isAdmin) {
      return <span className="px-2 py-0.5 rounded-full border border-red-500 text-red-500 font-bold bg-red-500/10 text-[10px]">Admin</span>;
    }
    if (isPremium) {
      return <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white font-bold text-[10px]">Premium User</span>;
    }
    return <span className="px-2 py-0.5 rounded-full border border-gray-500 text-gray-400 font-bold text-[10px] bg-transparent">Member Biasa</span>;
  };

  return (
    <div className="flex gap-3 mb-5 mt-2">
      {}
      <Link href={`/user/${user?.id || user?.googleId}`} className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-bg-elevated border-2 border-border">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-red/30 to-purple-900/50">
              <span className="text-white font-bold text-lg">{user?.displayName?.[0]?.toUpperCase()}</span>
            </div>
          )}
        </div>
      </Link>

      {}
      <div className="flex-1 w-full min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1 flex-wrap">
          <Link href={`/user/${user?.id || user?.googleId}`} className="font-bold text-text-primary hover:text-accent-red transition-colors">
            {user?.displayName}
          </Link>
          <span>•</span>
          <span>{timeAgo(createdAt)}</span>
        </div>

        {}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className="font-bold text-[10px] text-text-secondary">Lvl. {calcUserLevel(user?.totalReadingMinutes || 0)}</span>
          <RoleBadge />
          <span className="text-gray-500 text-[10px] font-semibold">{getUserShortId(user?.id)}</span>
        </div>

        {}
        <p className="text-sm text-text-secondary leading-relaxed break-words whitespace-pre-wrap">{text}</p>

        {}
        <div className="mt-2 flex items-center gap-4">
          <button className="text-blue-500 hover:text-blue-400 font-bold text-xs flex items-center gap-1 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><polyline points="15 10 20 15 15 20"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></svg>
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CommentList({ slug, initialComments = [] }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [showFab, setShowFab] = useState(false);

  useEffect(() => {
    const handleScroll = () => {

      if (window.scrollY > 500) {
        setShowFab(true);
      } else {
        setShowFab(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadNewComments = () => {

    console.log('Memuat komentar baru...');
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;
    const comment = {
      id: Date.now(),
      user: {
        id: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isPremium: user.isPremium,
        isAdmin: user.isAdmin,
        totalReadingMinutes: user.stats?.totalReadingMinutes || 0
      },
      text: newComment.trim(),
      createdAt: new Date().toISOString()
    };
    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <div className="relative mt-8 bg-bg-card border border-border rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
        <h3 className="font-display text-lg text-text-primary tracking-wide">KOMENTAR <span className="text-text-muted text-sm ml-1">({comments.length})</span></h3>
        <button onClick={loadNewComments} className="text-xs font-bold text-accent-red hover:underline">Refresh</button>
      </div>

      {user ? (
        <div className="mb-6 flex gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-bg-elevated border-2 border-border">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-red/30 to-purple-900/50">
                <span className="text-white font-bold">{user.displayName?.[0]?.toUpperCase()}</span>
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis komentar kamu di sini..."
              className="w-full bg-bg-elevated border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-red resize-none"
              rows={2}
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="self-end px-4 py-1.5 bg-accent-red text-white text-xs font-bold rounded-lg hover:bg-accent-redDark disabled:opacity-50 transition-colors"
            >
              Kirim
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-bg-elevated rounded-xl text-center border border-border">
          <p className="text-sm text-text-muted mb-2">Silakan login untuk memberikan komentar.</p>
          <Link href="/login" className="inline-block px-4 py-1.5 bg-accent-red text-white text-xs font-bold rounded-lg hover:bg-accent-redDark transition-colors">
            Login
          </Link>
        </div>
      )}

      <div className="flex flex-col">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-text-muted text-sm italic">Belum ada komentar. Jadilah yang pertama!</p>
          </div>
        )}
      </div>

      {}
      {showFab && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-all z-50 animate-fade-in"
          aria-label="Scroll to top"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
