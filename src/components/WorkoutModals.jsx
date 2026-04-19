import React, { useState } from 'react';
import { motion } from "framer-motion";
import { fonts } from './tabTodayUtils';
import GlassModalWrapper from './GlassModalWrapper';

// ── Shared section label ────────────────────────────────────
const Label = ({ children, C }) => (
  <div style={{ fontSize: 10, color: C.mute, fontWeight: 900, letterSpacing: 2, marginBottom: 8, fontFamily: fonts.header }}>
    {children}
  </div>
);

// ── Shared close button ─────────────────────────────────────
const CloseBtn = ({ onClose, C, label = "Kapat" }) => (
  <button
    onClick={onClose}
    style={{
      width: "100%", marginTop: 20,
      background: "rgba(255,255,255,0.06)",
      border: `1px solid ${C.border}60`,
      color: C.sub, padding: "14px 0", borderRadius: 16,
      fontWeight: 800, cursor: "pointer",
      fontFamily: fonts.header, fontSize: 14,
      transition: "background 0.2s",
    }}
  >
    {label}
  </button>
);

// ═══════════════════════════════════════════════════════════
// 1. PLAKA HESAPLAYICI
// ═══════════════════════════════════════════════════════════
const PLATE_COLORS = {
  25: "#ef4444", 20: "#3b82f6", 15: "#f59e0b",
  10: "#22c55e", 5: "#8b5cf6", 2.5: "#ec4899", 1.25: "#6b7280"
};

