// src/features/social/components/new/LeaderboardView.jsx
import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { globalFonts as fonts } from '@/shared/ui/globalStyles';
import { getLeaderboardData, getRivalData } from '@/entities/social/api/socialRepo.js';

const TABS = [
  { id: 'active', label: 'En Aktif', emoji: '⚡' },
  { id: 'volume', label: 'En Yüksek Hacim', emoji: '🏋️' },
  { id: 'prs', label: 'En Çok PR', emoji: '🏆' },
  { id: 'streak', label: 'En Uzun Seri', emoji: '🔥' },
];

// Mock data - Firebase'den gelecek
const MOCK_DATA = {
  active: [
    { rank: 1, name: 'Ahmet K.', avatar: '🦁', value: 7, unit: 'idman', change: '+2', uid: 'u1' },
    { rank: 2, name: 'Zeynep T.', avatar: '🐯', value: 6, unit: 'idman', change: '=', uid: 'u2' },
    { rank: 3, name: 'Mert A.', avatar: '🐻', value: 5, unit: 'idman', change: '-1', uid: 'u3' },
    { rank: 4, name: 'Selin B.', avatar: '🦊', value: 4, unit: 'idman', change: '+1', uid: 'u4' },
    { rank: 5, name: 'Burak Y.', avatar: '🐼', value: 4, unit: 'idman', change: '=', uid: 'u5' },
  ],
  volume: [
    { rank: 1, name: 'Mert A.', avatar: '🐻', value: '18.4t', unit: '', change: '+3', uid: 'u3' },
    { rank: 2, name: 'Ahmet K.', avatar: '🦁', value: '15.2t', unit: '', change: '-1', uid: 'u1' },
    { rank: 3, name: 'Burak Y.', avatar: '🐼', value: '12.8t', unit: '', change: '+1', uid: 'u5' },
    { rank: 4, name: 'Zeynep T.', avatar: '🐯', value: '11.1t', unit: '', change: '=', uid: 'u2' },
    { rank: 5, name: 'Selin B.', avatar: '🦊', value: '9.7t', unit: '', change: '-1', uid: 'u4' },
  ],
  prs: [
    { rank: 1, name: 'Zeynep T.', avatar: '🐯', value: 5, unit: 'PR', change: '+2', uid: 'u2' },
    { rank: 2, name: 'Ahmet K.', avatar: '🦁', value: 3, unit: 'PR', change: '=', uid: 'u1' },
    { rank: 3, name: 'Selin B.', avatar: '🦊', value: 2, unit: 'PR', change: '+1', uid: 'u4' },
    { rank: 4, name: 'Mert A.', avatar: '🐻', value: 1, unit: 'PR', change: '=', uid: 'u3' },
    { rank: 5, name: 'Burak Y.', avatar: '🐼', value: 1, unit: 'PR', change: '-2', uid: 'u5' },
  ],
  streak: [
    { rank: 1, name: 'Selin B.', avatar: '🦊', value: 42, unit: 'gün', change: '+1', uid: 'u4' },
    { rank: 2, name: 'Ahmet K.', avatar: '🦁', value: 28, unit: 'gün', change: '+1', uid: 'u1' },
    { rank: 3, name: 'Burak Y.', avatar: '🐼', value: 21, unit: 'gün', change: '+1', uid: 'u5' },
    { rank: 4, name: 'Zeynep T.', avatar: '🐯', value: 14, unit: 'gün', change: '-3', uid: 'u2' },
    { rank: 5, name: 'Mert A.', avatar: '🐻', value: 7, unit: 'gün', change: '+7', uid: 'u3' },
  ],
};

const RANK_STYLES = [
  { bg: 'linear-gradient(135deg, #f59e0b30, #f59e0b10)', border: '#f59e0b40', color: '#f59e0b', medal: '🥇' },
  { bg: 'linear-gradient(135deg, rgba(148,163,184,0.15), rgba(148,163,184,0.05))', border: 'rgba(148,163,184,0.3)', color: '#94a3b8', medal: '🥈' },
  { bg: 'linear-gradient(135deg, rgba(205,127,50,0.15), rgba(205,127,50,0.05))', border: 'rgba(205,127,50,0.3)', color: '#cd7f32', medal: '🥉' },
];

