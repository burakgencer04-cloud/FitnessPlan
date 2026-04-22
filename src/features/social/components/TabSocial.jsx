import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { globalFonts as fonts } from '@/shared/ui/globalStyles.js';
import { HapticEngine, SoundEngine } from '@/shared/lib/hapticSoundEngine.js';
import { useAppStore } from '@/app/store.js';

import { getLiveFeed, getLeaderboardData } from '@/shared/lib/firebaseService';
import { auth, db } from '@/shared/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';

const sleekRowStyle = {
  background: "linear-gradient(145deg, rgba(15, 15, 20, 0.8) 0%, rgba(40, 40, 45, 0.2) 100%)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.02)",
  boxShadow: "inset 0 4px 15px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.5)",
  transform: "translateZ(0)"
};

const calculatePowerScore = (liftWeight, bodyWeight = 75, exerciseName = "") => {
  const ratio = (parseFloat(liftWeight) || 0) / (parseFloat(bodyWeight) || 75);
  let score = Math.round(ratio * 100); 
  
  if(exerciseName.toLowerCase().includes("deadlift")) score = Math.round(ratio * 80);
  if(exerciseName.toLowerCase().includes("overhead")) score = Math.round(ratio * 140);
  if(exerciseName.toLowerCase().includes("squat")) score = Math.round(ratio * 90);

  let level = "Çaylak"; let color = "#94a3b8"; 
  if (score >= 90) { level = "Gelişen"; color = "#3b82f6"; } 
  if (score >= 120) { level = "İleri Seviye"; color = "#22c55e"; } 
  if (score >= 150) { level = "Elit Atlet"; color = "#f59e0b"; } 
  if (score >= 180) { level = "Canavar"; color = "#ef4444"; } 

  return { score, level, color };
};

const getMajorLifts = (exercisesList) => {
  if (!exercisesList || !Array.isArray(exercisesList)) return [];
  const majors = ["bench press", "squat", "deadlift", "overhead press", "incline", "barbell row"];
  return exercisesList.filter(ex => 
    majors.some(m => ex.name.toLowerCase().includes(m)) && ex.maxWeight > 0
  );
};

