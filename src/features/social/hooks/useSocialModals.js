import { create } from 'zustand';

// Sadece Sosyal Topluluk için çalışan izole Modal Yöneticisi
export const useSocialModalsStore = create((set) => ({
  profileUser: null,
  commentsPost: null,
  
  // Artık sadece ID değil, objenin tamamını alıyoruz ki modal anında açılsın
  openUserProfile: (user) => set({ profileUser: user }),
  openComments: (post) => set({ commentsPost: post }),
  closeAll: () => set({ profileUser: null, commentsPost: null })
}));

export const useSocialModals = () => useSocialModalsStore();

export function useSocial() {
  
  const loadFeed = useCallback(async () => {
    // 1. Orkestratör (Hook), Store'dan güncel state'i çeker
    const storeState = useAppStore.getState();
    const currentUid = storeState.user?.uid;
    const following = storeState.social?.following || [];

    // 2. Çekilen saf verileri Servise parametre olarak geçer (Dependency Injection)
    const result = await SocialController.fetchFeed({
      currentUid,
      following,
      cursor: null,
      pageSize: 15
    });

    // 3. Servisten dönen sonuca göre gerekirse Store'u günceller (Mutation)
    if (result.success) {
      // Örn: useAppStore.setState({ feedData: result.data });
    }
  }, []);

  const handleFollow = useCallback(async (targetUid, isFollowing) => {
    const currentUid = useAppStore.getState().user?.uid;
    
    // UI, sadece ne yapılacağını söyler, mantık serviste koşar.
    await SocialController.toggleFollow({
      currentUid,
      targetUid,
      isCurrentlyFollowing: isFollowing
    });
  }, []);

  return { loadFeed, handleFollow };
}