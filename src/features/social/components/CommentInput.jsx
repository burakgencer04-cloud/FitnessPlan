import React, { useState } from 'react';

const STYLES = {
  container: { padding: "12px 16px 24px 16px", background: "rgba(0,0,0,0.6)", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 10, alignItems: "center" },
  input: { flex: 1, minWidth: 0, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "12px 16px", color: "#fff", outline: "none", fontSize: 14, fontStyle: "italic" },
  btn: (C) => ({ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${C?.green || '#22c55e'}, #22c55e)`, color: "#000", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: `0 4px 10px rgba(46, 204, 113, 0.3)` })
};

export default function CommentInput({ onAddComment, post = {}, currentUserName = "Kullanıcı", C = {} }) {
  const [commentText, setCommentText] = useState("");

  const handleSend = () => {
    if(!commentText.trim()) return;
    onAddComment?.(post?.id, currentUserName, commentText);
    setCommentText("");
  };

  return (
    <div style={STYLES.container}>
      <input type="text" placeholder="Yorum yaz..." value={commentText} onChange={e => setCommentText(e.target.value)} style={STYLES.input} onKeyDown={e => e.key === 'Enter' && handleSend()} />
      <button onClick={handleSend} style={STYLES.btn(C)}><span style={{ fontSize: 20, transform: "translateX(-2px)" }}>➤</span></button>
    </div>
  );
}