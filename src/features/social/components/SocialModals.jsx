import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { globalFonts as fonts } from '@/shared/ui/globalStyles.js';
import { calculatePowerScore } from './useSocial.js';
import CommentList from './CommentList.jsx';
import CommentInput from './CommentInput.jsx';

const STYLES = {
  sleekRowStyle: { background: "linear-gradient(145deg, rgba(15, 15, 20, 0.8) 0%, rgba(40, 40, 45, 0.2) 100%)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.02)", boxShadow: "inset 0 4px 15px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.5)", transform: "translateZ(0)" },
  modalOverlay: { position: 'fixed', inset: 0, zIndex: 30000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
  modalBlur: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" },
  modalContent: (height) => ({ width: "100%", maxWidth: 430, height: height, background: "linear-gradient(180deg, #101014 0%, #050810 100%)", borderTopLeftRadius: 32, borderTopRightRadius: 32, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", borderTop: `1px solid rgba(255,255,255,0.05)`, boxShadow: "0 -10px 40px rgba(0,0,0,0.8)" }),
  closeBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.05)", color: "#fff", width: 32, height: 32, borderRadius: 10, fontSize: 14, cursor: "pointer" }
};

const UserProfileModal = ({ user, onClose, C = {}, isFollowing = false, onToggleFollow }) => {
  if (!user) return null;
  const isDataHidden = user?.isPrivate && !user?.isMe;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={STYLES.modalOverlay}>
      <div style={STYLES.modalBlur} onClick={onClose} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} style={STYLES.modalContent("85vh")}>
        <div style={{ padding: "20px 20px 0 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
             <div style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(0,0,0,0.4))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: `1px solid rgba(255,255,255,0.05)` }}>{user?.avatar || "👤"}</div>
             <div>
               <h3 style={{ margin: "0 0 2px 0", fontSize: 20, color: "#fff", fontFamily: fonts.header, fontStyle: "italic" }}>{user?.name}</h3>
               <div style={{ fontSize: 10, color: C?.green || '#22c55e', fontWeight: 900, background: "rgba(46, 204, 113, 0.1)", padding: "4px 8px", borderRadius: 6, display: "inline-block", border: "1px solid rgba(46, 204, 113, 0.2)", fontStyle: "italic" }}>Lvl {user?.level || 1} • {user?.title || "Savaşçı"}</div>
             </div>
          </div>
          <button onClick={onClose} style={STYLES.closeBtn}>✕</button>
        </div>

        <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "0 20px 40px 20px" }}>
          {!user?.isMe && (
            <motion.button 
              whileTap={{ scale: 0.96 }} onClick={() => onToggleFollow?.(user?.id)}
              style={{ width: "100%", marginBottom: 16, padding: "12px", borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 900, fontSize: 14, fontFamily: fonts.header, fontStyle: "italic", transition: "0.3s", background: isFollowing ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${C?.green || '#22c55e'}, #22c55e)`, border: isFollowing ? "1px solid rgba(255,255,255,0.1)" : "none", color: isFollowing ? "#fff" : "#000" }}
            >
              {isFollowing ? (<><span style={{ color: C?.green || '#22c55e' }}>✓</span> Takiptesin (Partner)</>) : (<>🤝 Partner Ol</>)}
            </motion.button>
          )}

          <div style={{ display: "flex", gap: 10, marginBottom: 16, opacity: isDataHidden ? 0.3 : 1 }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.03)", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 900, fontStyle: "italic", marginBottom: 2 }}>BOY</div>
              <div style={{ fontSize: 15, color: "#fff", fontWeight: 900, fontFamily: fonts.mono }}>{isDataHidden ? "***" : user?.height} <span style={{fontSize:9, color: "rgba(255,255,255,0.3)"}}>cm</span></div>
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.03)", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 900, fontStyle: "italic", marginBottom: 2 }}>KİLO</div>
              <div style={{ fontSize: 15, color: "#fff", fontWeight: 900, fontFamily: fonts.mono }}>{isDataHidden ? "***" : user?.bodyWeight} <span style={{fontSize:9, color: "rgba(255,255,255,0.3)"}}>kg</span></div>
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.03)", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 900, fontStyle: "italic", marginBottom: 2 }}>YAŞ</div>
              <div style={{ fontSize: 15, color: "#fff", fontWeight: 900, fontFamily: fonts.mono }}>{isDataHidden ? "**" : user?.age}</div>
            </div>
          </div>

          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 8, fontStyle: "italic" }}>KİŞİSEL REKORLAR (PR)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {(user?.prs || []).length > 0 ? (user?.prs || []).map((pr, i) => {
              const power = calculatePowerScore(pr?.w, user?.bodyWeight, pr?.name);
              return (
                <div key={i} style={{ ...STYLES.sleekRowStyle, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8, marginBottom: 0, borderRadius: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 15, color: "#fff", fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic" }}>{pr?.name}</span>
                    <span style={{ fontSize: 16, color: C?.yellow || '#f59e0b', fontWeight: 900, fontFamily: fonts.mono, fontStyle: "italic" }}>{pr?.w} <span style={{fontSize:10, color:"rgba(255,255,255,0.5)"}}>kg</span></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.3)", padding: "6px 10px", borderRadius: 10 }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontStyle: "italic", fontWeight: 700 }}>Güç Oranı</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 9, color: power.color, fontWeight: 900, background: `${power.color}20`, padding: "2px 6px", borderRadius: 6, border: `1px solid ${power.color}40` }}>{power.level.toUpperCase()}</span>
                      <span style={{ fontSize: 12, color: "#fff", fontWeight: 900, fontFamily: fonts.mono }}>{power.score} <span style={{fontSize:8, color:"rgba(255,255,255,0.4)"}}>PTS</span></span>
                    </div>
                  </div>
                </div>
              );
            }) : <div style={{color: "rgba(255,255,255,0.3)", fontSize: 11, fontStyle: "italic", textAlign: "center", padding: 16}}>Kayıtlı PR bulunamadı.</div>}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CommentsModal = ({ post, onClose, C = {}, onAddComment, currentUserName = "Kullanıcı" }) => {
  if (!post) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={STYLES.modalOverlay}>
      <div style={STYLES.modalBlur} onClick={onClose} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} style={STYLES.modalContent("70vh")}>
        <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 style={{ margin: 0, fontSize: 18, color: "#fff", fontFamily: fonts.header, fontStyle: "italic" }}>Yorumlar ({(post?.comments || []).length})</h3>
          <button onClick={onClose} style={STYLES.closeBtn}>✕</button>
        </div>
        <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <CommentList comments={post?.comments || []} C={C} />
        </div>
        <CommentInput onAddComment={onAddComment} post={post} currentUserName={currentUserName} C={C} />
      </motion.div>
    </motion.div>
  );
};

export default function SocialModals({ logic, C = {} }) {
  if (!logic) return null;
  const { viewUser, setViewUser, following, handleToggleFollow, viewCommentsPost, setViewCommentsPost, handleAddComment, currentUserName } = logic;

  return (
    <AnimatePresence mode="wait">
      {!!viewUser && <UserProfileModal user={viewUser} onClose={() => setViewUser?.(null)} C={C} isFollowing={(following || []).includes(viewUser?.id || viewUser?.name)} onToggleFollow={(id) => handleToggleFollow?.(id)} />}
      {!!viewCommentsPost && <CommentsModal post={viewCommentsPost} onClose={() => setViewCommentsPost?.(null)} C={C} onAddComment={handleAddComment} currentUserName={currentUserName} />}
    </AnimatePresence>
  );
}