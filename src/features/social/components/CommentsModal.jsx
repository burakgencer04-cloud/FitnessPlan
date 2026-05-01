// src/features/social/components/CommentsModal.jsx
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { globalFonts as fonts } from '@/shared/ui/globalStyles';
import { HapticEngine } from '@/shared/lib/hapticSoundEngine';
import { SocialController } from '@/features/social/services/SocialController';
import { useAppStore } from '@/app/store';

const getRelativeTime = (timestamp) => {
  if (!timestamp) return 'Az önce';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffMin = Math.floor((new Date() - date) / 60000);
  if (diffMin < 1) return 'Az önce';
  if (diffMin < 60) return `${diffMin}dk`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}s`;
  return `${Math.floor(diffMin / 1440)}g`;
};

const CommentItem = memo(({ comment, index, currentUid }) => {
  const [showMenu, setShowMenu] = useState(false);
  const isMyComment = comment.author?.uid === currentUid || comment.userId === currentUid;

  const handleAction = (type) => {
    setShowMenu(false);
    if (type === 'delete') {
      if(window.confirm("Yorumu silmek istediğine emin misin?")) {
        // SocialController.deleteComment(postId, comment.id) şeklinde bağlayabilirsin
        alert("Yorum silindi (Motor bağlantısı bekleniyor)");
      }
    } else {
      alert("Yorum moderatörlere bildirildi.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', damping: 24 }}
      style={{ display: 'flex', gap: 12, marginBottom: 16, position: 'relative' }}
    >
      {/* Yorumcu Avatarı */}
      <div style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
        {comment.author?.avatar || comment.avatar || '👤'}
      </div>

      {/* Yorum İçeriği */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#fff', fontWeight: 800 }}>
              {comment.author?.name || comment.userName || 'İsimsiz'}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
              {getRelativeTime(comment.createdAt)}
            </span>
          </div>

          {/* YORUM ÜÇ NOKTA */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '0 4px', fontSize: 18, fontWeight: 900 }}
            >
              ⋮
            </button>

            {/* Yorum Açılır Menüsü */}
            <AnimatePresence>
              {showMenu && (
                <>
                  <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, right: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    style={{ 
                      position: 'absolute', right: 0, top: '100%', zIndex: 100,
                      background: 'rgba(20, 20, 28, 0.95)', border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: 12, padding: 4, minWidth: 120, boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
                    }}
                  >
                    {isMyComment ? (
                      <button onClick={() => handleAction('delete')} style={{ width: '100%', padding: '8px', background: 'none', border: 'none', color: '#ef4444', textAlign: 'left', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>🗑️ Sil</button>
                    ) : (
                      <button onClick={() => handleAction('report')} style={{ width: '100%', padding: '8px', background: 'none', border: 'none', color: '#fff', textAlign: 'left', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>🚩 Bildir</button>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4, lineHeight: 1.4, wordBreak: 'break-word' }}>
          {comment.text || comment.content}
        </p>
      </div>
    </motion.div>
  );
});

const EmptyComments = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    style={{ textAlign: 'center', padding: '50px 20px' }}
  >
    <div style={{ fontSize: 48, marginBottom: 14 }}>💬</div>
    <div style={{ color: '#fff', fontSize: 16, fontWeight: 900, marginBottom: 6, fontStyle: 'italic' }}>
      Henüz yorum yok
    </div>
    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
      İlk yorumu yapan sen ol!
    </div>
  </motion.div>
);

const CommentsModal = ({ post, onClose, C, user }) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post?.comments || []);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const currentUser = useAppStore(state => state.user);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 400);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSend = useCallback(async () => {
    const trimmed = commentText.trim();
    if (!trimmed || isSending) return;
    setIsSending(true);

    const newComment = {
      user: currentUser?.userName || currentUser?.firstName || 'Sporcu',
      avatar: currentUser?.avatar || '👤',
      text: trimmed,
      createdAt: new Date(),
      uid: currentUser?.uid || currentUser?.id,
      id: `local_${Date.now()}`
    };

    setComments(prev => [...prev, newComment]);
    setCommentText('');
    HapticEngine?.light?.();

    try {
      await SocialController.addComment?.(post?.id, {
        user: newComment.user,
        avatar: newComment.avatar,
        text: newComment.text,
        uid: newComment.uid,
      });
    } catch (e) {
      console.error('Comment failed:', e);
    } finally {
      setIsSending(false);
    }
  }, [commentText, isSending, currentUser, post?.id]);

  if (!post) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 280 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 5000,
        display: 'flex', flexDirection: 'column',
        background: 'rgba(6,6,8,0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)'
      }}
    >
      {/* HEADER */}
      <div style={{
        padding: '52px 20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(180deg, rgba(14,14,20,0.98), transparent)',
        display: 'flex', alignItems: 'center', gap: 14
      }}>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => { onClose(); HapticEngine?.light?.(); }}
          style={{
            width: 40, height: 40, borderRadius: 14,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#fff', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            outline: 'none', flexShrink: 0
          }}
        >
          ←
        </motion.button>

        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: 0, fontSize: 18, fontWeight: 900, color: '#fff',
            fontFamily: fonts.header, letterSpacing: -0.5
          }}>
            Yorumlar
          </h3>
          <p style={{
            margin: '2px 0 0', fontSize: 11.5,
            color: 'rgba(255,255,255,0.4)', fontWeight: 600
          }}>
            {post.author?.userName || post.author?.name || 'Sporcu'}
            {' '}· {comments.length} yorum
          </p>
        </div>

        {/* POST MINI PREVIEW */}
        {post.content && (
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10, padding: '6px 10px',
            fontSize: 11.5, color: 'rgba(255,255,255,0.5)',
            maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {post.content}
          </div>
        )}
      </div>

      {/* COMMENTS LIST */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 0' }}>
        {comments.length === 0 ? (
          <EmptyComments />
        ) : (
          comments.map((c, i) => (
            <CommentItem key={c.id || i} comment={c} index={i} />
          ))
        )}
        <div ref={bottomRef} style={{ height: 20 }} />
      </div>

      {/* INPUT BAR */}
      <div style={{
        padding: '14px 16px',
        paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 16px))',
        background: 'linear-gradient(0deg, rgba(8,8,12,1), rgba(8,8,12,0.95))',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', gap: 10, alignItems: 'center'
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(34,197,94,0.15)',
          border: '1px solid rgba(34,197,94,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16
        }}>
          {currentUser?.avatar || '👤'}
        </div>

        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 14, padding: '0 14px', gap: 8,
          height: 46
        }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Yorum yaz..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1, background: 'transparent', border: 'none',
              color: '#fff', outline: 'none', fontSize: 14,
              fontStyle: 'italic', fontFamily: fonts.body
            }}
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleSend}
          disabled={!commentText.trim() || isSending}
          style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: commentText.trim()
              ? 'linear-gradient(135deg, #22c55e, #16a34a)'
              : 'rgba(255,255,255,0.06)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: commentText.trim() ? '0 4px 14px rgba(34,197,94,0.4)' : 'none',
            transition: 'all 0.2s', outline: 'none'
          }}
        >
          {isSending ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
              style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%' }}
            />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={commentText.trim() ? '#000' : 'rgba(255,255,255,0.25)'}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 2 11 13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CommentsModal;