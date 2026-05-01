// src/features/social/components/new/SkeletonCard.jsx
import React, { memo } from 'react';
import { motion } from 'framer-motion';

const Shimmer = memo(({ width = '100%', height = 14, borderRadius = 8, style = {} }) => (
  <motion.div
    animate={{ opacity: [0.4, 0.8, 0.4] }}
    transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
    style={{
      width, height,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 100%)',
      borderRadius,
      ...style
    }}
  />
));

export const SkeletonCard = memo(function SkeletonCard() {
  return (
    <div style={{
      background: 'linear-gradient(160deg, rgba(16,16,22,0.97) 0%, rgba(10,10,14,1) 100%)',
      border: '1px solid rgba(255,255,255,0.04)',
      borderRadius: 24, padding: '20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Shimmer width={46} height={46} borderRadius={23} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Shimmer width="55%" height={13} />
          <Shimmer width="35%" height={10} />
        </div>
        <Shimmer width={70} height={30} borderRadius={100} />
      </div>

      {/* Content lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <Shimmer width="95%" height={13} />
        <Shimmer width="80%" height={13} />
        <Shimmer width="65%" height={13} />
      </div>

      {/* Stats block (optional) */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 16
      }}>
        <Shimmer height={64} borderRadius={14} style={{ flex: 1 }} />
        <Shimmer height={64} borderRadius={14} style={{ flex: 1 }} />
        <Shimmer height={64} borderRadius={14} style={{ flex: 1 }} />
      </div>

      {/* Interaction bar */}
      <div style={{
        paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Shimmer width={50} height={24} borderRadius={8} />
          <Shimmer width={50} height={24} borderRadius={8} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Shimmer width={34} height={34} borderRadius={10} />
          <Shimmer width={72} height={34} borderRadius={10} />
          <Shimmer width={72} height={34} borderRadius={10} />
          <Shimmer width={34} height={34} borderRadius={10} />
        </div>
      </div>
    </div>
  );
});