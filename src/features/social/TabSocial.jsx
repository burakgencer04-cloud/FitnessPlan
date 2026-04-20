import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const fonts = { header: "'Comucan', system-ui, sans-serif", body: "'Comucan', system-ui, sans-serif", mono: "monospace" };

// 🌟 PREMIUM CAM TASARIMI
const getGlassCardStyle = (C) => ({
  background: `linear-gradient(145deg, rgba(30, 30, 35, 0.6), rgba(15, 15, 20, 0.8))`,
  backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
  border: `1px solid rgba(255, 255, 255, 0.06)`,
  boxShadow: "0 15px 35px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
  borderRadius: 28, padding: "24px", marginBottom: 20, position: "relative", overflow: "hidden"
});

export default function TabSocial({ themeColors: C }) {
  const [activeTab, setActiveTab] = useState("feed");

  // Geçici (Mock) Veriler - Firestore bağlandığında bunlar buluttan gelecek
  const mockFeed = [
    { id: 1, user: "Kaptan Demir", avatar: "🧔", workout: "İtme (Göğüs/Omuz/Arka Kol)", volume: 12.4, pr: "Bench Press: 100kg", time: "2 saat önce" },
    { id: 2, user: "Gece Kartalı", avatar: "🥷", workout: "Full Body Yıkım", volume: 18.2, pr: "Squat: 140kg", time: "5 saat önce" },
    { id: 3, user: "Demir Yumruk", avatar: "🦾", workout: "Sırt & Biceps", volume: 9.8, pr: null, time: "1 gün önce" }
  ];

  const mockLeaderboard = [
    { rank: 1, user: "Kaptan Demir", score: "84,500 kg", streak: "42 Gün" },
    { rank: 2, user: "Titan_99", score: "78,200 kg", streak: "18 Gün" },
    { rank: 3, user: "Gece Kartalı", score: "71,000 kg", streak: "21 Gün" },
    { rank: 4, user: "Sen (Mevcut)", score: "45,300 kg", streak: "12 Gün" },
  ];

  return (
    <div style={{ paddingBottom: 110, color: C.text, fontFamily: fonts.body, position: "relative" }}>
      
      {/* 🌌 AMBIENT ARKA PLAN */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }} transition={{ duration: 10, repeat: Infinity }} style={{ position: 'absolute', top: '0%', left: '-10%', width: '70vw', height: '70vw', background: `radial-gradient(circle, ${C.yellow}30 0%, transparent 60%)`, filter: 'blur(80px)' }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 24, padding: "0 8px" }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", margin: 0, letterSpacing: -1, display: "flex", alignItems: "center", gap: 10 }}>
            Taverna <span style={{ fontSize: 26 }}>🍻</span>
          </h2>
          <p style={{ color: C.sub, fontSize: 13, marginTop: 4, fontWeight: 600 }}>Diğer savaşçıların rekorlarını gör ve onlarla yarış.</p>
        </div>

        {/* SEKMELER */}
        <div style={{ display: 'flex', background: "rgba(0,0,0,0.3)", backdropFilter: "blur(20px)", borderRadius: 100, padding: 6, marginBottom: 24, border: `1px solid rgba(255,255,255,0.05)` }}>
          <button onClick={() => setActiveTab("feed")} style={{ flex: 1, padding: "12px", borderRadius: 100, border: "none", background: activeTab === "feed" ? "#fff" : "transparent", color: activeTab === "feed" ? "#000" : "rgba(255,255,255,0.5)", fontWeight: 800, cursor: "pointer", transition: "0.3s", boxShadow: activeTab === "feed" ? "0 4px 15px rgba(255,255,255,0.2)" : "none" }}>🌐 Canlı Akış</button>
          <button onClick={() => setActiveTab("leaderboard")} style={{ flex: 1, padding: "12px", borderRadius: 100, border: "none", background: activeTab === "leaderboard" ? "#fff" : "transparent", color: activeTab === "leaderboard" ? "#000" : "rgba(255,255,255,0.5)", fontWeight: 800, cursor: "pointer", transition: "0.3s", boxShadow: activeTab === "leaderboard" ? "0 4px 15px rgba(255,255,255,0.2)" : "none" }}>🏆 Liderlik Tablosu</button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "feed" ? (
            <motion.div key="feed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {mockFeed.map(post => (
                <div key={post.id} style={getGlassCardStyle(C)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ fontSize: 24, background: "rgba(255,255,255,0.05)", width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid rgba(255,255,255,0.1)` }}>{post.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>{post.user}</div>
                        <div style={{ fontSize: 11, color: C.mute, fontWeight: 600 }}>{post.time}</div>
                      </div>
                    </div>
                    <button style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}>🔥</button>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 16, border: `1px solid rgba(255,255,255,0.03)` }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: C.green, marginBottom: 8 }}>{post.workout}</div>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div><span style={{ fontSize: 11, color: C.sub, fontWeight: 800 }}>TONAJ:</span> <span style={{ fontSize: 14, fontWeight: 900, fontFamily: fonts.mono, color: "#fff" }}>{post.volume}t</span></div>
                      {post.pr && <div><span style={{ fontSize: 11, color: C.yellow, fontWeight: 800 }}>YENİ PR:</span> <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{post.pr}</span></div>}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="leaderboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={getGlassCardStyle(C)}>
                <div style={{ fontSize: 12, color: C.sub, fontWeight: 900, letterSpacing: 1.5, marginBottom: 20, textAlign: "center" }}>AYLIK HACİM (TONAJ) LİGİ</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {mockLeaderboard.map(board => {
                    const isMe = board.rank === 4;
                    const glow = board.rank === 1 ? C.yellow : board.rank === 2 ? "#94a3b8" : board.rank === 3 ? "#b45309" : "transparent";
                    return (
                      <div key={board.rank} style={{ display: "flex", alignItems: "center", padding: "16px", background: isMe ? `rgba(46, 204, 113, 0.15)` : "rgba(0,0,0,0.3)", borderRadius: 20, border: `1px solid ${isMe ? C.green : 'rgba(255,255,255,0.05)'}`, boxShadow: board.rank === 1 ? `0 0 20px ${C.yellow}40` : "none" }}>
                        <div style={{ width: 30, fontSize: 18, fontWeight: 900, color: glow, filter: `drop-shadow(0 0 5px ${glow})` }}>#{board.rank}</div>
                        <div style={{ flex: 1, fontWeight: 800, fontSize: 15, color: isMe ? C.green : "#fff", marginLeft: 10 }}>{board.user}</div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 14, fontWeight: 900, fontFamily: fonts.mono, color: "#fff" }}>{board.score}</div>
                          <div style={{ fontSize: 10, color: C.sub, fontWeight: 800 }}>🔥 {board.streak}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}