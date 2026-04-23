import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { get as idbGet } from 'idb-keyval';
import { globalFonts as fonts, getGlassInnerStyle } from '@/shared/ui/globalStyles.js';

export default function SessionHistory({ C }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const glassInnerStyle = getGlassInnerStyle(C);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await idbGet('workout_history');
        if (data) setSessions(data);
      } catch (error) {
        console.error("Geçmiş okunamadı:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", color: C.mute, padding: 20 }}>Geçmiş yükleniyor...</div>;
  }

  if (sessions.length === 0) {
    return null; // Hiç idman yoksa bu bölümü hiç gösterme
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 24 }}>
      <h2 style={{ margin: "0 0 16px 8px", fontSize: 16, fontWeight: 800, fontFamily: fonts.header, color: C.sub, letterSpacing: 0.5, textTransform: "uppercase" }}>
        Antrenman Geçmişi 📓
      </h2>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {sessions.map((session) => (
          <div key={session.id} style={{ ...glassInnerStyle, padding: "20px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: C.text, fontFamily: fonts.header, marginBottom: 4 }}>
                  {session.workoutName || "Özel Antrenman"}
                </div>
                <div style={{ fontSize: 11, color: C.mute, fontWeight: 600, display: "flex", gap: 12 }}>
                  <span>📅 {session.date}</span>
                  <span>⏱️ {session.duration} dk</span>
                  {session.calories && <span>🔥 {session.calories} kcal</span>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.yellow, fontFamily: fonts.mono }}>
                  {(session.totalVolume / 1000).toFixed(1)} <span style={{ fontSize: 10, color: C.mute }}>ton</span>
                </div>
              </div>
            </div>

            {/* Hareketler ve Set Detayları */}
            {session.exercises && session.exercises.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12, borderTop: `1px dashed ${C.border}40`, paddingTop: 12 }}>
                {session.exercises.map((ex, i) => {
                  // İlgili harekete ait tamamlanmış setleri buluyoruz
                  const exSets = Object.keys(session.allSets || {})
                    .filter(key => key.startsWith(`${i}-`))
                    .map(key => session.allSets[key]);

                  return (
                    <div key={i} style={{ background: "rgba(0,0,0,0.2)", padding: 12, borderRadius: 12, border: `1px solid ${C.border}20` }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: C.text, marginBottom: 6 }}>{ex.name}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {exSets.map((s, idx) => s.done && s.t !== 'W' && (
                          <span key={idx} style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}40`, padding: "4px 8px", borderRadius: 6, color: C.sub, fontFamily: fonts.mono }}>
                            {s.w}kg × {s.r}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {session.notes && (
              <div style={{ marginTop: 16, padding: 12, background: `${C.blue}15`, borderRadius: 8, borderLeft: `3px solid ${C.blue}`, fontSize: 12, color: C.sub, fontStyle: "italic" }}>
                "{session.notes}"
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}