export const PlatesModal = ({ onClose, currentMaxWeight, C }) => {
  const [targetWeight, setTargetWeight] = useState(currentMaxWeight || 60);
  const [barWeight, setBarWeight] = useState(20);

  const calculatePlates = () => {
    let remaining = (targetWeight - barWeight) / 2;
    if (remaining <= 0) return [];
    const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const result = [];
    for (let plate of plates) {
      while (remaining >= plate) { result.push(plate); remaining -= plate; }
    }
    return result;
  };

  const plates = calculatePlates();

  return (
    <GlassModalWrapper isOpen={true} onClose={onClose} maxWidth={400} C={C}>
      <div style={{ padding: "20px 24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: `${C.blue}20`, border: `1px solid ${C.blue}40`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>🧮</div>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, fontFamily: fonts.header, color: C.text }}>Plaka Hesaplayıcı</h3>
            <div style={{ fontSize: 11, color: C.mute, marginTop: 2 }}>Her taraf için gereken plakalar</div>
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "HEDEF KG", value: targetWeight, setter: setTargetWeight },
            { label: "BAR KG",   value: barWeight,    setter: setBarWeight    },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <Label C={C}>{label}</Label>
              <input
                type="number"
                value={value}
                onChange={e => setter(Number(e.target.value))}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${C.border}80`,
                  color: C.text,
                  padding: "14px 12px",
                  borderRadius: 14, textAlign: "center",
                  outline: "none",
                  fontFamily: fonts.mono, fontSize: 20, fontWeight: 900,
                }}
              />
            </div>
          ))}
        </div>

        {/* Total display */}
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "baseline",
          gap: 4, marginBottom: 16,
          padding: "12px 0",
          borderRadius: 14,
          background: `${C.green}10`,
          border: `1px solid ${C.green}25`,
        }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: C.green, fontFamily: fonts.mono }}>{targetWeight}</span>
          <span style={{ fontSize: 13, color: C.mute, fontWeight: 700 }}>KG</span>
          <span style={{ fontSize: 13, color: C.mute, margin: "0 8px" }}>·</span>
          <span style={{ fontSize: 13, color: C.sub }}>Bar: {barWeight}kg</span>
          <span style={{ fontSize: 13, color: C.mute, margin: "0 8px" }}>·</span>
          <span style={{ fontSize: 13, color: C.sub }}>Net: {Math.max(0, (targetWeight - barWeight) / 2).toFixed(2)}kg × 2</span>
        </div>

        {/* Plate display */}
        <div style={{
          background: "rgba(0,0,0,0.2)",
          padding: "20px 16px", borderRadius: 18,
          border: `1px solid ${C.border}50`,
          minHeight: 96,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexWrap: "wrap", gap: 8,
        }}>
          {targetWeight <= barWeight ? (
            <div style={{ fontSize: 13, color: C.mute, textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🏋️</div>
              Sadece bar yeterli
            </div>
          ) : plates.length > 0 ? plates.map((p, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300 }}
              style={{
                width: 48, height: 48, borderRadius: "50%",
                background: `linear-gradient(145deg, ${PLATE_COLORS[p] || C.blue}, ${PLATE_COLORS[p] || C.blue}AA)`,
                color: "#fff", fontWeight: 900, fontFamily: fonts.mono,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: p >= 10 ? 13 : 11,
                boxShadow: `0 4px 12px ${PLATE_COLORS[p] || C.blue}60`,
                border: "2px solid rgba(255,255,255,0.15)",
              }}
            >{p}</motion.div>
          )) : (
            <div style={{ fontSize: 12, color: C.mute, textAlign: "center" }}>Küsuratlı ağırlık — tam hesaplanamıyor.</div>
          )}
        </div>

        <div style={{ fontSize: 10, color: C.mute, textAlign: "center", marginTop: 10, fontWeight: 700, letterSpacing: 0.5 }}>
          * Gösterilen plakalar barın tek bir tarafı içindir
        </div>

        <CloseBtn onClose={onClose} C={C} />
      </div>
    </GlassModalWrapper>
  );
};

// ═══════════════════════════════════════════════════════════
// 2. HAREKET DEĞİŞTİRME
// ═══════════════════════════════════════════════════════════
export const SwapModal = ({ activeExerciseDetails, swapAlternatives, handleSwap, onClose, C }) => (
  <GlassModalWrapper isOpen={true} onClose={onClose} maxWidth={420} C={C}>
    <div style={{ padding: "20px 24px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: `${C.yellow}20`, border: `1px solid ${C.yellow}40`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        }}>🔄</div>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, fontFamily: fonts.header, color: C.text }}>Alternatif Hareketler</h3>
          <div style={{ fontSize: 11, color: C.mute, marginTop: 2 }}>
            <span style={{ color: C.green }}>{activeExerciseDetails.target}</span> odaklı alternatifler
          </div>
        </div>
      </div>

      <div style={{
        padding: "10px 14px", borderRadius: 14, marginBottom: 18,
        background: `${C.blue}12`, border: `1px solid ${C.blue}30`,
        fontSize: 13, color: C.sub, lineHeight: 1.4,
      }}>
        Şu an: <strong style={{ color: C.text }}>{activeExerciseDetails.name}</strong>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {swapAlternatives.length > 0 ? swapAlternatives.map((alt, i) => (
          <motion.div
            key={i}
            whileHover={{ x: 4, background: `rgba(255,255,255,0.07)` }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSwap(alt)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${C.border}60`,
              padding: "16px 18px", borderRadius: 16,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              cursor: "pointer", transition: "all 0.18s",
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.text, fontFamily: fonts.header }}>{alt.name}</div>
              {alt.target && <div style={{ fontSize: 11, color: C.mute, marginTop: 2 }}>{alt.target}</div>}
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: `${C.green}20`, border: `1px solid ${C.green}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: C.green, fontSize: 16,
            }}>→</div>
          </motion.div>
        )) : (
          <div style={{
            padding: "30px 20px", textAlign: "center",
            background: "rgba(0,0,0,0.15)", borderRadius: 16,
            border: `1px dashed ${C.border}60`,
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🤷‍♂️</div>
            <div style={{ color: C.sub, fontSize: 13, fontWeight: 700 }}>Bu kas grubu için alternatif bulunamadı.</div>
          </div>
        )}
      </div>

      <CloseBtn onClose={onClose} C={C} label="İptal" />
    </div>
  </GlassModalWrapper>
);

// ═══════════════════════════════════════════════════════════
// 3. VİDEO MODALİ
// ═══════════════════════════════════════════════════════════
export const VideoModal = ({ activeExerciseDetails, onClose, C }) => (
  <GlassModalWrapper isOpen={true} onClose={onClose} maxWidth={420} C={C}>
    <div style={{ padding: "20px 24px 28px" }}>
      <h3 style={{ margin: "0 0 4px", fontFamily: fonts.header, fontSize: 20, fontWeight: 900, color: C.text }}>
        {activeExerciseDetails.name}
      </h3>
      <div style={{ fontSize: 12, color: C.mute, marginBottom: 20 }}>Nasıl Yapılır?</div>

      <div style={{
        background: "rgba(0,0,0,0.4)",
        width: "100%", height: 200, borderRadius: 18,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        border: `1px solid ${C.border}50`,
        marginBottom: 16,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${C.blue}15, transparent 70%)`,
        }} />
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: `${C.blue}25`, border: `2px solid ${C.blue}50`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, marginBottom: 12,
          boxShadow: `0 0 24px ${C.blue}30`,
        }}>▶</div>
        <div style={{ color: C.mute, fontSize: 12, fontWeight: 700 }}>Video Oynatıcı</div>
        <div style={{ color: C.mute, fontSize: 11, marginTop: 4, opacity: 0.6 }}>API Bağlantısı Gerektirir</div>
      </div>

      <CloseBtn onClose={onClose} C={C} />
    </div>
  </GlassModalWrapper>
);