const getChangeColor = (change) => {
  if (change.startsWith('+')) return '#22c55e';
  if (change.startsWith('-')) return '#ef4444';
  return 'rgba(255,255,255,0.3)';
};

const LeaderRow = memo(({ entry, index }) => {
  const isTop3 = index < 3;
  const style = RANK_STYLES[index] || null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', damping: 24 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', borderRadius: 18,
        background: isTop3 ? style.bg : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isTop3 ? style.border : 'rgba(255,255,255,0.04)'}`,
        marginBottom: 8
      }}
    >
      {/* Rank */}
      <div style={{
        width: 30, textAlign: 'center', flexShrink: 0,
        fontSize: isTop3 ? 20 : 14,
        color: isTop3 ? style.color : 'rgba(255,255,255,0.3)',
        fontWeight: 900, fontFamily: fonts.mono
      }}>
        {isTop3 ? style.medal : entry.rank}
      </div>

      {/* Avatar */}
      <div style={{
        width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
        background: isTop3
          ? `linear-gradient(135deg, ${style.color}30, ${style.color}10)`
          : 'rgba(255,255,255,0.06)',
        border: `1.5px solid ${isTop3 ? style.color + '50' : 'rgba(255,255,255,0.07)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22
      }}>
        {entry.avatar}
      </div>

      {/* Name */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 14.5, fontWeight: 900, color: '#fff',
          fontFamily: fonts.header, fontStyle: 'italic'
        }}>
          {entry.name}
        </div>
        <div style={{
          fontSize: 10.5, color: getChangeColor(entry.change), fontWeight: 800,
          marginTop: 2
        }}>
          {entry.change === '=' ? '— Değişim yok' : entry.change + ' sıra'}
        </div>
      </div>

      {/* Value */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontSize: 18, fontWeight: 900, color: isTop3 ? style.color : '#fff',
          fontFamily: fonts.mono, letterSpacing: -0.5
        }}>
          {entry.value}
        </div>
        {entry.unit && (
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>
            {entry.unit}
          </div>
        )}
      </div>
    </motion.div>
  );
});

export function LeaderboardView() {
  const [activeTab, setActiveTab] = useState('active');
  const data = MOCK_DATA[activeTab] || [];

  return (
    <div style={{ paddingBottom: 20 }}>
      {/* Header */}
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 900, letterSpacing: 1.5, marginBottom: 6 }}>
          HAFTANın SIRALAMASI
        </div>
        <h2 style={{
          fontSize: 24, fontWeight: 900, color: '#fff',
          fontFamily: fonts.header, fontStyle: 'italic',
          letterSpacing: -0.5, margin: 0
        }}>
          Kim Daha Güçlü?
        </h2>
      </div>

      {/* Tab Selector */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 20,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, padding: 4
      }}>
        {TABS.map(tab => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '9px 0',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #22c55e22, #22c55e10)'
                : 'transparent',
              border: activeTab === tab.id
                ? '1px solid rgba(34,197,94,0.25)'
                : '1px solid transparent',
              borderRadius: 12,
              color: activeTab === tab.id ? '#22c55e' : 'rgba(255,255,255,0.4)',
              fontWeight: 800, fontSize: 11, cursor: 'pointer', outline: 'none',
              transition: 'all 0.2s',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2
            }}
          >
            <span style={{ fontSize: 16 }}>{tab.emoji}</span>
            <span style={{ fontSize: 9, letterSpacing: 0.3 }}>{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Leaderboard */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}
        >
          {data.map((entry, i) => (
            <LeaderRow key={entry.uid} entry={entry} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* My Rank Placeholder */}
      <div style={{
        marginTop: 16, padding: '14px 16px',
        background: 'rgba(34,197,94,0.07)',
        border: '1px solid rgba(34,197,94,0.2)',
        borderRadius: 18, textAlign: 'center'
      }}>
        <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 900, marginBottom: 4 }}>
          SENİN SIRALAMANIN
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>
          #—
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
          Daha fazla antrenman yap ve sıralamaya gir!
        </div>
      </div>
    </div>
  );
}