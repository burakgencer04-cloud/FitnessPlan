// src/features/social/components/feed/PostCard.jsx
import React, { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePostData } from '@/features/social/store/socialSelectors';
import { globalFonts as fonts } from '@/shared/ui/globalStyles';

// Orijinal İçe Aktarmaların Eksiksiz Korundu
import { PostHeader } from './PostHeader';
import { WorkoutSummaryBlock } from './WorkoutSummaryBlock';
import { PRCelebrationBadge } from '../new/PRCelebrationBadge';
import { WorkoutPlanBlock, NutritionPlanBlock } from './ShareBlocks';
import { InteractionBar } from '@/features/social/components/new/InteractionBar';

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', damping: 28, stiffness: 220 }
  },
  exit: { opacity: 0, y: -16, scale: 0.97, transition: { duration: 0.18 } }
};

const MediaPlaceholder = memo(({ media }) => {
  if (!media) return null;
  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden', marginBottom: 16,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.05)',
      position: 'relative'
    }}>
      <img 
        src={media} 
        alt="Post media" 
        style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 400 }} 
      />
    </div>
  );
});

export const PostCard = memo(function PostCard({ postId }) {
  const post = usePostData(postId);
  const [showPRCelebration, setShowPRCelebration] = useState(true);

  if (!post) return null;

  const hasPR = post.workoutStats?.personalRecords?.length > 0;
  
  // 🔥 YENİ: TRENDING KONTROLÜ (15 beğeni ve üzeri)
  const isTrending = (post.engagement?.likesCount || 0) >= 15;

  return (
    <motion.div
      variants={cardVariants}
      layout
      whileHover={{ scale: 1.01 }} // 🔥 YENİ: Dokunma/Hover derinliği
      style={{ 
        // 🔥 YENİ: PREMIUM GLASSMORPHISM TASARIMI
        background: "linear-gradient(160deg, rgba(20,20,25,0.85) 0%, rgba(10,10,14,0.95) 100%)", 
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        border: isTrending ? "1px solid rgba(249, 115, 22, 0.3)" : "1px solid rgba(255,255,255,0.04)", 
        borderRadius: 28, 
        padding: "20px", 
        marginBottom: 20,
        boxShadow: isTrending ? "0 10px 40px rgba(249, 115, 22, 0.1)" : "0 10px 30px rgba(0,0,0,0.3)",
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 🔥 YENİ: TRENDING GLOW/AURA EFEKTİ */}
      {isTrending && (
        <div style={{ 
          position: 'absolute', top: -50, right: -50, 
          width: 120, height: 120, background: '#f97316', 
          filter: 'blur(80px)', opacity: 0.25, zIndex: 0, pointerEvents: 'none' 
        }} />
      )}

      {/* İçeriklerin z-index ile auradan üstte kalmasını sağlıyoruz */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        
        {/* POST HEADER */}
        <PostHeader author={post.author} createdAt={post.createdAt} postId={post.id} isTrending={isTrending} />

        {/* METİN İÇERİĞİ */}
        {post.content && (
          <p style={{
            color: 'rgba(255,255,255,0.88)', fontSize: 14.5, lineHeight: 1.6,
            marginBottom: 14, fontFamily: fonts.body, fontWeight: 400,
            letterSpacing: 0.1
          }}>
            {post.content}
          </p>
        )}

        {/* PR CELEBRATION OVERLAY */}
        <AnimatePresence>
          {showPRCelebration && hasPR && (
            <PRCelebrationBadge
              records={post.workoutStats.personalRecords}
              onDismiss={() => setShowPRCelebration(false)}
            />
          )}
        </AnimatePresence>

        {/* MEDIA */}
        {post.media && <MediaPlaceholder media={post.media} />}

        {/* WORKOUT COMPLETE (Senin orijinal metrik kartların) */}
        {post.type === 'WORKOUT_COMPLETE' && post.workoutStats && (
          <WorkoutSummaryBlock stats={post.workoutStats} />
        )}

        {/* PLAN SHARES (Senin orijinal paylaşım blokların) */}
        {post.type === 'WORKOUT_PLAN_SHARE' && post.workoutPlan && (
          <WorkoutPlanBlock plan={post.workoutPlan} />
        )}
        {post.type === 'NUTRITION_PLAN_SHARE' && post.nutritionPlan && (
          <NutritionPlanBlock plan={post.nutritionPlan} />
        )}

        {/* INTERACTION BAR (Reaksiyon barı) */}
        <InteractionBar
          postId={postId}
          engagement={post.engagement}
          reactions={post.reactions}
          post={post}
        />
      </div>
    </motion.div>
  );
});