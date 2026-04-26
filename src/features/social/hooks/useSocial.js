import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { HapticEngine, SoundEngine } from '@/shared/lib/hapticSoundEngine.js';
import { useAppStore } from '@/app/store.js';
import { getLiveFeed, getLeaderboardData, getRivalData } from '@/shared/lib/firebaseService';
import { auth, db } from '@/shared/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { useCoopSession } from '../hooks/useCoopSession.js';

// 🔥 HOOK IMPORT EKLENDİ
import useModalStore from '@/shared/store/useModalStore';

// --- YARDIMCI HESAPLAMA FONKSİYONLARI (Saf Logic) ---
export const calculatePowerScore = (liftWeight, bodyWeight = 75, exerciseName = "") => {
  const ratio = (parseFloat(liftWeight) || 0) / (parseFloat(bodyWeight) || 75);
  let score = Math.round(ratio * 100); 
  
  const nameLower = (exerciseName || "").toLowerCase();
  if(nameLower.includes("deadlift")) score = Math.round(ratio * 80);
  if(nameLower.includes("overhead")) score = Math.round(ratio * 140);
  if(nameLower.includes("squat")) score = Math.round(ratio * 90);

  let level = "Çaylak"; let color = "#94a3b8"; 
  if (score >= 90) { level = "Gelişen"; color = "#3b82f6"; } 
  if (score >= 120) { level = "İleri Seviye"; color = "#22c55e"; } 
  if (score >= 150) { level = "Elit Atlet"; color = "#f59e0b"; } 
  if (score >= 180) { level = "Canavar"; color = "#ef4444"; } 

  return { score, level, color };
};

export const getMajorLifts = (exercisesList) => {
  if (!exercisesList || !Array.isArray(exercisesList)) return [];
  const majors = ["bench press", "squat", "deadlift", "overhead press", "incline", "barbell row"];
  return exercisesList.filter(ex => majors.some(m => (ex?.name || "").toLowerCase().includes(m)) && (ex?.maxWeight || 0) > 0);
};

