import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// 🔥 Tasarım sistemi eklendi
import { globalFonts as fonts, GLASS_STYLES, LAYOUT } from '@/shared/ui/globalStyles';
import { HapticEngine } from '@/shared/lib/hapticSoundEngine';

import { StatBox, AchievementBadge, StreakDisplay } from './ProfileWidgets.jsx';

export default function UserProfileModal({ user, onClose, C, isFollowing, onToggleFollow }) {
  const [activeTab, setActiveTab] = useState('stats');

  if (!user) return null;

  const personalRecords = user.personalRecords || [];
  const achievements = user.achievements || [];
  const expertise = user.expertise || [];
  const streak = user.currentStreak || 0;
  const mutualConnections = user.mutualConnections || [];

  const TABS = [
    { id: 'stats', label: 'PROFIL' },
    { id: 'prs', label: 'REKORLAR' },
    { id: 'badges', label: 'ROZETLER' },
    { id: 'programs', label: 'PROGRAMLAR' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.97 }} transition={{ type: 'spring', damping: 30, stiffness: 280 }}
      style={{ 
        position: 'fixed', inset: 0, zIndex: 50000, display: 'flex', flexDirection: 'column', 
        overflow: 'hidden', ...GLASS_STYLES.heavy // 🔥 Arka plan efekti hafifletildi
      }}
    >
      <div style={{ position: 'relative', padding: '52px 20px 0', background: 'linear-gradient(180deg, rgba(34,197,94,0.12) 0%, transparent 100%)', borderBottom: '1px solid rgba(255,255,255,0.03)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -40, width: 240, height: 240, background: C?.green || '#22c55e', filter: 'blur(120px)', opacity: 0.15, pointerEvents: 'none', borderRadius: '50%' }} />

        <motion.button
          whileTap={{ scale: 0.88 }} onClick={onClose}
          style={{ 
            position: 'absolute', top: 52, left: 20, width: 40, height: 40, borderRadius: 14, color: '#fff', fontSize: 16, cursor: 'pointer', outline: 'none', zIndex: 2, 
            ...GLASS_STYLES.light, ...LAYOUT.flexCenter // 🔥 Buton hafifletildi
          }}
        >←</motion.button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative', zIndex: 1, paddingLeft: 52 }}>
          <motion.div animate={{ boxShadow: ['0 0 0px rgba(34,197,94,0.4)', '0 0 24px rgba(34,197,94,0.5)', '0 0 0px rgba(34,197,94,0.4)'] }} transition={{ repeat: Infinity, duration: 3 }} style={{ width: 78, height: 78, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(59,130,246,0.2))', border: `2.5px solid ${C?.green || '#22c55e'}`, ...LAYOUT.flexCenter, fontSize: 40, boxShadow: '0 10px 28px rgba(0,0,0,0.6)' }}>
            {user.avatar || '👤'}
          </motion.div>
          <div style={{ flex: 1, paddingTop: 4 }}>
            <div style={{ ...LAYOUT.flexCenter, justifyContent: 'flex-start', gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: fonts.header, letterSpacing: -0.6, fontStyle: 'italic', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{user.userName || user.name || user.firstName}</h2>
              {user.isVerified && (
                <div style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: '50%', width: 18, height: 18, ...LAYOUT.flexCenter, fontSize: 10, color: '#000', fontWeight: 900, boxShadow: '0 0 10px rgba(34,197,94,0.4)' }}>✓</div>
              )}
            </div>
            <div style={{ fontSize: 12.5, color: C?.green || '#22c55e', fontWeight: 800, marginTop: 3 }}>{user.title || 'Protokol Atleti'}</div>
            {user.bio && (<div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6, lineHeight: 1.5 }}>{user.bio}</div>)}
          </div>
        </div>

        <div style={{ ...LAYOUT.flexBetween, marginTop: 20, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: 20, flex: 1 }}>
            <div><span style={{ color: '#fff', fontWeight: 900, fontSize: 18, fontFamily: fonts.mono }}>{user.followersCount || 0}</span><span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700, marginLeft: 5 }}>Takipçi</span></div>
            <div><span style={{ color: '#fff', fontWeight: 900, fontSize: 18, fontFamily: fonts.mono }}>{user.followingCount || 0}</span><span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700, marginLeft: 5 }}>Takip</span></div>
            {streak > 0 && (<div><span style={{ fontSize: 14 }}>🔥</span><span style={{ color: '#f97316', fontWeight: 900, fontSize: 18, fontFamily: fonts.mono, marginLeft: 4 }}>{streak}</span><span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700, marginLeft: 3 }}>Seri</span></div>)}
          </div>

          <motion.button whileTap={{ scale: 0.9 }} onClick={() => { onToggleFollow(user.uid || user.id); HapticEngine?.light?.(); }} style={{ padding: '10px 22px', borderRadius: 100, fontWeight: 900, fontSize: 13, cursor: 'pointer', outline: 'none', background: isFollowing ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #22c55e, #16a34a)', border: isFollowing ? '1px solid rgba(255,255,255,0.15)' : 'none', color: isFollowing ? '#fff' : '#000', boxShadow: isFollowing ? 'none' : '0 6px 20px rgba(34,197,94,0.4)', transition: 'all 0.3s' }}>
            {isFollowing ? '✓ Takipte' : '+ Takip Et'}
          </motion.button>
        </div>

        {mutualConnections.length > 0 && (
          <div style={{ ...LAYOUT.flexCenter, justifyContent: 'flex-start', gap: 8, marginTop: 14, padding: '8px 12px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 12, backdropFilter: 'blur(8px)' }}>
            <div style={{ display: 'flex', gap: -6 }}>
              {mutualConnections.slice(0, 3).map((u, i) => (<span key={i} style={{ fontSize: 18, marginLeft: i > 0 ? -6 : 0, position: 'relative', zIndex: 3 - i }}>{u.avatar || '👤'}</span>))}
            </div>
            <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}><span style={{ color: '#22c55e', fontWeight: 800 }}>{mutualConnections[0]?.name}</span>{mutualConnections.length > 1 && ` ve ${mutualConnections.length - 1} kişi`} takip ediyor</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 0, marginTop: 28, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); HapticEngine?.light?.(); }} style={{ flex: 1, padding: '12px 0', background: 'transparent', border: 'none', borderBottom: activeTab === tab.id ? `2.5px solid ${C?.green || '#22c55e'}` : '2.5px solid transparent', color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: 900, fontSize: 10.5, fontFamily: fonts.header, letterSpacing: 0.5, cursor: 'pointer', transition: '0.2s ease', outline: 'none', textShadow: activeTab === tab.id ? `0 0 10px ${C?.green || '#22c55e'}40` : 'none' }}>{tab.label}</button>
          ))}
        </div>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '20px 18px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ ...LAYOUT.colGap10 }}>
              <StreakDisplay streak={streak} />
              
              <div style={{ ...GLASS_STYLES.card, padding: 18, ...LAYOUT.flexBetween }}>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Protokol Güç Skoru</div>
                  <div style={{ fontSize: 36, color: C?.green || '#22c55e', fontWeight: 900, fontFamily: fonts.mono, lineHeight: 1, textShadow: `0 0 20px ${C?.green || '#22c55e'}60` }}>{user.powerScore || '—'}<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>/100</span></div>
                </div>
                <div style={{ fontSize: 44, opacity: 0.8, filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.2))' }}>⚡</div>
              </div>

              {(user.totalVolume || user.totalWorkouts || user.avgSessionDuration) && (
                <div style={{ display: 'flex', gap: 10 }}>
                  {user.totalVolume && <StatBox label="Toplam Hacim" value={(user.totalVolume / 1000).toFixed(1)} unit="t" color="#22c55e" />}
                  {user.totalWorkouts && <StatBox label="Toplam İdman" value={user.totalWorkouts} color="#3b82f6" />}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'prs' && (
            <motion.div key="prs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ ...LAYOUT.colGap10 }}>
              {personalRecords.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 700 }}>Henüz kırılmış rekor yok</div>
                </div>
              ) : (
                personalRecords.map((pr, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))', backdropFilter: 'blur(10px)', borderLeft: '3px solid #f59e0b', borderTop: '1px solid rgba(245,158,11,0.1)', borderBottom: '1px solid rgba(245,158,11,0.1)', borderRight: '1px solid rgba(245,158,11,0.1)', borderRadius: '0 16px 16px 0', padding: '15px 18px', ...LAYOUT.flexBetween }}>
                    <div>
                      <div style={{ fontSize: 14.5, color: '#fff', fontWeight: 800 }}>{pr.name}</div>
                      <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', marginTop: 3, fontWeight: 700 }}>Kişisel En İyi · {pr.date || 'Tarih yok'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 26, color: '#f59e0b', fontWeight: 900, fontFamily: fonts.mono, letterSpacing: -1, textShadow: '0 0 15px rgba(245,158,11,0.3)' }}>{pr.w || pr.weight}<span style={{ fontSize: 13, color: 'rgba(245,158,11,0.6)', fontWeight: 600 }}> kg</span></div>
                      {pr.improvement && (<div style={{ fontSize: 10.5, color: '#22c55e', fontWeight: 800, marginTop: 2 }}>↑ {pr.improvement} kg iyileşme</div>)}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'badges' && (
            <motion.div key="badges" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ ...LAYOUT.colGap10 }}>
              {achievements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🏅</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 700 }}>Henüz rozet kazanılmadı</div>
                </div>
              ) : (
                achievements.map((badge, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}>
                    <AchievementBadge badge={badge} />
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'programs' && (
            <motion.div key="programs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ ...LAYOUT.colGap10 }}>
              <div style={{ ...GLASS_STYLES.card, padding: 18 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>🏋️‍♂️ Aktif Antrenman Programı</div>
                {user.activeWorkoutPlan ? (
                  <div>
                    <div style={{ fontSize: 18, color: '#fff', fontWeight: 900, fontFamily: fonts.header, fontStyle: 'italic' }}>{user.activeWorkoutPlan.name}</div>
                    <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 800, marginTop: 5 }}>{user.activeWorkoutPlan.phase} · {user.activeWorkoutPlan.daysCount} Günlük Döngü</div>
                  </div>
                ) : (<div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontStyle: 'italic' }}>Belirli bir program uygulamıyor</div>)}
              </div>

              <div style={{ ...GLASS_STYLES.card, padding: 18 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>🥑 Aktif Beslenme Profili</div>
                {user.activeNutritionPlan ? (
                  <div>
                    <div style={{ fontSize: 18, color: '#fff', fontWeight: 900, fontFamily: fonts.header, fontStyle: 'italic' }}>{user.activeNutritionPlan.dietType}</div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                      <div><span style={{ color: '#fff', fontWeight: 900 }}>{user.activeNutritionPlan.calories}</span><span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginLeft: 3 }}>kcal</span></div>
                      <div><span style={{ color: '#fff', fontWeight: 900 }}>{user.activeNutritionPlan.protein}g</span><span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginLeft: 3 }}>Pro</span></div>
                    </div>
                  </div>
                ) : (<div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontStyle: 'italic' }}>Beslenme verisi gizli</div>)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}