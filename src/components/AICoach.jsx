import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { getCommonStyles } from '../theme';
import { predictNextGoal } from '../utils';

export default function AICoach({ C, nutDay }) {
  const { glassInner } = getCommonStyles(C);
  
  // Uygulamanın beyninden gerekli verileri çekiyoruz
  const user = useAppStore(state => state.user);
  const streak = useAppStore(state => state.streak);
  const weightLog = useAppStore(state => state.weightLog);
  const consumedFoods = useAppStore(state => state.consumedFoods) || [];
  
  const [coachMessage, setCoachMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info, warning, success, overload
  const [isTyping, setIsTyping] = useState(true);

  // 🧠 YAPAY ZEKA ANALİZ MOTORU
  const analyzeData = useMemo(() => {
    if (!user) return { msg: "Önce profilini tamamlamalısın ki sana özel bir strateji çizebileyim.", type: "warning" };

    const messages = [];

    // 1. Beslenme Analizi (O günkü protein hedefine bak)
    const todayFoods = consumedFoods.filter(f => f.nutDay === nutDay && !f.isWater && f.isEaten);
    const totalProtein = todayFoods.reduce((acc, f) => acc + (f.p || 0), 0);
    const totalCal = todayFoods.reduce((acc, f) => acc + (f.cal || 0), 0);
    
    // 2. Antrenman Analizi (Progressive Overload)
    let overloadMsg = null;
    const allExercises = Object.keys(weightLog);
    if (allExercises.length > 0) {
      // En son yapılan hareketi bul
      const lastExName = allExercises[allExercises.length - 1];
      const logs = weightLog[lastExName];
      if (logs && logs.length > 0) {
        const lastSession = logs[logs.length - 1];
        const prediction = predictNextGoal(lastSession);
        if (prediction.nextWeight !== "-" && prediction.nextWeight > (lastSession.sets[0]?.kg || 0)) {
          overloadMsg = `Son antrenmanında ${lastExName} hareketinde çok iyiydin! Bir sonraki sefer ağırlığı ${prediction.nextWeight}kg'a çıkarmayı denemelisin. 💪`;
        }
      }
    }

    // 3. İstikrar (Streak) Analizi
    if (streak > 0 && streak % 7 === 0) {
      messages.push({ msg: `İnanılmaz bir disiplin! ${streak} gündür hedeflerinden sapmıyorsun. Vücudundaki değişimi hissetmeye başlamış olmalısın. 🔥`, type: "success" });
    }

    if (overloadMsg) {
      messages.push({ msg: overloadMsg, type: "overload" });
    }

    if (totalProtein > 0 && totalProtein < 50 && new Date().getHours() > 15) {
      messages.push({ msg: `Gün bitmek üzere ama protein alımın (${Math.round(totalProtein)}g) biraz düşük kalmış. Kas inşası için akşam yemeğinde proteini artırmalısın. 🥩`, type: "warning" });
    }

    if (messages.length === 0) {
      messages.push({ msg: "Bugün harika görünüyorsun! Planına sadık kal ve antrenmanını aksatma. Ben buradayım. 🦾", type: "info" });
    }

    // Rastgele bir tavsiye seç
    return messages[Math.floor(Math.random() * messages.length)];
  }, [user, streak, weightLog, consumedFoods, nutDay]);

  useEffect(() => {
    setIsTyping(true);
    setCoachMessage("");
    
    // Daktilo (Typing) Efekti
    let i = 0;
    const text = analyzeData.msg;
    const interval = setInterval(() => {
      setCoachMessage(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30); // Yazma hızı

    setMessageType(analyzeData.type);

    return () => clearInterval(interval);
  }, [analyzeData]);

  // Mesaj tipine göre renk ve ikon belirle
  const getConfig = () => {
    switch (messageType) {
      case 'warning': return { color: C.yellow, icon: "⚠️", title: "Koçun Uyarısı" };
      case 'success': return { color: C.green, icon: "🏆", title: "Tebrikler!" };
      case 'overload': return { color: C.blue, icon: "📈", title: "Gelişim Fırsatı" };
      default: return { color: C.primary, icon: "🤖", title: "AI Asistan" };
    }
  };

  const config = getConfig();

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }} 
      style={{ 
        ...glassInner, 
        background: `linear-gradient(135deg, ${config.color}15, rgba(0,0,0,0.2))`,
        border: `1px solid ${config.color}40`,
        position: "relative",
        overflow: "hidden",
        marginBottom: 24
      }}
    >
      {/* Arka plan parlama efekti */}
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, background: config.color, filter: "blur(40px)", opacity: 0.2, borderRadius: "50%" }} />
      
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ 
          width: 44, height: 44, borderRadius: 16, 
          background: `${config.color}20`, 
          border: `1px solid ${config.color}50`,
          display: "flex", alignItems: "center", justifyContent: "center", 
          fontSize: 24, flexShrink: 0,
          boxShadow: `0 4px 15px ${config.color}30`
        }}>
          {config.icon}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: config.color, letterSpacing: 1, marginBottom: 4, fontFamily: "'Comucan', sans-serif" }}>
            {config.title.toUpperCase()}
          </div>
          <div style={{ fontSize: 14, color: C.text, lineHeight: 1.5, fontFamily: "'Comucan', sans-serif", fontWeight: 600 }}>
            {coachMessage}
            {isTyping && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} style={{ display: "inline-block", width: 6, height: 14, background: config.color, marginLeft: 4, verticalAlign: "middle" }} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}