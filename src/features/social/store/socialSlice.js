// src/features/social/store/socialSlice.js

const MAX_CACHE_SIZE = 200; // Bellek şişmesini önlemek için
const CACHE_TTL_MS = 60 * 1000; // 1 Dakika TTL

export const createSocialSlice = (set, get) => ({
  social: {
    postsById: {},    
    feedIds: [],      
    stories: [],      
    // 🔥 FIX: lastVisibleDoc (Obje) yerine lastVisibleDocId (String) kullanıyoruz. 
    // Böylece Zustand Persist çökmeyecek.
    lastVisibleDocId: null, 
    hasMore: true,
    lastFetchedAt: null, 
    
    status: {
      isFetchingInitial: false,
      isFetchingMore: false,
      isRevalidating: false,
      mutating: {},          
      error: null,
    },

    actions: {
      // --- HİKAYE AKSİYONLARI ---
      setStories: (stories) => set(s => ({ 
        social: { ...s.social, stories } 
      })),
      
      addStoryOptimistic: (story) => set(s => ({
        social: { ...s.social, stories: [story, ...s.social.stories] }
      })),

      // --- AKIŞ AKSİYONLARI ---
      // 🔥 FIX: snapshotDoc yerine sadece lastDocId string'i alıyoruz
      upsertPosts: (posts, isLoadMore = false, lastDocId = null) => set(s => {
        const currentUid = s.user?.uid || s.user?.id;
        const following = s.social.following || [];
        const newPostsById = { ...s.social.postsById };
        const newIds = [];
        
        posts.forEach(rawPost => {
          const p = {
            ...rawPost,
            author: rawPost.author || {
              id: rawPost.userId || "unknown",
              uid: rawPost.userId || "unknown",
              name: rawPost.userName || "İsimsiz Sporcu",
              userName: rawPost.userName || "İsimsiz Sporcu",
              avatar: rawPost.userAvatar || rawPost.avatar || "👤"
            },
            engagement: rawPost.engagement || {
              likesCount: rawPost.likes || 0,
              likedBy: rawPost.likedBy || [],
              commentsCount: rawPost.comments?.length || 0
            }
          };

          // --- ALGORİTMİK SIRALAMA ---
          let edgeScore = p.createdAt?.toMillis ? p.createdAt.toMillis() : (p.createdAt || Date.now());
          if (p.author && following.includes(p.author.uid)) edgeScore += 3600000; 
          if (p.engagement) edgeScore += ((p.engagement.likesCount || 0) * 300000); 

          newPostsById[p.id] = { ...newPostsById[p.id], ...p, _rankingScore: edgeScore }; 
          newIds.push(p.id);
        });

        const allIds = Array.from(new Set(
          isLoadMore ? [...s.social.feedIds, ...newIds] : [...newIds, ...s.social.feedIds]
        ));

        const sortedFeedIds = allIds.sort((a, b) => 
          (newPostsById[b]._rankingScore || 0) - (newPostsById[a]._rankingScore || 0)
        );

        return {
          social: {
            ...s.social,
            postsById: newPostsById,
            feedIds: sortedFeedIds,
            // 🔥 FIX: Persist hatasını önlemek için Snapshot objesi değil sadece ID stringi yazıldı.
            lastVisibleDocId: lastDocId !== null ? lastDocId : s.social.lastVisibleDocId,
            lastFetchedAt: Date.now(),
            status: { ...s.social.status, isFetchingInitial: false, isFetchingMore: false, isRevalidating: false }
          }
        };
      }),

      deletePost: (postId) => set(s => {
        const newPostsById = { ...s.social.postsById };
        delete newPostsById[postId];
        return {
          social: {
            ...s.social,
            postsById: newPostsById,
            feedIds: s.social.feedIds.filter(id => id !== postId)
          }
        };
      }),

      // --- BELLEK ŞİŞMESİ KORUMASI ---
      garbageCollect: () => set(s => {
        const feedIds = s.social.feedIds;
        if (feedIds.length < 50) return s;

        const jsonString = JSON.stringify(s.social.postsById);
        const sizeInMB = new Blob([jsonString]).size / (1024 * 1024);

        if (sizeInMB > 5 || feedIds.length > MAX_CACHE_SIZE) {
          console.warn(`[GC] Memory limit aşıldı. Temizleniyor...`);
          const keptIds = feedIds.slice(0, 100); 
          const keptPosts = {};
          keptIds.forEach(id => keptPosts[id] = s.social.postsById[id]);
          return { social: { ...s.social, feedIds: keptIds, postsById: keptPosts, hasMore: true } };
        }
        return s;
      }),

      // --- OPTİMİSTİK GÜNCELLEMELER ---
      toggleLikeOptimistic: (postId, currentUid, forceState = null) => set(s => {
        const post = s.social.postsById[postId];
        if (!post) return s;

        const isCurrentlyLiked = post.engagement.likedBy.includes(currentUid);
        const willBeLiked = forceState !== null ? forceState : !isCurrentlyLiked;
        if (isCurrentlyLiked === willBeLiked) return s;

        const newLikedBy = willBeLiked 
          ? [...post.engagement.likedBy, currentUid] 
          : post.engagement.likedBy.filter(id => id !== currentUid);

        return {
          social: {
            ...s.social,
            postsById: {
              ...s.social.postsById,
              [postId]: {
                ...post,
                engagement: { ...post.engagement, likesCount: newLikedBy.length, likedBy: newLikedBy }
              }
            }
          }
        };
      }),
       
      toggleFollowOptimistic: (targetUid) => set(s => {
        const currentFollowing = s.social.following || [];
        const isFollowing = currentFollowing.includes(targetUid);
        const newFollowing = isFollowing 
          ? currentFollowing.filter(id => id !== targetUid) 
          : [...currentFollowing, targetUid];
        return { social: { ...s.social, following: newFollowing } };
      }),

      // --- SİSTEM DURUMLARI ---
      lockAction: (lockId) => set(s => ({ 
        social: { ...s.social, status: { ...s.social.status, mutating: { ...s.social.status.mutating, [lockId]: true } } } 
      })),
      
      unlockAction: (lockId) => set(s => {
        const newMutating = { ...s.social.status.mutating };
        delete newMutating[lockId];
        return { social: { ...s.social, status: { ...s.social.status, mutating: newMutating } } };
      }),
      
      setError: (err) => set(s => ({ 
        social: { ...s.social, status: { ...s.social.status, error: err } } 
      }))
    }
  }
});