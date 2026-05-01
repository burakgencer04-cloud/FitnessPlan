import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { globalFonts as fonts } from '@/shared/ui/globalStyles';
import { useAppStore } from '@/app/store';
import { SocialController } from '@/features/social/services/SocialController';
import { useSocialModals } from '@/features/social/hooks/useSocialModals';
import { useShallow } from 'zustand/react/shallow';

const getRelativeTime = (timestamp) => {
  if (!timestamp) return 'Az önce';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffMin = Math.floor((new Date() - date) / 60000);
  if (diffMin < 1) return 'Az önce';
  if (diffMin < 60) return `${diffMin}dk`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}s`;
  return `${Math.floor(diffMin / 1440)}g`;
};

export const PostHeader = memo(function PostHeader({ author, createdAt, postId, isTrending }) {
  const [showMenu, setShowMenu] = useState(false);
  const { openUserProfile } = useSocialModals();
  
  const currentUid = useAppStore(state => state.user?.uid || state.user?.id);
  const following = useAppStore(useShallow(state => state.social?.following || []));

  const isMe = author?.uid === currentUid;
  const isFollowing = following.includes(author?.uid);

  const handleDelete = () => {
    setShowMenu(false);
    if(window.confirm("Bu gönderiyi silmek istediğine emin misin?")) {
      SocialController.deletePost(postId);
    }
  };

  const handleReport = () => {
    setShowMenu(false);
    alert("Bu içerik incelenmek üzere moderatörlere bildirildi.");
  };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16, position: 'relative' }}>
      
      {/* AVATAR */}
      <motion.div 
        whileTap={{ scale: 0.9 }}
        onClick={() => openUserProfile(author)} 
        style={{ width: 46, height: 46, borderRadius: 23, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, cursor: "pointer", flexShrink: 0 }}
      >
        {author?.avatar || "👤"}
      </motion.div>
      
      {/* İSİM, SAAT VE TREND BİLGİSİ (Esnek Alan) */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", marginTop: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 900, color: "#fff", fontSize: 15, letterSpacing: -0.3, fontFamily: fonts.header, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {author?.userName || author?.firstName || "İsimsiz Sporcu"}
          </span>
          
          {/* Çarpışmayı önlemek için Trend yazısını ufak bir rozet yaptık */}
          {isTrending && (
            <span style={{ background: "rgba(249, 115, 22, 0.15)", color: "#f97316", padding: "2px 6px", borderRadius: 6, fontSize: 10, fontWeight: 900, letterSpacing: 0.5 }}>
              🔥 TREND
            </span>
          )}
        </div>
        
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 700, marginTop: 3 }}>
          {getRelativeTime(createdAt)}
        </span>
      </div>
      
      {/* SAĞ AKSİYONLAR (Takip Et ve Üç Nokta - Asla küçülmez) */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {!isMe && (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => SocialController.toggleFollow(author?.uid || author?.id)}
            style={{ 
              padding: "6px 14px", borderRadius: 100, 
              background: isFollowing ? "rgba(255,255,255,0.08)" : "rgba(34, 197, 94, 0.15)", 
              border: isFollowing ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(34, 197, 94, 0.3)", 
              color: isFollowing ? "rgba(255,255,255,0.7)" : "#22c55e", 
              fontSize: 12, fontWeight: 900, cursor: "pointer", outline: "none", transition: "all 0.2s"
            }}
          >
            {isFollowing ? "Takipte" : "Takip Et"}
          </motion.button>
        )}

        {/* ÜÇ NOKTA BUTONU */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            style={{ background: "none", border: "none", color: showMenu ? "#fff" : "rgba(255,255,255,0.4)", fontSize: 22, cursor: "pointer", padding: "0 4px", fontWeight: 900, outline: "none", transition: "0.2s" }}
          >
            ⋮
          </button>

          {/* AÇILIR MENÜ (DROPDOWN) */}
          <AnimatePresence>
            {showMenu && (
              <>
                {/* Menü dışına tıklanınca kapanması için görünmez arka plan */}
                <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  style={{ 
                    position: 'absolute', right: 0, top: '120%', zIndex: 100,
                    background: 'rgba(20, 20, 28, 0.95)', backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                    padding: 6, minWidth: 140, boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                  }}
                >
                  <MenuOption icon="🔗" label="Bağlantıyı Kopyala" onClick={() => { setShowMenu(false); alert("Kopyalandı!"); }} />
                  {isMe ? (
                    <MenuOption icon="🗑️" label="Gönderiyi Sil" color="#ef4444" onClick={handleDelete} />
                  ) : (
                    <MenuOption icon="🚩" label="Şikayet Et" color="#ef4444" onClick={handleReport} />
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});

// Menü içi buton tasarımı
const MenuOption = ({ icon, label, onClick, color = "#fff" }) => (
  <motion.button 
    whileHover={{ background: "rgba(255,255,255,0.05)" }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    style={{ 
      width: '100%', display: 'flex', alignItems: 'center', gap: 10, 
      padding: '10px 12px', background: 'none', border: 'none', 
      color: color, fontSize: 13, fontWeight: 700, cursor: 'pointer', 
      borderRadius: 8, textAlign: 'left', outline: 'none'
    }}
  >
    <span style={{ fontSize: 16 }}>{icon}</span> {label}
  </motion.button>
);