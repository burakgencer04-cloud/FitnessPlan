// src/features/social/components/feed/InteractionBar.jsx
import React, { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SocialController } from '@/features/social/services/SocialController';
import { useSocialModals } from '@/features/social/hooks/useSocialModals';
import { useIsPostLikedByMe, useIsPostMutating } from '@/features/social/store/socialSelectors';

// 🔥 YENİ: REAKSİYON ŞABLONLARI
const REACTIONS = [
  { emoji: '🔥', label: 'Ateş' },
  { emoji: '💪', label: 'Güçlü' },
  { emoji: '🏆', label: 'Şampiyon' },
  { emoji: '⚡', label: 'Enerji' },
  { emoji: '👏', label: 'Alkış' }
];

export const InteractionBar = memo(function InteractionBar({ postId, engagement, post }) {
  const isLiked = useIsPostLikedByMe(postId);
  const isMutating = useIsPostMutating(postId); 
  const { openComments } = useSocialModals();
  
  // 🔥 YENİ: Reaksiyon Menüsü State'i
  const [showPicker, setShowPicker] = useState(false);
  
  // 🔥 YENİ: Yerel Reaksiyon Sayacı (Backend entegrasyonu yapılana kadar örnek veri)
  const [localReactions, setLocalReactions] = useState(post?.reactions || { '🔥': 2, '💪': 1 });

  // 🔥 ORİJİNAL BEĞENİ FONKSİYONU (Korundu)
  const handleLike = () => { SocialController.toggleLike(postId); };

  // 🔥 YENİ: REAKSİYON EKLEME FONKSİYONU
  const handleReact = useCallback((emoji) => {
    // Optimistik olarak sayıyı artır
    setLocalReactions(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    setShowPicker(false);
    // SocialController.addReaction(postId, emoji); // Backend motoru hazır olunca burası açılacak
  }, [postId]);

  return (
    <div style={{ 
      marginTop: 12, paddingTop: 14, 
      // 🔥 YENİ: Glass Divider
      borderTop: `1px solid rgba(255,255,255,0.05)`, 
      position: 'relative' 
    }}>
      
      {/* 🔥 YENİ: REAKSİYON BADGELERİ (Postun altında biriken kudoslar) */}
      {Object.keys(localReactions).length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {Object.entries(localReactions).map(([emoji, count]) => (
            <motion.div 
              key={emoji} initial={{ scale: 0 }} animate={{ scale: 1 }}
              style={{ 
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                padding: '3px 9px', borderRadius: 12, fontSize: 11, color: '#fff', 
                display: 'flex', alignItems: 'center', gap: 5, fontWeight: 800 
              }}
            >
              <span>{emoji}</span> {count}
            </motion.div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
        {/* 🔥 ORİJİNAL SAYILAR (Görsel olarak iyileştirildi, kod korundu) */}
        <div style={{ display: "flex", gap: 16 }}>
          <motion.div layout style={{ display: "flex", alignItems: "center", gap: 6, color: "#fff", fontWeight: 900, fontSize: 13 }}>
            ❤️ {engagement?.likesCount || 0}
          </motion.div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)", fontWeight: 800, fontSize: 13 }}>
            💬 {engagement?.commentsCount || 0}
          </div>
        </div>

        {/* AKSİYON BUTONLARI (Tap Hold ve Emoji Picker ile güçlendirildi) */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: 'relative' }}>
          
          {/* 🔥 YENİ: EMOJI PICKER POPUP (Uzun basınca açılır) */}
          <AnimatePresence>
            {showPicker && (
              <>
                {/* Menü dışına tıklanınca kapanması için arka plan */}
                <div onClick={() => setShowPicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  style={{ 
                    position: 'absolute', bottom: '130%', right: 40, 
                    background: 'rgba(15,15,20,0.96)', backdropFilter: 'blur(20px)', 
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, 
                    padding: '6px 10px', display: 'flex', gap: 7, zIndex: 11, 
                    boxShadow: '0 12px 35px rgba(0,0,0,0.6)' 
                  }}
                >
                  {REACTIONS.map((r, i) => (
                    <motion.button 
                      key={i} whileHover={{ scale: 1.25, y: -5 }} whileTap={{ scale: 0.9 }} onClick={() => handleReact(r.emoji)}
                      style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', padding: 4, outline: 'none' }}>
                      {r.emoji}
                    </motion.button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* 🔥 BEĞEN BUTONU (Görsel İyileştirme + Tap Hold Entegrasyonu) */}
          <motion.button 
            whileTap={{ scale: 0.85 }} 
            // 🔥 YENİ: Desktop sağ tık ile reaksiyon açma
            onContextMenu={(e) => { e.preventDefault(); setShowPicker(true); }} 
            // 🔥 YENİ: Mobil uzun basma (Tap-hold) ile reaksiyon açma
            onPointerDown={() => { window.reactTimer = setTimeout(() => setShowPicker(true), 450); }} 
            onPointerUp={() => clearTimeout(window.reactTimer)}
            // 🔥 ORİJİNAL TIKLAMA FONKSİYONU (toggleLike çağırır - Korundu)
            onClick={() => { if (!showPicker) handleLike(); }} 
            style={{ 
              background: isLiked ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)", 
              border: isLiked ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.06)", 
              color: isLiked ? "#22c55e" : "rgba(255,255,255,0.6)", 
              padding: '6px 14px', borderRadius: 100, display: "flex", alignItems: "center", gap: 7, 
              fontWeight: 800, fontSize: 13, cursor: "pointer", outline: "none", transition: 'all 0.3s'
            }}
          >
            <motion.svg animate={{ scale: isLiked ? [1, 1.4, 1] : 1 }} width="17" height="17" viewBox="0 0 24 24" fill={isLiked ? "#22c55e" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></motion.svg>
            Beğen
          </motion.button>

          {/* 🔥 ORİJİNAL YORUM BUTONU (Görsel İyileştirme, kod korundu) */}
          <motion.button 
            whileTap={{ scale: 0.95 }} 
            onClick={() => openComments(post)} // Orijinal Modal açma fonksiyonu
            style={{ 
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)", 
              color: "rgba(255,255,255,0.6)", padding: '6px 14px', borderRadius: 100, 
              display: "flex", alignItems: "center", gap: 7, 
              fontWeight: 800, fontSize: 13, cursor: "pointer", outline: "none"
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Yorum
          </motion.button>
        </div>
      </div>
    </div>
  );
});