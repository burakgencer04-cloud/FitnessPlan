// src/features/social/components/new/StoryBar.jsx
import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { globalFonts as fonts } from '@/shared/ui/globalStyles';
import { useAppStore } from '@/app/store';
import { useShallow } from 'zustand/react/shallow';
import { SocialController } from '@/features/social/services/SocialController';

const STORY_TEMPLATES = [
  { emoji: '💪', label: 'Antrenman Yaptım', color: '#22c55e' },
  { emoji: '🔥', label: 'PR Kırdım!', color: '#f97316' },
  { emoji: '🥗', label: 'Makrolarım Tamam', color: '#eab308' },
  { emoji: '😴', label: 'Recovery Günü', color: '#3b82f6' },
  { emoji: '🏃', label: 'Kardio Tamamdı', color: '#8b5cf6' },
];

const AddStoryButton = memo(({ user, onAdd }) => (
  <motion.div
    whileTap={{ scale: 0.92 }}
    onClick={onAdd}
    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }}
  >
    <div style={{ position: 'relative' }}>
      <div style={{
        width: 60, height: 60, borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
        border: '2px dashed rgba(34,197,94,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24
      }}>
        {user?.avatar || '👤'}
      </div>
      <div style={{
        position: 'absolute', bottom: -2, right: -2,
        width: 22, height: 22, borderRadius: '50%',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
        border: '2px solid #060608',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, color: '#000', fontWeight: 900
      }}>+</div>
    </div>
    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700, whiteSpace: 'nowrap' }}>
      Hikaye Ekle
    </span>
  </motion.div>
));

// 🔥 Görüldü (seen) durumu artık dışarıdan geliyor
const StoryItem = memo(({ story, onView, seen }) => (
  <motion.div
    whileTap={{ scale: 0.9 }}
    onClick={() => onView(story)}
    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }}
  >
    <div style={{
      padding: 2.5,
      borderRadius: '50%',
      background: seen
        ? 'rgba(255,255,255,0.1)'
        : `linear-gradient(135deg, ${story.template?.color}, ${story.template?.color}88)`,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: '#0e0e14',
        border: '2px solid #060608',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26,
        opacity: seen ? 0.6 : 1
      }}>
        {story.avatar}
      </div>
    </div>
    <span style={{
      fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap',
      color: seen ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.75)',
      maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center'
    }}>
      {story.name}
    </span>
  </motion.div>
));

const QuickCheckInModal = memo(({ user, onClose, onPost }) => (
  <motion.div
    initial={{ opacity: 0, y: '100%' }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: '100%' }}
    transition={{ type: 'spring', damping: 30 }}
    style={{
      position: 'fixed', inset: 0, zIndex: 6000,
      background: 'rgba(6,6,8,0.97)',
      backdropFilter: 'blur(24px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '60px 24px 40px'
    }}
  >
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onClose}
      style={{
        position: 'absolute', top: 52, right: 20,
        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)',
        width: 40, height: 40, borderRadius: 14, color: '#fff',
        fontSize: 16, cursor: 'pointer', outline: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >✕</motion.button>

    <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 900, letterSpacing: 1, marginBottom: 8 }}>
      HIZLI CHECK-IN
    </div>
    <h2 style={{
      fontSize: 24, fontWeight: 900, color: '#fff',
      fontFamily: fonts.header, fontStyle: 'italic',
      textAlign: 'center', letterSpacing: -0.5, marginBottom: 32
    }}>
      Bugün ne yaptın?
    </h2>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 360 }}>
      {STORY_TEMPLATES.map((t, i) => (
        <motion.button
          key={i}
          whileTap={{ scale: 0.95 }}
          whileHover={{ x: 4 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          onClick={() => { onPost(t); onClose(); }}
          style={{
            background: `linear-gradient(135deg, ${t.color}18, ${t.color}08)`,
            border: `1px solid ${t.color}35`,
            borderRadius: 16, padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 16,
            cursor: 'pointer', outline: 'none', width: '100%'
          }}
        >
          <span style={{ fontSize: 32 }}>{t.emoji}</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontStyle: 'italic' }}>
            {t.label}
          </span>
          <div style={{ marginLeft: 'auto', color: t.color, fontSize: 18 }}>→</div>
        </motion.button>
      ))}
    </div>
  </motion.div>
));

const StoryViewModal = memo(({ story, onClose }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, zIndex: 6000,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 20
    }}
  >
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ repeat: 3, duration: 0.5 }}
      style={{ fontSize: 80 }}
    >
      {story.template?.emoji}
    </motion.div>
    <div style={{
      fontSize: 20, fontWeight: 900, color: '#fff',
      fontFamily: fonts.header, fontStyle: 'italic'
    }}>
      {story.name}
    </div>
    <div style={{
      fontSize: 16, color: story.template?.color, fontWeight: 800
    }}>
      {story.template?.label}
    </div>
    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 20 }}>
      Kapatmak için dokun
    </div>
  </motion.div>
));

export const StoryBar = memo(function StoryBar({ user }) {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [activeStory, setActiveStory] = useState(null);

  // 🔥 GERÇEK STORE BAĞLANTISI
  const stories = useAppStore(useShallow(s => s.social.stories || []));

  // Bileşen yüklendiğinde hikayeleri getir
  useEffect(() => {
    SocialController.fetchStories?.();
  }, []);

  const handlePost = async (template) => {
    await SocialController.postStory(template);
    setShowCheckIn(false);
  };

  return (
    <>
      <div style={{
        display: 'flex', gap: 14, marginBottom: 16,
        overflowX: 'auto', paddingBottom: 4,
        msOverflowStyle: 'none', scrollbarWidth: 'none'
      }}>
        <AddStoryButton user={user} onAdd={() => setShowCheckIn(true)} />

        {stories.map(story => (
          <StoryItem 
            key={story.id || story.uid} 
            story={story} 
            onView={setActiveStory} 
            // Kullanıcı bu hikayeyi gördü mü kontrolü:
            seen={(story.seenBy || []).includes(user?.uid || user?.id)}
          />
        ))}
      </div>

      <AnimatePresence>
        {showCheckIn && (
          <QuickCheckInModal
            user={user}
            onClose={() => setShowCheckIn(false)}
            onPost={handlePost}
          />
        )}
        {activeStory && (
          <StoryViewModal story={activeStory} onClose={() => setActiveStory(null)} />
        )}
      </AnimatePresence>
    </>
  );
});