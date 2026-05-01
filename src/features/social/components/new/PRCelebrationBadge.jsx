// src/features/social/components/new/PRCelebrationBadge.jsx
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { globalFonts as fonts } from '@/shared/ui/globalStyles';

const Particle = memo(({ delay, x, y, emoji }) => (
  <motion.div
    initial={{ opacity: 1, scale: 0, x: '50%', y: '100%' }}
    animate={{ opacity: 0, scale: 1.4, x: `${x}%`, y: `${y}%` }}
    transition={{ duration: 1.2, delay, ease: 'easeOut' }}
    style={{
      position: 'absolute', fontSize: 16,
      pointerEvents: 'none'
    }}
  >
    {emoji}
  </motion.div>
));

const PARTICLES = [
  { x: 20, y: 10, emoji: '⭐' }, { x: 80, y: 5, emoji: '🏆' },
  { x: 50, y: 0, emoji: '⚡' }, { x: 10, y: 30, emoji: '✨' },
  { x: 90, y: 20, emoji: '🎯' }, { x: 35, y: -10, emoji: '💥' },
];

export const PRCelebrationBadge = memo(function PRCelebrationBadge({ records, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: 'spring', damping: 18, stiffness: 300 }}
      style={{
        position: 'relative', marginBottom: 14, overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.06))',
        border: '1px solid rgba(245,158,11,0.35)',
        borderRadius: 18, padding: '16px 18px',
        cursor: 'pointer'
      }}
      onClick={onDismiss}
    >
      {/* Particle burst */}
      {PARTICLES.map((p, i) => (
        <Particle key={i} delay={i * 0.1} {...p} />
      ))}

      {/* Shimmer */}
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ repeat: Infinity, duration: 2.5, delay: 0.5, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
        <motion.div
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{ fontSize: 36 }}
        >
          🏆
        </motion.div>
        <div>
          <motion.div
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{
              fontSize: 10, color: '#f59e0b', fontWeight: 900,
              letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4
            }}
          >
            🎉 YENİ KİŞİSEL REKOR!
          </motion.div>
          <div style={{
            fontSize: 16, color: '#fff', fontWeight: 900,
            fontFamily: fonts.header, fontStyle: 'italic', letterSpacing: -0.3
          }}>
            {records.length === 1
              ? records[0].name
              : `${records.length} harekette yeni rekor!`}
          </div>
          {records.length === 1 && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>
              {records[0].w || records[0].weight} kg
              {records[0].improvement && (
                <span style={{ color: '#22c55e', marginLeft: 8 }}>
                  +{records[0].improvement} kg iyileşme 💪
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});