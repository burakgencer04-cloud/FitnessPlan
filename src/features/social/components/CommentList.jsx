import React from 'react';
import { globalFonts as fonts } from '@/shared/ui/globalStyles.js';

const STYLES = {
  emptyState: { textAlign: "center", color: "rgba(255,255,255,0.4)", fontStyle: "italic", marginTop: 40, fontSize: 13 },
  row: { background: "linear-gradient(145deg, rgba(15, 15, 20, 0.8) 0%, rgba(40, 40, 45, 0.2) 100%)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.02)", boxShadow: "inset 0 4px 15px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.5)", transform: "translateZ(0)", padding: "14px", marginBottom: 0 },
  userText: (C) => ({ fontSize: 12, color: C?.green || '#22c55e', fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", marginBottom: 4 }),
  commentText: { fontSize: 13, color: "#fff", lineHeight: 1.4, fontStyle: "italic" }
};

export default function CommentList({ comments = [], C = {} }) {
  if (!comments || comments?.length === 0) {
    return <div style={STYLES.emptyState}>Henüz yorum yok. İlk ateşleyen sen ol!</div>;
  }

  return (
    <>
      {(comments || []).map((c, i) => (
        <div key={i} style={STYLES.row}>
           <div style={STYLES.userText(C)}>{c?.user || "Kullanıcı"}</div>
           <div style={STYLES.commentText}>{c?.text}</div>
        </div>
      ))}
    </>
  );
}