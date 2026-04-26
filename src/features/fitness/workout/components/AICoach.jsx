import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const fonts = {
  header: "'Comucan', system-ui, sans-serif",
  body: "'Comucan', system-ui, sans-serif",
  mono: "monospace",
};

const TYPE_CONFIG = {
  warning:  { color: null, icon: "⚠️", gradient: "135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05)" },
  success:  { color: null, icon: "🏆", gradient: "135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05)" },
  overload: { color: null, icon: "📈", gradient: "135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05)" },
  info:     { color: null, icon: "🤖", gradient: "135deg, rgba(255,255,255,0.04), rgba(0,0,0,0.06)" },
};

// 🔥 3. YENİLİK: Hareket İsmine Göre Dinamik ve Biyomekanik Tavsiyeler Veren Algoritma
const getDynamicTip = (exName) => {
  const n = (exName || "").toLowerCase();
  
  if (n.includes('bench') || n.includes('göğüs') || n.includes('press')) {
    return { type: 'info', msg: "Göğüs kafesini yukarıda tut ve kürek kemiklerini sehpaya kilitle. İndirme (negatif) fazını yavaş yap." };
  }
  if (n.includes('squat') || n.includes('bacak')) {
    return { type: 'warning', msg: "Omurganı nötr tut ve topuklarından güç alarak yüksel. Dizlerinin içe çökmesine (valgus) asla izin verme!" };
  }
  if (n.includes('deadlift')) {
    return { type: 'warning', msg: "Barı kaval kemiğine yakın tut. Bu bir bel hareketi değil, kalça (hip hinge) hareketidir." };
  }
  if (n.includes('curl') || n.includes('bicep')) {
    return { type: 'info', msg: "Momentum kullanarak sallanma. Dirseklerini sabit tut ve sadece pazu kasını sıkarak ağırlığı kaldır." };
  }
  if (n.includes('row') || n.includes('sırt')) {
    return { type: 'info', msg: "Ağırlığı ellerinle değil, dirseklerinle arkaya çekiyormuş gibi düşün. Tepede sırtını tam sık." };
  }
  if (n.includes('raise') || n.includes('omuz')) {
    return { type: 'info', msg: "Ağırlığı yukarı savurma. Dirseklerini hafif kırık tutarak kontrollü bir şekilde kaldır." };
  }
  
  // Eğer özel bir hareket tespit edilemezse genel "Overload" (Gelişim) tavsiyesi verir
  return { type: 'overload', msg: "Kas gelişimi için progresif aşırı yükleme şarttır. Geçen haftadan en az 1 tekrar veya 1 kg fazla yapmayı hedefle." };
};

export default function AICoach({ C, activeExercise }) {
  const [currentTip, setCurrentTip] = useState(getDynamicTip(activeExercise?.name));

  // Hareket değiştikçe tavsiye de değişir
  useEffect(() => {
    setCurrentTip(getDynamicTip(activeExercise?.name));
  }, [activeExercise]);

  const conf = TYPE_CONFIG[currentTip.type] || TYPE_CONFIG.info;
  const accentColor = C[currentTip.type === 'warning' ? 'yellow' : currentTip.type === 'success' ? 'green' : currentTip.type === 'overload' ? 'blue' : 'sub'] || C.blue;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
      style={{ 
        background: `linear-gradient(${conf.gradient})`,
        border: `1px solid ${accentColor}40`,
        borderRadius: 24,
        padding: "20px 24px",
        marginBottom: 20,
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: `0 10px 30px rgba(0,0,0,0.2)`
      }}
    >
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ fontSize: 32, filter: `drop-shadow(0 0 10px ${accentColor}80)` }}>{conf.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: accentColor, fontWeight: 900, letterSpacing: 1.5, marginBottom: 6, fontFamily: fonts.header }}>
            BİYOMEKANİK KOÇ
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTip.msg}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ fontSize: 14, color: "#fff", lineHeight: 1.5, fontWeight: 600, fontFamily: fonts.body }}
            >
              {currentTip.msg}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}