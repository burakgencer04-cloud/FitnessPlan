import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fonts, getGlassCardStyle, getGlassInnerStyle } from './progressUtils.jsx';
import { InfoTooltip } from './ProgressModals.jsx';
import { useAppStore } from '@/app/store.js';

export default function PRSection({ currentWeight, isOlder, C }) {
  // 🔥 Veriyi doğrudan merkezi state'ten çek
  const personalRecordsObj = useAppStore(state => state.personalRecords || {});

  const personalRecords = useMemo(() => {
    return Object.entries(personalRecordsObj).map(([exName, data]) => ({
      exName,
      oneRM: data.e1rm,
      date: data.date,
      rawWeight: data.kg,
      rawReps: data.reps
    })).sort((a, b) => b.oneRM - a.oneRM).slice(0, 4); // En yüksek 4 E1RM'i al
  }, [personalRecordsObj]);

  return (
    <AnimatePresence>
      {personalRecords.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={getGlassCardStyle(C)}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, fontFamily: fonts.header, color: C.text }}>
              {isOlder ? "Kuvvet Kapasitem" : "Kişisel Rekorlarım (1RM)"}
            </h2>
            <InfoTooltip title="Rölatif Kuvvet" text="Maksimum 1 tekrar kaldırabileceğin tahmini ağırlık (1RM). Vücut ağırlığının kaç katını kaldırdığını gösterir." C={C} />
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {personalRecords.map((pr, idx) => {
              const relativeStrength = currentWeight ? (pr.oneRM / currentWeight).toFixed(1) : null;
              return (
                <motion.div key={idx} style={{ ...getGlassInnerStyle(C), display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, fontFamily: fonts.header, color: C.text, textTransform: "capitalize" }}>{pr.exName}</div>
                    <div style={{ fontSize: 11, color: C.mute, fontFamily: fonts.mono, fontWeight: 600, marginTop: 4 }}>{pr.date}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontFamily: fonts.mono, color: C.text, fontWeight: 900 }}>{pr.oneRM} <span style={{fontSize: 12, color: C.sub}}>kg</span></div>
                    {relativeStrength && (
                      <div style={{ fontSize: 10, color: parseFloat(relativeStrength) >= 1.5 ? C.green : C.mute, fontWeight: 800, marginTop: 4 }}>Vücut × {relativeStrength}</div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}