// ═══════════════════════════════════════════════════════════
// 4. ANTRENMAN ÖZETİ
// ═══════════════════════════════════════════════════════════
export const SummaryModal = ({ stats, summary, onClose, C }) => {
  const safeVolume = stats?.volume || 0;
  const title = summary?.title || "Tebrikler!";
  const desc = summary?.desc || "Antrenmanı başarıyla tamamladın.";

  return (
    <GlassModalWrapper isOpen={true} onClose={onClose} maxWidth={380} C={C}>
      <div style={{ padding: "32px 28px 36px", textAlign: "center" }}>
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          style={{ fontSize: 72, marginBottom: 20, filter: `drop-shadow(0 0 24px ${C.green}80)` }}
        >
          🏆
        </motion.div>

        <h3 style={{
          margin: "0 0 8px", fontFamily: fonts.header, fontSize: 30,
          fontStyle: "italic", fontWeight: 900, color: C.green,
          letterSpacing: "-1px",
          textShadow: `0 0 40px ${C.green}50`,
        }}>{title}</h3>

        <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.6, margin: "0 0 28px" }}>{desc}</p>

        {/* Volume stat */}
        <div style={{
          background: `linear-gradient(145deg, ${C.card}F0, rgba(0,0,0,0.2))`,
          padding: "20px 24px", borderRadius: 20,
          border: `1px solid ${C.border}60`,
          marginBottom: 28,
        }}>
          <div style={{ fontSize: 10, color: C.mute, fontWeight: 900, letterSpacing: 2, marginBottom: 8, fontFamily: fonts.header }}>
            TOPLAM HACIM
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6 }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: C.text, fontFamily: fonts.mono, letterSpacing: "-1px" }}>
              {safeVolume.toLocaleString()}
            </span>
            <span style={{ fontSize: 16, color: C.mute, fontWeight: 700 }}>KG</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
          style={{
            width: "100%",
            background: `linear-gradient(135deg, ${C.green}, ${C.green}CC)`,
            border: "none", color: "#000", padding: "17px 0", borderRadius: 18,
            fontWeight: 900, cursor: "pointer",
            fontFamily: fonts.header, fontSize: 16, letterSpacing: 0.5,
            boxShadow: `0 12px 32px ${C.green}45, inset 0 1px 0 rgba(255,255,255,0.2)`,
          }}
        >
          DEVAM ET →
        </motion.button>
      </div>
    </GlassModalWrapper>
  );
};
