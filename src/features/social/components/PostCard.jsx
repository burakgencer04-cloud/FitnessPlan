import React, { memo } from 'react';
import { globalFonts as fonts } from '@/shared/ui/globalStyles.js';
import UserBadge from './UserBadge.jsx';

const STYLES = {
  cardBase: { background: "linear-gradient(145deg, rgba(15, 15, 20, 0.8) 0%, rgba(40, 40, 45, 0.2) 100%)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.02)", boxShadow: "inset 0 4px 15px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.5)", transform: "translateZ(0)", padding: "16px", display: "flex", flexDirection: "column", gap: 12, marginBottom: 0 },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  timeText: { fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 800 },
  liftList: { display: "flex", flexDirection: "column", gap: 8 },
  liftRow: { background: "rgba(0,0,0,0.3)", padding: "12px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.2)" },
  liftNameBox: { display: "flex", alignItems: "center", gap: 10 },
  liftNameText: { fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic" },
  liftWeightText: (C) => ({ fontSize: 15, color: C?.yellow || '#f59e0b', fontFamily: fonts.mono, fontStyle: "italic", fontWeight: 900 }),
  reactionRow: { display: "flex", gap: 6, overflowX: "auto" },
  reactionBox: { background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 12, fontSize: 13, border: "1px solid rgba(255,255,255,0.05)" },
  footerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed rgba(255,255,255,0.05)", paddingTop: 12 },
  actionBtnRow: { display: "flex", gap: 16 },
  likeBtn: (hasLiked, C) => ({ background: "none", border: "none", color: hasLiked ? (C?.red || '#ef4444') : "rgba(255,255,255,0.4)", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontStyle: "italic", transition: "0.2s", fontFamily: fonts.mono }),
  likeIcon: (hasLiked, C) => ({ fontSize: 20, filter: hasLiked ? `drop-shadow(0 0 5px ${(C?.red || '#ef4444')})` : "none", transform: hasLiked ? "scale(1.1)" : "scale(1)" }),
  commentBtn: { background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontStyle: "italic", transition: "0.2s", fontFamily: fonts.mono },
  quickEmojiBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "4px 8px", fontSize: 14, cursor: "pointer" }
};

const PostCard = ({ post = {}, isPartner = false, hasLiked = false, importantLifts = [], timeAgoText = "Az önce", handleUserClick, handleToggleLike, setViewCommentsPost, handleAddReaction, QUICK_EMOJIS = [], C = {} }) => {
  if (!post) return null;

  return (
    <div style={STYLES.cardBase}>
      <div style={STYLES.headerRow}>
        <UserBadge post={post} isPartner={isPartner} onClick={() => handleUserClick?.(post)} C={C} />
        <div style={STYLES.timeText}>{timeAgoText}</div>
      </div>
      
      {(importantLifts || []).length > 0 ? (
        <div style={STYLES.liftList}>
          {(importantLifts || []).map((lift, i) => (
             <div key={i} style={STYLES.liftRow}>
               <div style={STYLES.liftNameBox}>
                 <span style={{ fontSize: 18 }}>⚡</span>
                 <span style={STYLES.liftNameText}>{lift?.name}</span>
               </div>
               <span style={STYLES.liftWeightText(C)}>{lift?.maxWeight} kg</span>
             </div>
          ))}
        </div>
      ) : (
        <div style={{ ...STYLES.liftRow, justifyContent: "flex-start" }}>
          <span style={{ fontSize: 18 }}>🏋️</span>
          <span style={STYLES.liftNameText}>{post?.workoutName || "Antrenman"}</span>
        </div>
      )}

      {(post?.reactions || []).length > 0 && (
        <div className="hide-scrollbar" style={STYLES.reactionRow}>
          {(post?.reactions || []).map((r, i) => (
            <div key={i} style={STYLES.reactionBox}>{r}</div>
          ))}
        </div>
      )}

      <div style={STYLES.footerRow}>
        <div style={STYLES.actionBtnRow}>
          <button onClick={(e) => handleToggleLike?.(post?.id, post?.likedBy || [], e)} style={STYLES.likeBtn(hasLiked, C)}>
            <span style={STYLES.likeIcon(hasLiked, C)}>{hasLiked ? '🔥' : '🤍'}</span> {post?.likes || 0}
          </button>
          <button onClick={(e) => { e?.stopPropagation(); setViewCommentsPost?.(post); }} style={STYLES.commentBtn}>
            <span style={{ fontSize: 20 }}>💬</span> {(post?.comments || []).length || 0}
          </button>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(QUICK_EMOJIS || []).map(emoji => (
             <button key={emoji} onClick={(e) => handleAddReaction?.(post?.id, emoji, e)} style={STYLES.quickEmojiBtn}>{emoji}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(PostCard);