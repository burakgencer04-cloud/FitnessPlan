import React, { memo } from 'react';
import { motion } from 'framer-motion';

// 🔥 Tasarım sistemimizi içeri alıyoruz
import { globalFonts as fonts, GLASS_STYLES, LAYOUT } from '@/shared/ui/globalStyles';

export const ACHIEVEMENT_ICONS = {
  streak_7: '🔥', streak_30: '⚡', streak_100: '💎',
  first_pr: '🏆', volume_10t: '💪', social_butterfly: '🤝', early_bird: '🌅',
};

// 🔥 ELITE V2: StatBox (Artık inline obje üretmiyor, ortak GLASS_STYLES.card okuyor)
export const StatBox = memo(({ label, value, unit, color }) => (
  <div style={{
    ...GLASS_STYLES.card, // 10 satırlık cam efekti tek satırda!
    ...LAYOUT.colGap4,
    padding: '14px 16px', flex: 1, transition: 'transform 0.2s ease',
  }}>
    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </div>
    <div style={{ fontSize: 22, fontWeight: 900, color: color || '#fff', fontFamily: fonts.mono, letterSpacing: -1 }}>
      {value}<span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600, marginLeft: 2 }}>{unit}</span>
    </div>
  </div>
));

// 🔥 ELITE V2: Badge Premium Glassmorphism
export const AchievementBadge = memo(({ badge }) => (
  <motion.div whileHover={{ scale: 1.05, y: -2 }} style={{
    ...GLASS_STYLES.light, // Hafif cam efekti
    padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10
  }}>
    <div style={{
      ...LAYOUT.flexCenter,
      width: 38, height: 38, borderRadius: 12, flexShrink: 0,
      background: `rgba(34,197,94,0.15)`, border: '1px solid rgba(34,197,94,0.25)',
      fontSize: 20, boxShadow: 'inset 0 0 10px rgba(34,197,94,0.1)'
    }}>
      {ACHIEVEMENT_ICONS[badge.type] || '🏅'}
    </div>
    <div>
      <div style={{ fontSize: 12, fontWeight: 900, color: '#fff' }}>{badge.name}</div>
      <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{badge.desc}</div>
    </div>
  </motion.div>
));

export const StreakDisplay = memo(({ streak }) => {
  if (!streak || streak < 1) return null;
  const level = streak >= 100 ? 'diamond' : streak >= 30 ? 'fire' : 'starter';
  const colors = { diamond: '#60a5fa', fire: '#f97316', starter: '#22c55e' };
  const emojis = { diamond: '💎', fire: '🔥', starter: '🌱' };

  return (
    <motion.div
      animate={{ boxShadow: [`0 0 0px ${colors[level]}40`, `0 0 24px ${colors[level]}50`, `0 0 0px ${colors[level]}40`] }}
      transition={{ repeat: Infinity, duration: 2.5 }}
      style={{
        background: `linear-gradient(135deg, ${colors[level]}15, ${colors[level]}05)`,
        backdropFilter: 'blur(12px)', border: `1px solid ${colors[level]}35`,
        borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14
      }}
    >
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.8 }} style={{ fontSize: 36, filter: `drop-shadow(0 0 10px ${colors[level]}80)` }}>
        {emojis[level]}
      </motion.div>
      <div>
        <div style={{ fontSize: 10, color: colors[level], fontWeight: 900, letterSpacing: 1 }}>
          {level === 'diamond' ? 'ELİT SERİ' : level === 'fire' ? 'ATEŞ SERİSİ' : 'BAŞLANGIÇ SERİSİ'}
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: fonts.mono, letterSpacing: -1, lineHeight: 1.2 }}>
          {streak}<span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}> gün</span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
          Kesintisiz antrenman serisi
        </div>
      </div>
    </motion.div>
  );
});