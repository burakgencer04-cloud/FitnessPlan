import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { predictNextGoal } from '../utils';
import { fonts } from './tabTodayUtils';

const TYPE_CONFIG = {
  warning:  { color: null, icon: "⚠️", gradient: "135deg, #f59e0b18, #f59e0b08" },
  success:  { color: null, icon: "🏆", gradient: "135deg, #22c55e18, #22c55e08" },
  overload: { color: null, icon: "📈", gradient: "135deg, #3b82f618, #3b82f608" },
  info:     { color: null, icon: "🤖", gradient: "135deg, rgba(255,255,255,0.04), rgba(0,0,0,0.06)" },
};

const getTypeColor = (type, C) => {
  switch (type) {
    case 'warning':  return C.yellow;
    case 'success':  return C.green;
    case 'overload': return C.blue;
    default:         return C.blue;
  }
};

export default function AICoach({ C, nutDay }) {
  const user = useAppStore(state => state.user);
  const streak = useAppStore(state => state.streak);
  const weightLog = useAppStore(state => state.weightLog);
  const consumedFoods = useAppStore(state => state.consumedFoods) || [];

  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const DURATION = 10000;

  const allMessages = useMemo(() => {
    if (!user) return [{ msg: "Önce profilini tamamlamalısın ki sana özel strateji çizebileyim.", type: "warning", title: "Sistem Uyarısı" }];

    const messages = [];
    messages.push({ msg: "Bugün harika görünüyorsun! Planına sadık kal ve pes etme. 🦾", type: "info", title: "Koçum" });
    messages.push({ msg: "Su içmeyi unutma! Kas gelişimi ve toparlanma için hidrasyon şart. 💧", type: "info", title: "Koçum" });
    messages.push({ msg: "Formu bozmadan ağırlık artırmaya odaklan. Kaslar zorlandıkça gelişir! 📈", type: "info", title: "Koçum" });
    messages.push({ msg: "Yeterli uyku, antrenmanın kendisi kadar önemlidir. Dinlenmeyi ihmal etme. 🛌", type: "info", title: "Koçum" });

    const todayFoods = consumedFoods.filter(f => f.nutDay === nutDay && !f.isWater && f.isEaten);
    const totalProtein = todayFoods.reduce((acc, f) => acc + (f.p || 0), 0);
    if (totalProtein > 0 && totalProtein < 50 && new Date().getHours() > 15) {
      messages.push({ msg: `Gün bitmek üzere ama protein alımın (${Math.round(totalProtein)}g) düşük kalmış. Akşam yemeğinde proteini artırmalısın. 🥩`, type: "warning", title: "Beslenme Uyarısı" });
    }

    const allExercises = Object.keys(weightLog);
    if (allExercises.length > 0) {
      const lastExName = allExercises[allExercises.length - 1];
      const logs = weightLog[lastExName];
      if (logs?.length > 0) {
        const lastSession = logs[logs.length - 1];
        const prediction = predictNextGoal(lastSession);
        if (prediction.nextWeight !== "-" && prediction.nextWeight > (lastSession.sets?.[0]?.kg || 0)) {
          messages.push({ msg: `${lastExName}'de çok iyiydin! Bugün ağırlığı ${prediction.nextWeight}kg'a çıkarmayı denemelisin. 💪`, type: "overload", title: "Gelişim Fırsatı" });
        }
      }
    }

    if (streak > 0 && streak % 3 === 0) {
      messages.push({ msg: `İnanılmaz disiplin! ${streak} gündür hedeflerinden sapmıyorsun. Vücudundaki değişimi hissetmeye başlamış olmalısın. 🔥`, type: "success", title: "Tebrikler!" });
    }

    return messages;
  }, [user, streak, weightLog, consumedFoods, nutDay]);

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(100, (elapsed / DURATION) * 100));
    };
    const frame = setInterval(tick, 80);
    const timer = setTimeout(() => {
      setMsgIndex(prev => (prev + 1) % allMessages.length);
    }, DURATION);
    return () => { clearInterval(frame); clearTimeout(timer); };
  }, [msgIndex, allMessages.length]);

  const currentData = allMessages[msgIndex];
  const accent = getTypeColor(currentData.type, C);

  return (
    <div style={{
      position: "relative",
      borderRadius: 22,
      padding: "18px 18px 16px",
      marginBottom: 20,
      background: `linear-gradient(145deg, ${C.card}F0, ${C.bg}E0)`,
      border: `1px solid ${accent}35`,
      borderTop: "1px solid rgba(255,255,255,0.06)",
      boxShadow: `0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px ${accent}15`,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      overflow: "hidden",
    }}>
      {/* Ambient glow blob */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 120, height: 120,
        background: accent,
        filter: "blur(60px)",
        opacity: 0.12,
        borderRadius: "50%",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", position: "relative", zIndex: 1 }}>
        {/* Icon bubble */}
        <div style={{
          width: 46, height: 46, borderRadius: 16, flexShrink: 0,
          background: `linear-gradient(145deg, ${accent}25, ${accent}10)`,
          border: `1px solid ${accent}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22,
          boxShadow: `0 4px 16px ${accent}25, inset 0 1px 0 rgba(255,255,255,0.08)`,
        }}>
          {TYPE_CONFIG[currentData.type]?.icon || "🤖"}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minHeight: 56 }}>
          <div style={{
            fontSize: 10, fontWeight: 900, color: accent,
            letterSpacing: 2, marginBottom: 6,
            fontFamily: fonts.header,
            textTransform: "uppercase",
          }}>
            {currentData.title}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={msgIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
              style={{ fontSize: 13, color: C.text, lineHeight: 1.55, fontWeight: 500, fontFamily: fonts.body }}
            >
              {currentData.msg}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 2, background: `${accent}18`,
      }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.08, ease: "linear" }}
          style={{ height: "100%", background: accent, borderRadius: 1 }}
        />
      </div>

      {/* Message dots */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 4, marginTop: 12, position: "relative", zIndex: 1 }}>
        {allMessages.map((_, i) => (
          <div
            key={i}
            onClick={() => setMsgIndex(i)}
            style={{
              width: i === msgIndex ? 16 : 5,
              height: 5,
              borderRadius: 9999,
              background: i === msgIndex ? accent : `${accent}35`,
              transition: "width 0.3s ease, background 0.3s ease",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );
}
