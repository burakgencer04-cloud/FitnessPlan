import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/app/store'; 


import UserProfileModal from './UserProfileModal';
import CommentsModal from './CommentsModal';
import { useSocialModalsStore } from '@/features/social/hooks/useSocialModals';
import { SocialController } from '@/features/social/services/SocialController';

import { SocialHeader } from './SocialHeader';
import { FeedView } from '@/features/social/components/new/FeedView';
import { useTheme } from '@/shared/ui/theme.js';

// 🔥 SENİN ORİJİNAL DOSYALARIN EKSİKSİZ BURADA
import MarketplaceView from './MarketplaceView'; 
import { LeaderboardView } from './new/LeaderboardView'; 
import { addWorkoutToFeed, getLiveFeed, getUserWeeklyStats, toggleFollow } from '@/entities/social/api/socialRepo.js';

export default function TabToday({ timer }) {
  const [activeTab, setActiveTab] = useState('feed');
  const C = useTheme();

  useEffect(() => {
    SocialController.initializeHybridRealtime?.();
    SocialController.fetchFeed?.();
    return () => SocialController.cleanup?.();
  }, []);

  const profileUser = useSocialModalsStore(s => s.profileUser);
  const commentsPost = useSocialModalsStore(s => s.commentsPost);
  const closeAllModals = useSocialModalsStore(s => s.closeAll);

  return (
    <div style={{ 
      flex: 1, display: "flex", flexDirection: "column", 
      // 🔥 YENİ: Cam tasarımın öne çıkması için çok hafif zümrüt ortam ışığı (Ambient Glow)
      background: "radial-gradient(circle at top right, rgba(34,197,94,0.03), transparent 50%), radial-gradient(circle at bottom left, rgba(59,130,246,0.02), transparent 50%), #060608", 
      height: "100%", overflow: "hidden" 
    }}>
      
      <SocialHeader activeTab={activeTab} setActiveTab={setActiveTab} C={C} />

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "20px 20px 100px" }}>
        <AnimatePresence mode="wait">
          
          {activeTab === 'feed' && (
            <motion.div key="feed" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
              <FeedView />
            </motion.div>
          )}

          {/* 🔥 SENİN PAZAR YERİN (MARKET) */}
          {activeTab === 'market' && (
            <motion.div key="market" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
               <Suspense fallback={<div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", marginTop: 40 }}>Yükleniyor...</div>}>
                 <MarketplaceView C={C} />
               </Suspense>
            </motion.div>
          )}

          {/* 🔥 SENİN SIRALAMAN (LEADERBOARD) */}
          {activeTab === 'leaderboard' && (
            <motion.div key="leaderboard" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
               <LeaderboardView C={C} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* MODALLAR */}
      <AnimatePresence>
        {profileUser && (
          <UserProfileModal 
            user={profileUser} 
            onClose={closeAllModals} 
            C={C}
            isFollowing={(useAppStore.getState().social.following || []).includes(profileUser?.uid || profileUser?.id)} 
            onToggleFollow={(id) => {
              const targetId = id || profileUser?.uid || profileUser?.id;
              SocialController.toggleFollow(targetId);
            }}
          />
        )}
        
        {commentsPost && (
          <CommentsModal 
            post={commentsPost} 
            onClose={closeAllModals} 
            C={C}
          />
        )}
      </AnimatePresence>
    </div>
  );
}