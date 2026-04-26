import React, { useMemo, useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fonts } from '@/features/fitness/workout/utils/tabTodayUtils'; 
import { LocalDB } from '@/shared/lib/localDB.js'; // 🔥 Asenkron Veritabanı

export default function HistoryBottomSheet({ exName, onClose, C }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Component açıldığında main thread'i bloklamadan veriyi çek
  useEffect(() => {
    LocalDB.getWeightLog().then(fullLog => {
      setHistory(fullLog[exName] || []);
      setLoading(false);
    });
  }, [exName]);

  const chartData = useMemo(() => {
    const arr = Array.isArray(history) ? history : (history ? [history] : []);
    if (arr.length === 1) {
      return [
        { date: "Başlangıç", weight: Math.max(0, arr[0].weight * 0.9).toFixed(1), reps: arr[0].reps },
        { date: arr[0].date, weight: arr[0].weight, reps: arr[0].reps }
      ];
    }
    return arr;
  }, [history]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(5, 8, 12, 0.7)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }} />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        style={{ position: "relative", zIndex: 1, width: "100%", background: `linear-gradient(180deg, ${C.card} 0%, ${C.bg} 100%)`, borderTop: `1px solid ${C.border}80`, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: "24px 20px", paddingBottom: "calc(24px + env(safe-area-inset-bottom))", maxHeight: "80vh", display: "flex", flexDirection: "column" }}
      >
        <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2, margin: "0 auto 20px auto" }} />
        <h2 style={{ margin: "0 0 20px 0", fontSize: 20, fontWeight: 900, fontFamily: fonts.header, color: C.text, textTransform: "capitalize" }}>{exName} Geçmişi</h2>

        {loading ? (
           <div style={{ padding: 40, textAlign: 'center', color: C.mute, fontFamily: fonts.header }}>Geçmiş Yükleniyor...</div>
        ) : chartData.length > 0 ? (
          <>
            <div style={{ height: 200, width: "100%", marginBottom: 24 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorW" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.green} stopOpacity={0.5}/>
                      <stop offset="95%" stopColor={C.green} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} fontFamily={fonts.mono} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} width={30} domain={['dataMin - 5', 'dataMax + 5']} fontFamily={fonts.mono} />
                  <Tooltip contentStyle={{ background: "rgba(10,10,15,0.9)", border: `1px solid ${C.border}80`, borderRadius: 12, fontFamily: fonts.mono }} itemStyle={{ color: C.green, fontWeight: 900 }} labelStyle={{ color: C.sub, marginBottom: 4 }} />
                  <Area type="monotone" dataKey="weight" stroke={C.green} strokeWidth={3} fill="url(#colorW)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ overflowY: "auto", flex: 1, paddingRight: 4 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {history.slice().reverse().map((log, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "rgba(0,0,0,0.2)", border: `1px solid ${C.border}40`, borderRadius: 16 }}>
                    <div style={{ fontSize: 13, color: C.mute, fontFamily: fonts.mono, fontWeight: 700 }}>{log.date}</div>
                    <div style={{ background: `linear-gradient(135deg, ${C.green}20, transparent)`, padding: "6px 12px", borderRadius: 10, border: `1px solid ${C.green}40` }}>
                      <span style={{ fontSize: 15, fontFamily: fonts.mono, color: C.green, fontWeight: 900 }}>{log.weight}kg</span>
                      <span style={{ fontSize: 12, fontFamily: fonts.mono, color: C.green, fontWeight: 600, marginLeft: 4 }}>× {log.reps}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', background: "rgba(0,0,0,0.2)", borderRadius: 20, border: `1px dashed ${C.border}60` }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤷‍♂️</div>
            <div style={{ color: C.text, fontWeight: 800, fontFamily: fonts.header, fontSize: 16 }}>Geçmiş veri yok.</div>
            <div style={{ color: C.mute, fontSize: 12, marginTop: 6 }}>Bu hareketi ilk defa yapıyorsun. Yeni rekorlara hazır ol!</div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}