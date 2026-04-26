import { WORKOUT_PRESETS } from "../data/workoutData.js";
import React, { useMemo } from 'react';
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { globalFonts as fonts, getGlobalGlassStyle, getGlobalGlassInnerStyle, getMainButtonStyle } from '@/shared/ui/globalStyles.js';
import { calculateE1RM } from '../utils/workoutAnalyzer.js';


export default function HistoryBottomSheet({ exName, history = [], onClose, C }) {
  // history prop'u zaten LocalDB'den veya store'dan üst bileşen tarafından çekilip paslanıyor.
  const chartData = useMemo(() => {
    const arr = Array.isArray(history) ? history : (history ? [history] : []);
    
    // 🔥 E1RM'i ekleyerek formatla
    const formattedData = arr.map(log => {
       const e1rm = log.e1rm || calculateE1RM(log.weight, log.reps);
       return { ...log, e1rm };
    });

    if (formattedData.length === 1) {
      return [
        { date: "Başlangıç", e1rm: Math.max(0, formattedData[0].e1rm * 0.9).toFixed(1), weight: formattedData[0].weight, reps: formattedData[0].reps },
        formattedData[0]
      ];
    }
    return formattedData;
  }, [history]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(5, 8, 12, 0.7)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} onClick={e => e.stopPropagation()} style={{ width: "100%", background: `linear-gradient(145deg, ${C.card}F2, ${C.bg}E6)`, backdropFilter: "blur(24px)", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: "24px 24px 40px 24px", borderTop: `1px solid ${C.border}60`, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 -20px 50px rgba(0,0,0,0.5)", position: "relative", zIndex: 1 }}>
        <div style={{ width: 40, height: 5, background: `${C.border}80`, borderRadius: 3, margin: "0 auto 24px" }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
           <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: C.text }}>E1RM Trendi: <span style={{ color: C.green, textShadow: `0 0 10px ${C.green}80` }}>{exName}</span></h3>
           <button onClick={onClose} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${C.border}60`, color: C.text, width: 32, height: 32, borderRadius: 10, fontWeight: 900, cursor: 'pointer' }}>✕</button>
        </div>
        
        {chartData.length > 0 ? (
          <>
            <div style={{ background: `linear-gradient(145deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1))`, borderRadius: 20, padding: "20px 10px 10px 0", marginBottom: 24, border: `1px solid ${C.border}40` }}>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.green} stopOpacity={0.4}/><stop offset="95%" stopColor={C.green} stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={`${C.border}40`} vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: C.sub, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dy={5} />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fill: C.sub, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dx={-5} width={30} />
                  {/* 🔥 YENİ: E1RM Tooltip */}
                  <Tooltip 
                     contentStyle={{ background: C.card, border: `1px solid ${C.border}80`, borderRadius: 12, color: C.text, fontFamily: fonts.mono, fontSize: 12 }} 
                     formatter={(value) => [`${value}kg`, "Tahmini 1RM"]}
                  />
                  {/* 🔥 YENİ: Veri kaynağı dataKey="e1rm" oldu */}
                  <Area type="monotone" dataKey="e1rm" stroke={C.green} strokeWidth={3} fill="url(#colorHistory)" activeDot={{ r: 5, fill: C.green, stroke: C.bg, strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, color: C.sub, fontWeight: 800, fontFamily: fonts.header, letterSpacing: 1, marginBottom: 4 }}>TÜM KAYITLAR</div>
              {[...chartData].reverse().map((log, idx) => {
                if(log.date === "Başlangıç") return null; 
                return (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "rgba(0,0,0,0.2)", border: `1px solid ${C.border}40`, borderRadius: 16 }}>
                    <div style={{ fontSize: 13, color: C.mute, fontFamily: fonts.mono, fontWeight: 700 }}>{log.date}</div>
                    
                    <div style={{ background: `linear-gradient(135deg, ${C.green}20, transparent)`, padding: "6px 12px", borderRadius: 10, border: `1px solid ${C.green}40`, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      {/* 🔥 E1RM Vurgusu */}
                      <div style={{ fontSize: 15, fontFamily: fonts.mono, color: C.green, fontWeight: 900 }}>E1RM: {log.e1rm}kg</div>
                      <div style={{ fontSize: 10, color: C.mute, fontFamily: fonts.mono }}>({log.weight}kg × {log.reps})</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', background: "rgba(0,0,0,0.2)", borderRadius: 20, border: `1px dashed ${C.border}60` }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤷‍♂️</div>
            <div style={{ color: C.text, fontWeight: 800, fontFamily: fonts.header, fontSize: 16 }}>Geçmiş Kayıt Yok</div>
            <div style={{ color: C.mute, fontSize: 13, marginTop: 6, fontFamily: fonts.body }}>Bu hareketi ilk defa yapıyorsun. Ağırlıkları girerek rekorunu oluştur!</div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}