import React from 'react';
import { motion } from 'framer-motion';
import { globalFonts as fonts } from '@/shared/ui/globalStyles.js';

export default function DaySelector({ workouts = [], activeDay, setActiveDay, C, t }) {
  if (!workouts || workouts?.length === 0) return null;

  return (
    <div className="hide-scrollbar" style={{ 
      display: "flex", 
      gap: 12, 
      overflowX: "auto", 
      padding: "4px 4px 20px 4px", 
      marginBottom: 10,
      scrollSnapType: "x mandatory"
    }}>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      
      {workouts.map((workout, idx) => {
        const isActive = activeDay === idx;
        // Etiketi temizle: "1. Gün - Push" -> "Push"
        const displayLabel = workout.label?.includes(' - ') 
          ? workout.label.split(' - ').pop() 
          : (workout.label || "ANTRENMAN");

        return (
          <motion.div 
            key={idx} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => setActiveDay(idx)}
            style={{ 
              minWidth: 100, 
              padding: "16px 12px", 
              background: isActive ? `rgba(255,255,255,0.12)` : "rgba(0,0,0,0.3)", 
              border: `1px solid ${isActive ? (C?.green || '#22c55e') : 'rgba(255,255,255,0.06)'}`, 
              borderRadius: 24, 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center", 
              cursor: "pointer",
              opacity: isActive ? 1 : 0.6,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: isActive ? `0 10px 25px rgba(0,0,0,0.3)` : "none",
              scrollSnapAlign: "start"
            }}
          >
            <div style={{ 
              fontSize: 9, 
              fontWeight: 900, 
              color: isActive ? (C?.green || '#22c55e') : "rgba(255,255,255,0.4)", 
              letterSpacing: 1.5, 
              marginBottom: 4, 
              textTransform: "uppercase", 
              fontFamily: fonts.header 
            }}>
              {t ? t('prog_day_badge') : 'GÜN'} {idx + 1}
            </div>
            
            <div style={{ 
              fontSize: 14, 
              fontWeight: 800, 
              color: "#fff", 
              fontFamily: fonts.header, 
              textAlign: "center",
              lineHeight: 1.2,
              fontStyle: "italic"
            }}>
              {displayLabel}
            </div>

            {isActive && (
              <motion.div 
                layoutId="active-dot"
                style={{ 
                  marginTop: 8, 
                  width: 5, 
                  height: 5, 
                  borderRadius: "50%", 
                  background: C?.green || '#22c55e',
                  boxShadow: `0 0 8px ${C?.green || '#22c55e'}` 
                }} 
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}