const UserProfileModal = ({ user, onClose, C, isFollowing, onToggleFollow }) => {
  const isDataHidden = user.isPrivate && !user.isMe;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 30000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }} onClick={onClose} />
      
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} 
        style={{ width: "100%", maxWidth: 430, height: "85vh", background: "linear-gradient(180deg, #101014 0%, #050810 100%)", borderTopLeftRadius: 32, borderTopRightRadius: 32, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", borderTop: `1px solid rgba(255,255,255,0.05)`, boxShadow: "0 -10px 40px rgba(0,0,0,0.8)" }}
      >
        <div style={{ padding: "20px 20px 0 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
             <div style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(0,0,0,0.4))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: `1px solid rgba(255,255,255,0.05)` }}>{user.avatar || "👤"}</div>
             <div>
               <h3 style={{ margin: "0 0 2px 0", fontSize: 20, color: "#fff", fontFamily: fonts.header, fontStyle: "italic" }}>{user.name}</h3>
               <div style={{ fontSize: 10, color: C.green, fontWeight: 900, background: "rgba(46, 204, 113, 0.1)", padding: "4px 8px", borderRadius: 6, display: "inline-block", border: "1px solid rgba(46, 204, 113, 0.2)", fontStyle: "italic" }}>Lvl {user.level || 1} • {user.title || "Savaşçı"}</div>
             </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.05)", color: "#fff", width: 32, height: 32, borderRadius: 10, fontSize: 14, cursor: "pointer" }}>✕</button>
        </div>

        <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "0 20px 40px 20px" }}>
          {!user.isMe && (
            <motion.button 
              whileTap={{ scale: 0.96 }} onClick={() => { onToggleFollow(user.id); HapticEngine.medium(); SoundEngine.tick(); }}
              style={{ width: "100%", marginBottom: 16, padding: "12px", borderRadius: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 900, fontSize: 14, fontFamily: fonts.header, fontStyle: "italic", transition: "0.3s", background: isFollowing ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${C.green}, #22c55e)`, border: isFollowing ? "1px solid rgba(255,255,255,0.1)" : "none", color: isFollowing ? "#fff" : "#000" }}
            >
              {isFollowing ? (<><span style={{ color: C.green }}>✓</span> Takiptesin (Partner)</>) : (<>🤝 Partner Ol</>)}
            </motion.button>
          )}

          <div style={{ display: "flex", gap: 10, marginBottom: 16, opacity: isDataHidden ? 0.3 : 1 }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.03)", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 900, fontStyle: "italic", marginBottom: 2 }}>BOY</div>
              <div style={{ fontSize: 15, color: "#fff", fontWeight: 900, fontFamily: fonts.mono }}>{isDataHidden ? "***" : user.height} <span style={{fontSize:9, color: "rgba(255,255,255,0.3)"}}>cm</span></div>
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.03)", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 900, fontStyle: "italic", marginBottom: 2 }}>KİLO</div>
              <div style={{ fontSize: 15, color: "#fff", fontWeight: 900, fontFamily: fonts.mono }}>{isDataHidden ? "***" : user.bodyWeight} <span style={{fontSize:9, color: "rgba(255,255,255,0.3)"}}>kg</span></div>
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.03)", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 900, fontStyle: "italic", marginBottom: 2 }}>YAŞ</div>
              <div style={{ fontSize: 15, color: "#fff", fontWeight: 900, fontFamily: fonts.mono }}>{isDataHidden ? "**" : user.age}</div>
            </div>
          </div>

          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 8, fontStyle: "italic" }}>KULLANDIĞI PROGRAMLAR</div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12 }}>
            {user.programs?.length > 0 ? user.programs.map((prog, i) => (
              <div key={i} style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#3b82f6", padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 900, flexShrink: 0, fontStyle: "italic" }}>
                📋 {prog}
              </div>
            )) : <div style={{color: "rgba(255,255,255,0.3)", fontSize: 11, fontStyle: "italic"}}>Gizli veya girilmemiş.</div>}
          </div>

          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 8, fontStyle: "italic" }}>KİŞİSEL REKORLAR (PR)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {user.prs?.length > 0 ? user.prs.map((pr, i) => {
              const power = calculatePowerScore(pr.w, user.bodyWeight, pr.name);
              return (
                <div key={i} style={{ ...sleekRowStyle, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8, marginBottom: 0, borderRadius: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 15, color: "#fff", fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic" }}>{pr.name}</span>
                    <span style={{ fontSize: 16, color: C.yellow, fontWeight: 900, fontFamily: fonts.mono, fontStyle: "italic" }}>{pr.w} <span style={{fontSize:10, color:"rgba(255,255,255,0.5)"}}>kg</span></span>
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

          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, fontStyle: "italic", background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.05)" }}>
             <span style={{ fontSize: 20 }}>{isDataHidden ? '🔒' : '🌍'}</span> {user.privacyWarning}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CommentsModal = ({ post, onClose, C, onAddComment, currentUserName }) => {
  const [commentText, setCommentText] = useState("");

  const handleSend = () => {
    if(!commentText.trim()) return;
    onAddComment(post.id, currentUserName, commentText);
    setCommentText("");
    HapticEngine.light();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 30000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }} onClick={onClose} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} style={{ width: "100%", maxWidth: 430, height: "70vh", background: "linear-gradient(180deg, #101014 0%, #050810 100%)", borderTopLeftRadius: 32, borderTopRightRadius: 32, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", borderTop: `1px solid rgba(255,255,255,0.05)`, boxShadow: "0 -10px 40px rgba(0,0,0,0.8)" }}>
        
        <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 style={{ margin: 0, fontSize: 18, color: "#fff", fontFamily: fonts.header, fontStyle: "italic" }}>Yorumlar ({post.comments?.length || 0})</h3>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: 10, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {!post.comments || post.comments.length === 0 ? (
            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontStyle: "italic", marginTop: 40, fontSize: 13 }}>Henüz yorum yok. İlk ateşleyen sen ol!</div>
          ) : (
            post.comments.map((c, i) => (
              <div key={i} style={{ ...sleekRowStyle, padding: "14px", borderRadius: 16, marginBottom: 0 }}>
                 <div style={{ fontSize: 12, color: C.green, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", marginBottom: 4 }}>{c.user}</div>
                 <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.4, fontStyle: "italic" }}>{c.text}</div>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: "12px 16px 24px 16px", background: "rgba(0,0,0,0.6)", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 10, alignItems: "center" }}>
          <input 
            type="text" placeholder="Yorum yaz..." value={commentText} onChange={e => setCommentText(e.target.value)} 
            style={{ flex: 1, minWidth: 0, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "12px 16px", color: "#fff", outline: "none", fontSize: 14, fontStyle: "italic" }} 
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${C.green}, #22c55e)`, color: "#000", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: `0 4px 10px rgba(46, 204, 113, 0.3)` }}>
             <span style={{ fontSize: 20, transform: "translateX(-2px)" }}>➤</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function TabSocial({ themeColors: C }) {
  const { t } = useTranslation();
  
  const currentUser = useAppStore(state => state.user);
  const currentUserName = currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName?.[0] || ''}.` : "Kullanıcı";
  const currentUserId = auth?.currentUser?.uid || "guest";

  const [activeTab, setActiveTab] = useState('feed'); 
  const [feedFilter, setFeedFilter] = useState('all'); 
  const [selectedEx, setSelectedEx] = useState('Bench Press');
  
  const [feedData, setFeedData] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [viewUser, setViewUser] = useState(null);
  const [viewCommentsPost, setViewCommentsPost] = useState(null);
  const [following, setFollowing] = useState([]); 

  // 🔥 GİZLİLİK BUTONU STATE'İ
  const [isPrivateProfile, setIsPrivateProfile] = useState(currentUser?.isPrivate ?? true);

  const timeAgo = (dateInput) => {
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
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (activeTab === "feed") {
        const liveFeed = await getLiveFeed();
        const enrichedFeed = liveFeed.map(post => ({
          ...post,
          likes: post.likes || 0,
          likedBy: post.likedBy || [],
          comments: post.comments || [],
          reactions: post.reactions || []
        }));
        setFeedData(enrichedFeed);
      } else {
        const boardData = await getLeaderboardData();
        setLeaderboardData(boardData);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [activeTab]);



  // 🔥 FIREBASE & STORE UPDATE: Gizlilik Ayarı Değiştirme
  const handleTogglePrivacy = async () => {
    const newStatus = !isPrivateProfile;
    
    // 1. Ekranı anında değiştir (Titreşim ve Ses ile)
    setIsPrivateProfile(newStatus);
    HapticEngine.medium();
    SoundEngine.tick();
    
    const warningText = newStatus 
      ? "Bu kullanıcı vücut verilerini gizli tutmaktadır." 
      : "Bu profil vücut verilerini açıkça paylaşmaktadır.";

    // 2. Global Store'u anında güncelle ki sekme değiştirince eski haline dönmesin
    if (updateUser) {
      updateUser({ isPrivate: newStatus, privacyWarning: warningText });
    }

    // 3. Eğer giriş yapmış bir kullanıcıysa Firebase'e kalıcı olarak yaz
    if (currentUserId && currentUserId !== "guest") {
      try {
        const userRef = doc(db, 'users', currentUserId);
        await updateDoc(userRef, { 
          isPrivate: newStatus,
          privacyWarning: warningText
        });
      } catch (err) {
        console.error("Gizlilik ayarı Firebase'e yazılamadı, ancak lokalde güncellendi:", err);
        // Hata olsa bile ekranı geri zıplatmıyoruz, kullanıcı deneyimini bozmuyoruz.
      }
    }
  };

  const handleToggleLike = async (postId, likedByList = [], e) => {
    e.stopPropagation(); HapticEngine.light();
    const hasLiked = likedByList.includes(currentUserId);
    
    setFeedData(prev => prev.map(p => {
      if (p.id === postId) {
        const newLikedBy = hasLiked ? p.likedBy.filter(id => id !== currentUserId) : [...p.likedBy, currentUserId];
        const newLikes = hasLiked ? Math.max(0, (p.likes || 1) - 1) : (p.likes || 0) + 1;
        return { ...p, isLiked: !hasLiked, likes: newLikes, likedBy: newLikedBy };
      }
      return p;
    }));

    try {
      const postRef = doc(db, 'feed', postId);
      if (hasLiked) {
        await updateDoc(postRef, { likedBy: arrayRemove(currentUserId), likes: increment(-1) });
      } else {
        await updateDoc(postRef, { likedBy: arrayUnion(currentUserId), likes: increment(1) });
      }
    } catch (err) { console.error("Beğeni hatası:", err); }
  };

  const handleAddReaction = async (postId, emoji, e) => {
    e.stopPropagation(); HapticEngine.medium();
    
    setFeedData(prev => prev.map(p => {
      if(p.id === postId) return { ...p, reactions: [...(p.reactions||[]), emoji] };
      return p;
    }));

    try {
      const postRef = doc(db, 'feed', postId);
      await updateDoc(postRef, { reactions: arrayUnion(emoji) });
    } catch (err) { console.error("Emoji hatası:", err); }
  };

  const handleAddComment = async (postId, userName, text) => {
    const newComment = { user: userName, text: text };
    
    setFeedData(prev => prev.map(p => {
      if(p.id === postId) return { ...p, comments: [...(p.comments||[]), newComment] };
      return p;
    }));

    try {
      const postRef = doc(db, 'feed', postId);
      await updateDoc(postRef, { comments: arrayUnion(newComment) });
    } catch (err) { console.error("Yorum hatası:", err); }
  };

  const handleToggleFollow = (targetUserId) => {
    setFollowing(prev => prev.includes(targetUserId) ? prev.filter(id => id !== targetUserId) : [...prev, targetUserId]);
  };

  const handleUserClick = async (post) => {
    const uid = post.userId || post.userName; 
    if(!uid) return;
    
    let profileData = {
      id: uid, name: post.userName || "Kullanıcı", avatar: post.userAvatar || "👤",
      level: 1, title: "Üye", bodyWeight: "-", height: "-", age: "-",
      programs: [], badges: ["🔥"], prs: [], privacyWarning: "Veriler yükleniyor...", isPrivate: true, isMe: uid === currentUserId
    };
    setViewUser(profileData); 

    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if(snap.exists()) {
         const ud = snap.data();
         
         let formattedPrs = [];
         if(ud.weightLog) {
            Object.keys(ud.weightLog).forEach(exName => {
               const logs = ud.weightLog[exName];
               if(logs && logs.length > 0) {
                 const best = Math.max(...logs.map(l => l.weight || 0));
                 if(best > 0) formattedPrs.push({ name: exName, w: best });
               }
            });
         }

         setViewUser({
           ...profileData,
           level: ud.level || 1, title: ud.title || "Üye",
           bodyWeight: ud.weight || "-", height: ud.height || "-", age: ud.age || "-",
           programs: ud.activePlanName ? [ud.activePlanName] : [],
           badges: ud.badges || ["🔥"], prs: formattedPrs,
           isPrivate: ud.isPrivate ?? true,
           privacyWarning: ud.privacyWarning || (ud.isPrivate ? "Bu kullanıcı vücut verilerini gizli tutmaktadır." : "Bu profil tamamen açıktır.")
         });
      } else {
         setViewUser({...profileData, privacyWarning: "Kullanıcı veritabanında bulunamadı."});
      }
    } catch(e) {
       setViewUser({...profileData, privacyWarning: "Veri çekilirken bağlantı hatası oluştu."});
    }
  };

  const displayFeed = feedFilter === 'all' 
    ? feedData 
    : feedData.filter(post => following.includes(post.userId || post.userName));

  const QUICK_EMOJIS = ["💪", "🦍", "🚀", "🎯"];

  return (
    <div style={{ minHeight: '100%', paddingBottom: 80, color: C.text, position: "relative" }}>
      
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      {/* ARKA PLAN */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1], x: [0, -30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', top: '-10%', right: '-10%', width: '80vw', height: '80vw', background: `radial-gradient(circle, ${C.yellow}30 0%, transparent 60%)`, filter: 'blur(100px)' }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, padding: "0 4px" }}>
        
        {/* ÜST BAŞLIK VE GİZLİLİK BUTONU */}
        <div style={{ ...sleekRowStyle, padding: "20px", marginBottom: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic", letterSpacing: -0.5 }}>{t('soc_title', 'Topluluk & Rekabet')} 🍻</h2>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6, fontStyle: "italic" }}>{t('soc_desc', 'Takip et, motive ol, sınırlarını zorla.')}</div>
          </div>
          
          <button 
            onClick={handleTogglePrivacy}
            style={{ 
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, 
              background: isPrivateProfile ? "rgba(46, 204, 113, 0.05)" : "rgba(231, 76, 60, 0.05)", 
              padding: "12px 16px", borderRadius: 16, 
              border: `1px solid ${isPrivateProfile ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)'}`,
              cursor: "pointer", transition: "0.3s"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{isPrivateProfile ? '🛡️' : '🌍'}</span>
              <span style={{ fontSize: 11, color: isPrivateProfile ? C.green : C.red, fontWeight: 900, fontStyle: "italic" }}>
                {isPrivateProfile ? 'Gizlilik Açık: Kilo/Boy Gizli' : 'Gizlilik Kapalı: Profil Herkese Açık'}
              </span>
            </div>
            <div style={{ width: 36, height: 20, background: isPrivateProfile ? C.green : "rgba(255,255,255,0.1)", borderRadius: 20, position: "relative", transition: "0.3s" }}>
               <div style={{ width: 16, height: 16, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: isPrivateProfile ? 18 : 2, transition: "0.3s", boxShadow: "0 2px 5px rgba(0,0,0,0.5)" }} />
            </div>
          </button>
        </div>

        {/* TAB GEÇİŞLERİ */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, background: "rgba(0,0,0,0.4)", padding: 6, borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={() => setActiveTab('feed')} style={{ flex: 1, padding: "12px", borderRadius: 16, background: activeTab === 'feed' ? "rgba(255,255,255,0.1)" : "transparent", border: "none", color: activeTab === 'feed' ? "#fff" : "rgba(255,255,255,0.4)", fontWeight: 900, fontSize: 13, fontFamily: fonts.header, fontStyle: "italic", cursor: "pointer", transition: "0.2s" }}>🌐 Akış</button>
          <button onClick={() => setActiveTab('leaderboard')} style={{ flex: 1, padding: "12px", borderRadius: 16, background: activeTab === 'leaderboard' ? "rgba(255,255,255,0.1)" : "transparent", border: "none", color: activeTab === 'leaderboard' ? "#fff" : "rgba(255,255,255,0.4)", fontWeight: 900, fontSize: 13, fontFamily: fonts.header, fontStyle: "italic", cursor: "pointer", transition: "0.2s" }}>🏆 Liderler</button>
        </div>

        {isLoading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.sub, fontWeight: 800, fontSize: 13, fontStyle: "italic" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ fontSize: 28, marginBottom: 10, display: "inline-block" }}>⏳</motion.div>
            <div>Yükleniyor...</div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isLoading && activeTab === 'feed' && (
            <motion.div key="feed" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 40 }}>
              
              <div style={{ display: "flex", gap: 12, padding: "0 4px", marginBottom: 0 }}>
                 <button onClick={() => setFeedFilter('all')} style={{ background: "transparent", border: "none", color: feedFilter === 'all' ? C.green : "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", cursor: "pointer", borderBottom: feedFilter === 'all' ? `2px solid ${C.green}` : "2px solid transparent", paddingBottom: 6 }}>Tümü</button>
                 <button onClick={() => setFeedFilter('partners')} style={{ background: "transparent", border: "none", color: feedFilter === 'partners' ? C.green : "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", cursor: "pointer", borderBottom: feedFilter === 'partners' ? `2px solid ${C.green}` : "2px solid transparent", paddingBottom: 6 }}>Partnerler</button>
              </div>

              {displayFeed.length === 0 ? (
                <div style={{ ...sleekRowStyle, padding: "32px", textAlign: "center" }}>
                   <div style={{ fontSize: 40, opacity: 0.5 }}>📭</div>
                   <div style={{ color: "#fff", fontWeight: 900, fontStyle: "italic", marginTop: 12, fontSize: 15 }}>Hareket yok.</div>
                </div>
              ) : (
                displayFeed.map((post) => {
                  const isPartner = following.includes(post.userId || post.userName);
                  const hasLiked = post.likedBy?.includes(currentUserId);
                  const importantLifts = getMajorLifts(post.exercisesList);

                  return (
                    <div key={post.id} style={{ ...sleekRowStyle, padding: "16px", display: "flex", flexDirection: "column", gap: 12, marginBottom: 0 }}>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }} onClick={() => handleUserClick(post)}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                           <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: "1px solid rgba(255,255,255,0.05)" }}>{post.userAvatar || "👤"}</div>
                           <div>
                             <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                               <span style={{ fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic" }}>{post.userName}</span>
                               {isPartner && <span style={{ fontSize: 9, background: `rgba(46, 204, 113, 0.2)`, color: C.green, padding: "2px 6px", borderRadius: 6, fontWeight: 900 }}>PARTNER</span>}
                             </div>
                             <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2, fontStyle: "italic" }}>idmanı tamamladı.</div>
                           </div>
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{timeAgo(post.createdAt)}</div>
                      </div>
                      
                      {importantLifts.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {importantLifts.map((lift, i) => (
                             <div key={i} style={{ background: "rgba(0,0,0,0.3)", padding: "12px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.2)" }}>
                               <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                 <span style={{ fontSize: 18 }}>⚡</span>
                                 <span style={{ fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic" }}>{lift.name}</span>
                               </div>
                               <span style={{ fontSize: 15, color: C.yellow, fontFamily: fonts.mono, fontStyle: "italic", fontWeight: 900 }}>{lift.maxWeight} kg</span>
                             </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: 10, boxShadow: "inset 0 2px 10px rgba(0,0,0,0.2)" }}>
                          <span style={{ fontSize: 18 }}>🏋️</span>
                          <span style={{ fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic" }}>{post.workoutName || "Antrenman"}</span>
                        </div>
                      )}

                      {post.reactions?.length > 0 && (
                        <div className="hide-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
                          {post.reactions.map((r, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 12, fontSize: 13, border: "1px solid rgba(255,255,255,0.05)" }}>{r}</div>
                          ))}
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed rgba(255,255,255,0.05)", paddingTop: 12 }}>
                        <div style={{ display: "flex", gap: 16 }}>
                          <button onClick={(e) => handleToggleLike(post.id, post.likedBy || [], e)} style={{ background: "none", border: "none", color: hasLiked ? C.red : "rgba(255,255,255,0.4)", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontStyle: "italic", transition: "0.2s", fontFamily: fonts.mono }}>
                            <span style={{ fontSize: 20, filter: hasLiked ? `drop-shadow(0 0 5px ${C.red})` : "none", transform: hasLiked ? "scale(1.1)" : "scale(1)" }}>{hasLiked ? '🔥' : '🤍'}</span> {post.likes || 0}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setViewCommentsPost(post); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontStyle: "italic", transition: "0.2s", fontFamily: fonts.mono }}>
                            <span style={{ fontSize: 20 }}>💬</span> {post.comments?.length || 0}
                          </button>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {QUICK_EMOJIS.map(emoji => (
                             <button key={emoji} onClick={(e) => handleAddReaction(post.id, emoji, e)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "4px 8px", fontSize: 14, cursor: "pointer" }}>{emoji}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </motion.div>
          )}

          {!isLoading && activeTab === 'leaderboard' && (
            <motion.div key="leaderboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.05)", padding: "12px 16px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
                 <span style={{ fontSize: 18 }}>🎯</span>
                 <select value={selectedEx} onChange={(e) => setSelectedEx(e.target.value)} style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: 15, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", outline: "none", cursor: "pointer" }}>
                   <option value="Tonnage" style={{color:"#000"}}>Toplam Tonaj Ligi</option>
                 </select>
              </div>

              <div style={{ ...sleekRowStyle, padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
                {leaderboardData.length === 0 ? (
                  <div style={{ textAlign: "center", color: C.sub, fontSize: 12, padding: 16, fontStyle: "italic" }}>Liderlik tablosu henüz boş.</div>
                ) : (
                  leaderboardData.map((board, index) => {
                    const rank = index + 1;
                    const isMe = board.userId === currentUserId;
                    const glow = rank === 1 ? C.yellow : rank === 2 ? "#94a3b8" : rank === 3 ? "#b45309" : "transparent";
                    
                    return (
                      <div key={board.id} onClick={() => !isMe && handleUserClick({userName: board.userName, userId: board.userId})} style={{ display: "flex", alignItems: "center", padding: "12px 16px", background: isMe ? `rgba(46, 204, 113, 0.15)` : "rgba(0,0,0,0.3)", borderRadius: 14, border: `1px solid ${isMe ? C.green : 'rgba(255,255,255,0.02)'}`, boxShadow: rank === 1 ? `0 0 15px ${C.yellow}40` : "none", cursor: isMe ? "default" : "pointer" }}>
                        <div style={{ width: 28, fontSize: 16, fontWeight: 900, color: glow, filter: `drop-shadow(0 0 5px ${glow})`, fontStyle: "italic" }}>#{rank}</div>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginRight: 12 }}>👤</div>
                        <div style={{ flex: 1, fontSize: 14, fontWeight: 900, color: isMe ? C.green : "#fff", fontFamily: fonts.header, fontStyle: "italic", display: "flex", alignItems: "center", gap: 8 }}>
                          {board.userName} 
                          {isMe && <span style={{ fontSize: 9, background: C.green, color: "#000", padding: "2px 6px", borderRadius: 4 }}>SEN</span>}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: rank === 1 ? C.yellow : "#fff", fontFamily: fonts.mono, fontStyle: "italic" }}>
                          {(board.totalVolume / 1000).toFixed(1)} <span style={{fontSize:10, color: "rgba(255,255,255,0.4)"}}>t</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
           {viewUser && <UserProfileModal user={viewUser} onClose={() => setViewUser(null)} C={C} isFollowing={following.includes(viewUser.id || viewUser.name)} onToggleFollow={(id) => handleToggleFollow(id)} />}
           {viewCommentsPost && <CommentsModal post={viewCommentsPost} onClose={() => setViewCommentsPost(null)} C={C} onAddComment={handleAddComment} currentUserName={currentUserName} />}
        </AnimatePresence>

      </div>
    </div>
  );
}