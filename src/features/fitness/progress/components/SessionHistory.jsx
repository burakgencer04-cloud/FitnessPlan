import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { get as idbGet } from 'idb-keyval';
import { globalFonts as fonts, getGlobalGlassInnerStyle as getGlassInnerStyle } from '@/shared/ui/globalStyles.js';

export default function SessionHistory({ C }) {
  const [history, setHistory] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    idbGet('workout_history').then(data => {
      if (data) setHistory(data);
    });
  }, []);

  if (history.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ margin: "0 0 16px 10px", fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: fonts.header }}>Antrenman Günlüğü</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {history.map((session) => (
          <div key={session.id} style={{ ...getGlassInnerStyle(C), padding: 0, overflow: "hidden" }}>
            <div 
              onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
              style={{ padding: "16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div>
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 800, fontFamily: fonts.mono }}>{session.date} • {session.duration}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: fonts.header }}>{session.workoutName}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.yellow, fontFamily: fonts.mono }}>{(session.totalVolume / 1000).toFixed(1)}t</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 800 }}>TOPLAM HACİM</div>
              </div>
            </div>

            <AnimatePresence>
              {expandedId === session.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} style={{ overflow: "hidden", background: "rgba(0,0,0,0.2)" }}>
                  <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    {session.exercises && session.exercises.map((ex, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8, borderBottom: "1px dashed rgba(255,255,255,0.05)", paddingBottom: 4 }}>
                        <span style={{ color: "rgba(255,255,255,0.7)" }}>{ex.name}</span>
                        <span style={{ fontWeight: 800, color: "#fff", fontFamily: fonts.mono }}>{ex.sets} Set • {ex.maxWeight}kg</span>
                      </div>
                    ))}
                    {session.notes && (
                      <div style={{ marginTop: 12, padding: 10, background: "rgba(255,255,255,0.03)", borderRadius: 8, fontSize: 12, fontStyle: "italic", color: C.sub }}>
                        " {session.notes} "
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}