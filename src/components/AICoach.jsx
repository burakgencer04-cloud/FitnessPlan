import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { predictNextGoal } from '../utils';

export default function AICoach({ C, nutDay }) {
  const user = useAppStore(state => state.user);
  const streak = useAppStore(state => state.streak);
  const weightLog = useAppStore(state => state.weightLog);
  const consumedFoods = useAppStore(state => state.consumedFoods) || [];
  
  const [msgIndex, setMsgIndex] = useState(0);

  const allMessages = useMemo(() => {
    if (!user) return [{ msg: "Önce profilini tamamlamalısın ki sana özel bir strateji çizebileyim.", type: "warning", title: "Sistem Uyarısı" }];

    const messages = [];

    // Standart Premium İpuçları
    messages.push({ msg: "Bugün harika görünüyorsun! Planına sadık kal ve pes etme. 🦾", type: "info", title: "Koçum" });
    messages.push({ msg: "Su içmeyi unutma! Kas gelişimi ve toparlanma için hidrasyon şart. 💧", type: "info", title: "Koçum" });
    messages.push({ msg: "Antrenmanlarında formu bozmadan ağırlık artırmaya odaklan. Kaslar zorlandıkça gelişir! 📈", type: "info", title: "Koçum" });
    messages.push({ msg: "Yeterli uyku, antrenmanın kendisi kadar önemlidir. Dinlenmeyi ihmal etme. 🛌", type: "info", title: "Koçum" });

    // Beslenme Analizi
    const todayFoods = consumedFoods.filter(f => f.nutDay === nutDay && !f.isWater && f.isEaten);
    const totalProtein = todayFoods.reduce((acc, f) => acc + (f.p || 0), 0);
    if (totalProtein > 0 && totalProtein < 50 && new Date().getHours() > 15) {
      messages.push({ msg: `Gün bitmek üzere ama protein alımın (${Math.round(totalProtein)}g) biraz düşük kalmış. Akşam yemeğinde proteini artırmalısın. 🥩`, type: "warning", title: "Beslenme Uyarısı" });
    }

    // Antrenman Analizi
    const allExercises = Object.keys(weightLog);
    if (allExercises.length > 0) {
      const lastExName = allExercises[allExercises.length - 1];
      const logs = weightLog[lastExName];
      if (logs && logs.length > 0) {
        const lastSession = logs[logs.length - 1];
        const prediction = predictNextGoal(lastSession);
        if (prediction.nextWeight !== "-" && prediction.nextWeight > (lastSession.sets[0]?.kg || 0)) {
          messages.push({ msg: `Son antrenmanında ${lastExName} hareketinde çok iyiydin! Bugün ağırlığı ${prediction.nextWeight}kg'a çıkarmayı denemelisin. 💪`, type: "overload", title: "Gelişim Fırsatı" });
        }
      }
    }

    // İstikrar Analizi
    if (streak > 0 && streak % 3 === 0) {
      messages.push({ msg: `İnanılmaz bir disiplin! ${streak} gündür hedeflerinden sapmıyorsun. Vücudundaki değişimi hissetmeye başlamış olmalısın. 🔥`, type: "success", title: "Tebrikler!" });
    }

    return messages;
  }, [user, streak, weightLog, consumedFoods, nutDay]);

  // 🚀 DÜZELTME: Süre 10 saniyeye (10000ms) çıkarıldı
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % allMessages.length);
    }, 10000); 
    return () => clearInterval(interval);
  }, [allMessages.length]);

  const currentData = allMessages[msgIndex];

  const getConfig = (type) => {
    switch (type) {
      case 'warning': return { color: C.yellow, icon: "⚠️" };
      case 'success': return { color: C.green, icon: "🏆" };
      case 'overload': return { color: C.blue, icon: "📈" };
      default: return { color: C.primary || C.blue, icon: "🤖" }; 
    }
  };

  const config = getConfig(currentData.type);

  return (
    <div style={{ 
      background: `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.2))`,
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      border: `1px solid ${config.color}40`,
      borderRadius: 24, padding: 16, position: "relative", overflow: "hidden", marginBottom: 24,
      boxShadow: "0 10px 30px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.05)"
    }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: config.color, filter: "blur(50px)", opacity: 0.15, borderRadius: "50%" }} />
      
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ 
          width: 44, height: 44, borderRadius: 16, 
          background: `linear-gradient(145deg, rgba(255,255,255,0.1), rgba(0,0,0,0.2))`, 
          border: `1px solid ${config.color}50`,
          display: "flex", alignItems: "center", justifyContent: "center", 
          fontSize: 24, flexShrink: 0,
          boxShadow: `0 4px 15px ${config.color}30, inset 0 2px 4px rgba(255,255,255,0.1)`
        }}>
          {config.icon}
        </div>
        
        <div style={{ flex: 1, minHeight: 60 }}>
          {/* 🚀 DÜZELTME: Yazı fontu daha zarif yapıldı */}
          <div style={{ fontSize: 12, fontWeight: 800, color: config.color, letterSpacing: 1, marginBottom: 6 }}>
            {currentData.title.toUpperCase()}
          </div>
          <AnimatePresence mode="wait">
            <motion.div 
              key={msgIndex}
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              style={{ fontSize: 13, color: C.text, lineHeight: 1.5, fontWeight: 500 }}
            >
              {currentData.msg}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}