import React from 'react';
import { globalFonts as fonts } from '@/shared/ui/globalStyles.js';

const STYLES = {
  container: { display: "flex", gap: 12, alignItems: "center", cursor: "pointer" },
  avatarBox: { width: 40, height: 40, borderRadius: 12, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: "1px solid rgba(255,255,255,0.05)" },
  nameRow: { display: "flex", alignItems: "center", gap: 6 },
  nameText: { fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic" },
  partnerTag: (C) => ({ fontSize: 9, background: `rgba(46, 204, 113, 0.2)`, color: C?.green || '#22c55e', padding: "2px 6px", borderRadius: 6, fontWeight: 900 }),
  descText: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2, fontStyle: "italic" }
};

export default function UserBadge({ post = {}, isPartner = false, onClick, C = {} }) {
  return (
    <div style={STYLES.container} onClick={onClick}>
       <div style={STYLES.avatarBox}>{post?.userAvatar || "👤"}</div>
       <div>
         <div style={STYLES.nameRow}>
           <span style={STYLES.nameText}>{post?.userName || "Kullanıcı"}</span>
           {isPartner && <span style={STYLES.partnerTag(C)}>PARTNER</span>}
         </div>
         <div style={STYLES.descText}>idmanı tamamladı.</div>
       </div>
    </div>
  );
}