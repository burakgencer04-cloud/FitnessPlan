import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next'; // 🌍 ÇEVİRİ EKLENDİ

import { getLiveFeed, getLeaderboardData } from '../../core/firebaseService';
import { auth } from '../../core/firebase';

const fonts = { header: "'Comucan', system-ui, sans-serif", body: "'Comucan', system-ui, sans-serif", mono: "monospace" };

const getGlassCardStyle = (C) => ({
  background: `linear-gradient(145deg, rgba(30, 30, 35, 0.6), rgba(15, 15, 20, 0.8))`,
  backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
  border: `1px solid rgba(255, 255, 255, 0.06)`,
  boxShadow: "0 15px 35px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
  borderRadius: 28, padding: "24px", marginBottom: 20, position: "relative", overflow: "hidden"
});

export default function TabSocial({ themeColors: C }) {
  const { t } = useTranslation(); // 🌍 ÇEVİRİ HOOK

  const [activeTab, setActiveTab] = useState("feed");
  const [feed, setFeed] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Zaman fonksiyonu T'ye erişebilmesi için bileşenin içine alındı
  const timeAgo = (dateInput) => {
    if (!dateInput) return t('soc_time_just_now');
    const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " " + t('soc_time_years_ago');
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " " + t('soc_time_months_ago');
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " " + t('soc_time_days_ago');
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " " + t('soc_time_hours_ago');
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " " + t('soc_time_mins_ago');
    return t('soc_time_just_now');
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (activeTab === "feed") {
        const liveFeed = await getLiveFeed();
        setFeed(liveFeed);
      } else {
        const boardData = await getLeaderboardData();
        setLeaderboard(boardData);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [activeTab]);

  return (
    <div style={{ paddingBottom: 110, color: C.text, fontFamily: fonts.body, position: "relative" }}>
      
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }} transition={{ duration: 10, repeat: Infinity }} style={{ position: 'absolute', top: '0%', left: '-10%', width: '70vw', height: '70vw', background: `radial-gradient(circle, ${C.yellow}30 0%, transparent 60%)`, filter: 'blur(80px)' }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 24, padding: "0 8px" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", margin: 0, letterSpacing: -1, display: "flex", alignItems: "center", gap: 10 }}>
            {t('soc_title')} <span style={{ fontSize: 26 }}>🍻</span>
          </h2>
          <p style={{ color: C.sub, fontSize: 13, marginTop: 4, fontWeight: 600 }}>{t('soc_desc')}</p>
        </div>

        <div style={{ display: 'flex', background: "rgba(0,0,0,0.3)", backdropFilter: "blur(20px)", borderRadius: 100, padding: 6, marginBottom: 24, border: `1px solid rgba(255,255,255,0.05)` }}>
          <button onClick={() => setActiveTab("feed")} style={{ flex: 1, padding: "12px", borderRadius: 100, border: "none", background: activeTab === "feed" ? "#fff" : "transparent", color: activeTab === "feed" ? "#000" : "rgba(255,255,255,0.5)", fontWeight: 800, cursor: "pointer", transition: "0.3s", boxShadow: activeTab === "feed" ? "0 4px 15px rgba(255,255,255,0.2)" : "none" }}>🌐 {t('soc_tab_feed')}</button>
          <button onClick={() => setActiveTab("leaderboard")} style={{ flex: 1, padding: "12px", borderRadius: 100, border: "none", background: activeTab === "leaderboard" ? "#fff" : "transparent", color: activeTab === "leaderboard" ? "#000" : "rgba(255,255,255,0.5)", fontWeight: 800, cursor: "pointer", transition: "0.3s", boxShadow: activeTab === "leaderboard" ? "0 4px 15px rgba(255,255,255,0.2)" : "none" }}>🏆 {t('soc_tab_leaderboard')}</button>
        </div>

        {isLoading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.sub, fontWeight: 800, fontSize: 14 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ fontSize: 32, marginBottom: 10, display: "inline-block" }}>⚓</motion.div>
            <div>{t('soc_loading')}</div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isLoading && activeTab === "feed" && (
            <motion.div key="feed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {feed.length === 0 ? (
                 <div style={{ textAlign: "center", padding: 40, ...getGlassCardStyle(C) }}>
                   <div style={{ fontSize: 40, marginBottom: 10 }}>🕸️</div>
                   <div style={{ color: "#fff", fontWeight: 900 }}>{t('soc_empty_feed_title')}</div>
                   <div style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>{t('soc_empty_feed_desc')}</div>
                 </div>
              ) : (
                feed.map(post => (
                  <div key={post.id} style={getGlassCardStyle(C)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ fontSize: 24, background: "rgba(255,255,255,0.05)", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid rgba(255,255,255,0.1)` }}>{post.userAvatar || "🥷"}</div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>{post.userName}</div>
                          <div style={{ fontSize: 11, color: C.mute, fontWeight: 600 }}>{timeAgo(post.createdAt)}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 20 }}>🔥</div>
                    </div>
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 16, border: `1px solid rgba(255,255,255,0.03)` }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: C.green, marginBottom: 8 }}>{post.workoutName}</div>
                      <div style={{ display: "flex", gap: 16 }}>
                        <div><span style={{ fontSize: 11, color: C.sub, fontWeight: 800 }}>{t('soc_lbl_tonnage')}</span> <span style={{ fontSize: 14, fontWeight: 900, fontFamily: fonts.mono, color: "#fff" }}>{(post.volume / 1000).toFixed(1)}{t('soc_unit_ton')}</span></div>
                        <div><span style={{ fontSize: 11, color: C.sub, fontWeight: 800 }}>{t('soc_lbl_duration')}</span> <span style={{ fontSize: 14, fontWeight: 900, fontFamily: fonts.mono, color: "#fff" }}>{post.duration}{t('soc_unit_min')}</span></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {!isLoading && activeTab === "leaderboard" && (
            <motion.div key="leaderboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={getGlassCardStyle(C)}>
                <div style={{ fontSize: 12, color: C.sub, fontWeight: 900, letterSpacing: 1.5, marginBottom: 20, textAlign: "center" }}>{t('soc_lead_title')}</div>
                
                {leaderboard.length === 0 ? (
                   <div style={{ textAlign: "center", color: C.sub, fontSize: 13, padding: 20 }}>{t('soc_lead_empty')}</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {leaderboard.map((board, index) => {
                      const rank = index + 1;
                      const isMe = board.userId === auth?.currentUser?.uid;
                      const glow = rank === 1 ? C.yellow : rank === 2 ? "#94a3b8" : rank === 3 ? "#b45309" : "transparent";
                      
                      return (
                        <div key={board.id} style={{ display: "flex", alignItems: "center", padding: "16px", background: isMe ? `rgba(46, 204, 113, 0.15)` : "rgba(0,0,0,0.3)", borderRadius: 20, border: `1px solid ${isMe ? C.green : 'rgba(255,255,255,0.05)'}`, boxShadow: rank === 1 ? `0 0 20px ${C.yellow}40` : "none" }}>
                          <div style={{ width: 30, fontSize: 18, fontWeight: 900, color: glow, filter: `drop-shadow(0 0 5px ${glow})` }}>#{rank}</div>
                          <div style={{ flex: 1, fontWeight: 800, fontSize: 15, color: isMe ? C.green : "#fff", marginLeft: 10 }}>{board.userName}</div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 14, fontWeight: 900, fontFamily: fonts.mono, color: "#fff" }}>{(board.totalVolume / 1000).toFixed(1)} <span style={{fontSize:10, color:C.sub}}>{t('soc_unit_ton')}</span></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}