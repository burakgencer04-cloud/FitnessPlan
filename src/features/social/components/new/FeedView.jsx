// src/features/social/components/feed/FeedView.jsx
import React, { useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeedIds } from '@/features/social/store/socialSelectors';
import { useAppStore } from '@/app/store';
import { db } from '@/shared/api/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { PostCard } from '../feed/PostCard';
import { PostComposer } from '../PostComposer';
import { StoryBar } from './StoryBar';
import { ChallengeCard } from './ChallengeCard';
import { SkeletonCard } from './SkeletonCard';

const feedContainerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } }
};

const EmptyState = memo(() => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      textAlign: 'center', padding: '60px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
    }}
  >
    <motion.div
      animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
      style={{ fontSize: 56 }}
    >
      🔥
    </motion.div>
    <div style={{
      fontSize: 20, fontWeight: 900, color: '#fff',
      fontStyle: 'italic', letterSpacing: -0.5
    }}>
      Henüz hiç gönderi yok.
    </div>
    <div style={{
      fontSize: 14, color: 'rgba(255,255,255,0.4)',
      maxWidth: 260, lineHeight: 1.6
    }}>
      Topluluğa ilk ateşi yakma zamanı. Antrenmanını paylaş, liderler tablosuna gir!
    </div>
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 2 }}
      style={{
        marginTop: 8, fontSize: 12, color: '#22c55e',
        fontWeight: 800, letterSpacing: 1
      }}
    >
      ↑ YUKARI PAYLAŞ ↑
    </motion.div>
  </motion.div>
));

// 🔥 FIX: Performans için React.memo ile sarmalandı
export const FeedView = memo(function FeedView() {
  const feedIds = useFeedIds();
  const user = useAppStore(state => state.user);
  const isFetching = useAppStore(state => state.social?.status?.isFetchingInitial);

  const handlePostSubmit = useCallback(async (postData) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'feed'), {
        author: {
          uid: user.uid || user.id || 'guest',
          userName: user.userName || user.firstName || 'İsimsiz Sporcu',
          avatar: user.avatar || '👤',
          title: user.title || null,
          isVerified: user.isVerified || false,
        },
        type: postData.type || 'STANDARD',
        content: postData.text || '',
        workoutPlan: postData.workoutPlan || null,
        nutritionPlan: postData.nutritionPlan || null,
        media: postData.media || null,
        engagement: { likesCount: 0, likedBy: [], commentsCount: 0 },
        reactions: {},
        comments: [],
        createdAt: serverTimestamp()
      });
    } catch (error) {
      logger.error('Gönderi paylaşılamadı:', error);
    }
  }, [user]);

  return (
    <motion.div
      variants={feedContainerVariants}
      initial="hidden"
      animate="show"
      // 🔥 FIX: Mobilde "Pull-to-refresh" pürüzsüzlüğü için overscroll eklendi
      style={{ display: 'flex', flexDirection: 'column', paddingBottom: 100, overscrollBehaviorY: 'contain' }}
    >
      {/* STORIES BAR */}
      <StoryBar user={user} />

      {/* POST COMPOSER */}
      <PostComposer
        currentUserAvatar={user?.avatar}
        onPostSubmit={handlePostSubmit}
      />

      {/* CHALLENGE BANNER */}
      <ChallengeCard compact />

      {/* FEED */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
        <AnimatePresence mode="popLayout">
          {isFetching ? (
            [0, 1, 2].map(i => <SkeletonCard key={`sk_${i}`} />)
          ) : !feedIds || feedIds.length === 0 ? (
            <EmptyState key="empty" />
          ) : (
            feedIds.map(id => (
              <PostCard key={id} postId={id} />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});