// src/features/social/components/new/ChallengeCard.jsx
import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { globalFonts as fonts } from '@/shared/ui/globalStyles';

const WEEKLY_CHALLENGE = {
  id: 'wk_vol_10t',
  title: 'Bu Hafta 10 Ton Hacim',
  desc: 'Toplam antrenman hacmini 10.000 kg\'ı geç',
  emoji: '🏋️‍♂️',
  color: '#22c55e',
  type: 'weekly',
  currentValue: 6200,
  targetValue: 10000,
  unit: 'kg',
  participants: 247,
  endsInHours: 38,
};

const MONTHLY_CHALLENGE = {
  id: 'mo_streak_20',
  title: '20 Günlük Seri',
  desc: 'Bu ay 20 gün kesintisiz antrenman yap',
  emoji: '🔥',
  color: '#f97316',
  type: 'monthly',
  currentValue: 12,
  targetValue: 20,
  unit: 'gün',
  participants: 89,
  endsInHours: 312,
};

const ProgressBar = memo(({ value, max, color }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{
      height: 8, background: 'rgba(255,255,255,0.07)',
      borderRadius: 100, overflow: 'hidden'
    }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        style={{
          height: '100%', borderRadius: 100,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          boxShadow: `0 0 8px ${color}60`,
          position: 'relative', overflow: 'hidden'
        }}
      >
        <motion.div
          animate={{ x: ['0%', '100%'] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            width: '40%'
          }}
        />
      </motion.div>
    </div>
  );
});

const ChallengeItem = memo(({ challenge, joined, onJoin }) => {
  const pct = Math.min(100, Math.round((challenge.currentValue / challenge.targetValue) * 100));
  const timeLabel = challenge.endsInHours > 48
    ? `${Math.round(challenge.endsInHours / 24)} gün kaldı`
    : `${challenge.endsInHours}s kaldı`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: `linear-gradient(145deg, ${challenge.color}12, ${challenge.color}04)`,
        border: `1px solid ${challenge.color}30`,
        borderRadius: 18, padding: '16px 18px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14, flexShrink: 0,
          background: `${challenge.color}20`,
          border: `1px solid ${challenge.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22
        }}>
          {challenge.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              fontSize: 9, color: challenge.color, fontWeight: 900,
              letterSpacing: 1, textTransform: 'uppercase',
              background: `${challenge.color}18`,
              padding: '2px 7px', borderRadius: 100
            }}>
              {challenge.type === 'weekly' ? 'HAFTALIK' : 'AYLIK'} GÖREV
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 700 }}>
              {timeLabel}
            </div>
          </div>
          <div style={{
            fontSize: 15, fontWeight: 900, color: '#fff',
            fontFamily: fonts.header, fontStyle: 'italic',
            marginTop: 4, letterSpacing: -0.3
          }}>
            {challenge.title}
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>
            {challenge.desc}
          </div>
        </div>
      </div>

      {/* Progress */}
      <ProgressBar value={challenge.currentValue} max={challenge.targetValue} color={challenge.color} />
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginTop: 8
      }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
          <span style={{ color: challenge.color, fontWeight: 900, fontSize: 14 }}>
            {challenge.currentValue.toLocaleString()}
          </span>
          {' '}/{' '}{challenge.targetValue.toLocaleString()} {challenge.unit}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
          👥 {challenge.participants} katılımcı
        </div>
      </div>

      {/* Join Button */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => onJoin(challenge.id)}
        style={{
          marginTop: 14, width: '100%',
          background: joined
            ? 'rgba(255,255,255,0.06)'
            : `linear-gradient(135deg, ${challenge.color}, ${challenge.color}cc)`,
          border: joined ? '1px solid rgba(255,255,255,0.08)' : 'none',
          borderRadius: 12, padding: '11px',
          color: joined ? 'rgba(255,255,255,0.6)' : '#000',
          fontSize: 13, fontWeight: 900, cursor: 'pointer', outline: 'none',
          boxShadow: joined ? 'none' : `0 6px 18px ${challenge.color}40`
        }}
      >
        {joined ? '✓ Katıldın' : `${challenge.emoji} Göreve Katıl`}
      </motion.button>
    </motion.div>
  );
});

export const ChallengeCard = memo(function ChallengeCard({ compact }) {
  const [joined, setJoined] = useState({});
  const [expanded, setExpanded] = useState(false);

  const handleJoin = (id) => {
    setJoined(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (compact) {
    return (
      <div style={{ marginBottom: 16 }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setExpanded(p => !p)}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.04))',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 16, padding: '13px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', outline: 'none'
          }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            style={{ fontSize: 22 }}
          >
            🏆
          </motion.div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 900, letterSpacing: 0.5 }}>
              HAFTANın GÖREVİ
            </div>
            <div style={{ fontSize: 13.5, color: '#fff', fontWeight: 800, marginTop: 2 }}>
              {WEEKLY_CHALLENGE.title}
            </div>
          </div>
          <div style={{
            fontSize: 12, color: '#22c55e', fontWeight: 900,
            background: 'rgba(34,197,94,0.1)',
            padding: '4px 10px', borderRadius: 100
          }}>
            {Math.round((WEEKLY_CHALLENGE.currentValue / WEEKLY_CHALLENGE.targetValue) * 100)}%
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}
          >▾</motion.div>
        </motion.button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden', marginTop: 10 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <ChallengeItem challenge={WEEKLY_CHALLENGE} joined={joined[WEEKLY_CHALLENGE.id]} onJoin={handleJoin} />
                <ChallengeItem challenge={MONTHLY_CHALLENGE} joined={joined[MONTHLY_CHALLENGE.id]} onJoin={handleJoin} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <ChallengeItem challenge={WEEKLY_CHALLENGE} joined={joined[WEEKLY_CHALLENGE.id]} onJoin={handleJoin} />
      <ChallengeItem challenge={MONTHLY_CHALLENGE} joined={joined[MONTHLY_CHALLENGE.id]} onJoin={handleJoin} />
    </div>
  );
});