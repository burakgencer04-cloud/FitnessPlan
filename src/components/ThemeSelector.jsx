import React from 'react';
import { motion } from 'framer-motion';
import { fonts } from './tabTodayUtils';

const THEME_LABELS = {
  midnight: "Siyah",
  iron:     "Demir",
  cyberpunk:"Siber",
  mocha:    "Kahve",
  forest:   "Orman",
};

export default function ThemeSelector({ C, activeThemeId, onSelect, themes }) {
  if (!themes) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
      {Object.values(themes).map((theme) => {
        const isActive = activeThemeId === theme.id;
        return (
          <motion.div
            key={theme.id}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onSelect(theme.id)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          >
            {/* Color circle */}
            <div style={{
              width: 52, height: 52, borderRadius: '50%', position: 'relative',
              background: `linear-gradient(145deg, ${theme.card}, ${theme.bg})`,
              border: `2px solid ${isActive ? theme.green : 'rgba(255,255,255,0.08)'}`,
              boxShadow: isActive
                ? `0 0 0 3px ${theme.green}30, 0 6px 20px ${theme.green}25`
                : '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'all 0.25s ease',
            }}>
              {/* Inner accent dot */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 22, height: 22, borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.green}, ${theme.blue})`,
                boxShadow: `0 0 10px ${theme.green}60`,
              }} />

              {/* Active checkmark */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{
                    position: 'absolute', top: -4, right: -4,
                    background: theme.green, color: '#000',
                    width: 18, height: 18, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 900,
                    boxShadow: `0 2px 8px ${theme.green}60`,
                  }}
                >✓</motion.div>
              )}
            </div>

            {/* Label */}
            <span style={{
              fontSize: 9, fontWeight: 900,
              color: isActive ? C.text : C.mute,
              textTransform: 'uppercase', letterSpacing: 1,
              fontFamily: fonts.header,
              transition: 'color 0.2s',
            }}>
              {THEME_LABELS[theme.id] || theme.id}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