// --- ANA LOGIC HOOK'U ---
export function useSocial() {
  const { t } = useTranslation();
  const { openModal } = useModalStore(); // 🔥 EKLENDİ
  
  const { user: currentUser, updateUser } = useAppStore();
  const currentUserName = currentUser?.firstName ? `${currentUser.firstName} ${currentUser?.lastName?.[0] || ''}.` : "Kullanıcı";
  const currentUserId = auth?.currentUser?.uid || "guest";

  // --- STATE'LER ---
  const [activeTab, setActiveTab] = useState('feed'); 
  const [feedFilter, setFeedFilter] = useState('all'); 
  const [selectedEx, setSelectedEx] = useState('Tonnage');
  
  const [feedData, setFeedData] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [rivalData, setRivalData] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [viewCommentsPost, setViewCommentsPost] = useState(null);
  const [following, setFollowing] = useState([]); 
  const [isPrivateProfile, setIsPrivateProfile] = useState(currentUser?.isPrivate ?? true);

  const { coopId, coopData, createRoom, joinRoom, endSession } = useCoopSession();
  const [joinCode, setJoinCode] = useState("");
  const [coopLoading, setCoopLoading] = useState(false);

  // --- HESAPLAMALAR & FORMATLAMALAR ---
  const timeAgo = useCallback((dateInput) => {
    if (!dateInput) return t('soc_time_just_now', 'Az önce');
    const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " gün";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " saat";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " dk";
    return "Az önce";
  }, [t]);

  // --- VERİ ÇEKME (FETCH) ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (activeTab === "feed") {
        try {
          const liveFeed = await getLiveFeed();
          const enrichedFeed = (liveFeed || []).map(post => ({
            ...post, 
            likes: post?.likes || 0, 
            likedBy: post?.likedBy || [],
            comments: post?.comments || [], 
            reactions: post?.reactions || []
          }));
          setFeedData(enrichedFeed);
        } catch (e) { console.error("Feed error:", e); }
      } 
      else if (activeTab === "leaderboard") {
        try {
          const boardData = await getLeaderboardData();
          setLeaderboardData(boardData || []);

          let myVol = 0;
          const myEntry = (boardData || []).find(b => b?.userId === currentUserId);
          
          if (myEntry) {
            myVol = myEntry?.totalVolume || 0;
          } else if (currentUserId !== "guest") {
            try {
              const myDoc = await getDoc(doc(db, "leaderboard", currentUserId));
              if (myDoc.exists()) myVol = myDoc.data()?.totalVolume || 0;
            } catch (e) {}
          }

          if (myEntry && (boardData || []).indexOf(myEntry) === 0) {
             setRivalData({ type: 'first', isFirst: true });
          } else if (myVol >= 0) {
             const rData = await getRivalData(myVol);
             if (rData) {
               setRivalData({ type: 'rival', isFirst: false, data: rData, gap: (rData?.totalVolume || 0) - myVol });
             }
          }
        } catch (e) { console.error("Leaderboard error:", e); }
      }
      setIsLoading(false);
    };
    fetchData();
  }, [activeTab, currentUserId]);

  // --- HANDLER FONKSİYONLARI ---
  const handleTogglePrivacy = useCallback(async () => {
    const newStatus = !isPrivateProfile;
    setIsPrivateProfile(newStatus);
    if (HapticEngine?.medium) HapticEngine.medium(); 
    if (SoundEngine?.tick) SoundEngine.tick();
    
    const warningText = newStatus ? "Bu kullanıcı vücut verilerini gizli tutmaktadır." : "Bu profil vücut verilerini açıkça paylaşmaktadır.";
    if (updateUser) updateUser({ isPrivate: newStatus, privacyWarning: warningText });

    if (currentUserId && currentUserId !== "guest") {
      try { await updateDoc(doc(db, 'users', currentUserId), { isPrivate: newStatus, privacyWarning: warningText }); } catch (err) {}
    }
  }, [isPrivateProfile, currentUserId, updateUser]);

  const handleToggleLike = useCallback(async (postId, likedByList = [], e) => {
    if (e?.stopPropagation) e.stopPropagation(); 
    if (HapticEngine?.light) HapticEngine.light();
    
    const hasLiked = (likedByList || []).includes(currentUserId);
    
    setFeedData(prev => (prev || []).map(p => {
      if (p?.id === postId) {
        const newLikedBy = hasLiked ? (p?.likedBy || []).filter(id => id !== currentUserId) : [...(p?.likedBy || []), currentUserId];
        const newLikes = hasLiked ? Math.max(0, (p?.likes || 1) - 1) : (p?.likes || 0) + 1;
        return { ...p, isLiked: !hasLiked, likes: newLikes, likedBy: newLikedBy };
      }
      return p;
    }));

    try {
      const postRef = doc(db, 'feed', postId);
      if (hasLiked) await updateDoc(postRef, { likedBy: arrayRemove(currentUserId), likes: increment(-1) });
      else await updateDoc(postRef, { likedBy: arrayUnion(currentUserId), likes: increment(1) });
    } catch (err) {}
  }, [currentUserId]);

  const handleAddReaction = useCallback(async (postId, emoji, e) => {
    if (e?.stopPropagation) e.stopPropagation(); 
    if (HapticEngine?.medium) HapticEngine.medium();
    
    setFeedData(prev => (prev || []).map(p => p?.id === postId ? { ...p, reactions: [...(p?.reactions||[]), emoji] } : p));
    try { await updateDoc(doc(db, 'feed', postId), { reactions: arrayUnion(emoji) }); } catch (err) {}
  }, []);

  const handleAddComment = useCallback(async (postId, userName, text) => {
    if (!text?.trim()) return;
    const newComment = { user: userName, text: text.trim() };
    setFeedData(prev => (prev || []).map(p => p?.id === postId ? { ...p, comments: [...(p?.comments||[]), newComment] } : p));
    if (HapticEngine?.light) HapticEngine.light();
    try { await updateDoc(doc(db, 'feed', postId), { comments: arrayUnion(newComment) }); } catch (err) {}
  }, []);

  const handleToggleFollow = useCallback((targetUserId) => {
    setFollowing(prev => (prev || []).includes(targetUserId) ? prev.filter(id => id !== targetUserId) : [...(prev || []), targetUserId]);
  }, []);

  const handleUserClick = useCallback(async (post) => {
    if (!post) return;
    const uid = post?.userId || post?.userName; 
    if(!uid) return;
    
    let profileData = { id: uid, name: post?.userName || "Kullanıcı", avatar: post?.userAvatar || "👤", level: 1, title: "Üye", bodyWeight: "-", height: "-", age: "-", programs: [], badges: ["🔥"], prs: [], privacyWarning: "Veriler yükleniyor...", isPrivate: true, isMe: uid === currentUserId };
    setViewUser(profileData); 

    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if(snap.exists()) {
         const ud = snap.data();
         let formattedPrs = [];
         if(ud?.weightLog) {
            Object.keys(ud.weightLog).forEach(exName => {
               const logs = ud.weightLog[exName];
               if(logs && logs.length > 0) {
                 const best = Math.max(...(logs || []).map(l => l?.weight || 0));
                 if(best > 0) formattedPrs.push({ name: exName, w: best });
               }
            });
         }
         setViewUser({ ...profileData, level: ud?.level || 1, title: ud?.title || "Üye", bodyWeight: ud?.weight || "-", height: ud?.height || "-", age: ud?.age || "-", programs: ud?.activePlanName ? [ud.activePlanName] : [], badges: ud?.badges || ["🔥"], prs: formattedPrs, isPrivate: ud?.isPrivate ?? true, privacyWarning: ud?.privacyWarning || (ud?.isPrivate ? "Bu kullanıcı vücut verilerini gizli tutmaktadır." : "Bu profil tamamen açıktır.") });
      } else setViewUser({...profileData, privacyWarning: "Kullanıcı veritabanında bulunamadı."});
    } catch(e) { setViewUser({...profileData, privacyWarning: "Veri çekilirken hata oluştu."}); }
  }, [currentUserId]);

  const handleCreateRoom = useCallback(async () => { 
    setCoopLoading(true); 
    if(createRoom) await createRoom(); 
    setCoopLoading(false); 
  }, [createRoom]);

  const handleJoinRoom = useCallback(async () => {
    if (!joinCode) return;
    setCoopLoading(true);
    let success = false;
    if(joinRoom) success = await joinRoom(joinCode);
    
    // 🔥 ALERT DEĞİŞTİRİLDİ
    if (!success) openModal({ type: 'alert', title: 'Hata', message: 'Oda bulunamadı veya kod hatalı!' });
    
    setCoopLoading(false);
  }, [joinCode, joinRoom, openModal]);

  const displayFeed = useMemo(() => {
    return feedFilter === 'all' 
      ? feedData 
      : (feedData || []).filter(post => (following || []).includes(post?.userId || post?.userName));
  }, [feedFilter, feedData, following]);

  const QUICK_EMOJIS = useMemo(() => ["💪", "🦍", "🚀", "🎯"], []);

  return {
    t, currentUserName, currentUserId, activeTab, setActiveTab, feedFilter, setFeedFilter, 
    selectedEx, setSelectedEx, leaderboardData, isLoading, rivalData,
    viewUser, setViewUser, viewCommentsPost, setViewCommentsPost, following,
    isPrivateProfile, coopId, coopData, joinCode, setJoinCode, coopLoading,
    timeAgo, handleTogglePrivacy, handleToggleLike, handleAddReaction, handleAddComment,
    handleToggleFollow, handleUserClick, handleCreateRoom, handleJoinRoom, endSession,
    displayFeed, QUICK_EMOJIS
  };
}