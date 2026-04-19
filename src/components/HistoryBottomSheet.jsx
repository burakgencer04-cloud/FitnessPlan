import React, { useMemo } from 'react';
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fonts } from './tabTodayUtils';

export default function HistoryBottomSheet({ exName, history = [], onClose, C }) {
  const chartData = useMemo(() => {
    const arr = Array.isArray(history) ? history : (history ? [history] : []);
    if (arr.length === 1) {
      return [
        { date: "Başlangıç", weight: Math.max(0, arr[0].weight * 0.9).toFixed(1), reps: arr[0].reps },
        { date: arr[0].date, weight: arr[0].weight, reps: arr[0].reps },
      ];
    }
    return arr;
  }, [history]);

  const maxWeight = chartData.length > 0 ? Math.max(...chartData.map(d => d.weight || 0)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      }} />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", position: "relative", zIndex: 1,
          background: `linear-gradient(165deg, ${C.card}F8, ${C.bg}F0)`,
          backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
          borderTopLeftRadius: 32, borderTopRightRadius: 32,
          padding: "0 0 env(safe-area-inset-bottom)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          maxHeight: "88vh", overflowY: "auto",
          boxShadow: "0 -20px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Drag handle */}
        <div style={{ padding: "14px 24px 0", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 40, height: 4, borderRadius: 9999, background: "rgba(255,255,255,0.12)" }} />
        </div>

        <div style={{ padding: "20px 24px 36px" }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 10, color: C.mute, fontWeight: 900, letterSpacing: 2, marginBottom: 4, fontFamily: fonts.header }}>
                AĞIRLIK GEÇMİŞİ
              </div>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, fontFamily: fonts.header, color: C.text }}>
                {exName}
                {maxWeight > 0 && (
                  <span style={{ fontSize: 14, color: C.green, marginLeft: 12, fontStyle: "normal" }}>
                    PR: {maxWeight}kg
                  </span>
                )}
              </h3>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, borderRadius: 11,
                background: "rgba(255,255,255,0.07)",
                border: `1px solid ${C.border}70`,
                color: C.sub, fontWeight: 900, cursor: 'pointer',
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}
            >✕</button>
          </div>

          {chartData.length > 0 ? (
            <>
              {/* Chart */}
              <div style={{
                background: "linear-gradient(145deg, rgba(0,0,0,0.25), rgba(0,0,0,0.1))",
                borderRadius: 20, padding: "20px 8px 12px 0",
                marginBottom: 24,
                border: `1px solid ${C.border}50`,
              }}>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={C.green} stopOpacity={0.35}/>
                        <stop offset="95%" stopColor={C.green} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke={`${C.border}40`} vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: C.mute, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dy={5} />
                    <YAxis domain={['dataMin - 3', 'dataMax + 3']} tick={{ fill: C.mute, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dx={-4} width={28} />
                    <Tooltip
                      contentStyle={{
                        background: C.card, border: `1px solid ${C.border}80`,
                        borderRadius: 12, color: C.text,
                        fontFamily: fonts.mono, fontSize: 12,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                      }}
                      formatter={(v, name) => [`${v} kg`, "Ağırlık"]}
                    />
                    <Area type="monotone" dataKey="weight" stroke={C.green} strokeWidth={2.5} fill="url(#histGrad)" activeDot={{ r: 5, fill: C.green, stroke: C.bg, strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Log list */}
              <div style={{ fontSize: 11, color: C.mute, fontWeight: 900, letterSpacing: 2, marginBottom: 12, fontFamily: fonts.header }}>
                TÜM KAYITLAR
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...chartData].reverse().map((log, idx) => {
                  if (log.date === "Başlangıç") return null;
                  const isPR = log.weight === maxWeight;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "14px 16px",
                        background: isPR ? `${C.green}0D` : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isPR ? C.green + '40' : C.border + '50'}`,
                        borderRadius: 16,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {isPR && (
                          <div style={{
                            fontSize: 9, fontWeight: 900, color: C.green,
                            background: `${C.green}20`, border: `1px solid ${C.green}40`,
                            padding: "2px 7px", borderRadius: 6, letterSpacing: 1,
                          }}>PR</div>
                        )}
                        <div style={{ fontSize: 13, color: C.sub, fontFamily: fonts.mono, fontWeight: 700 }}>{log.date}</div>
                      </div>
                      <div style={{
                        display: "flex", alignItems: "baseline", gap: 4,
                        background: `${C.green}12`, padding: "6px 12px", borderRadius: 10,
                        border: `1px solid ${C.green}30`,
                      }}>
                        <span style={{ fontSize: 16, fontFamily: fonts.mono, color: C.green, fontWeight: 900 }}>{log.weight}</span>
                        <span style={{ fontSize: 10, color: C.green, fontWeight: 700 }}>kg</span>
                        <span style={{ fontSize: 13, color: C.mute, margin: "0 2px" }}>×</span>
                        <span style={{ fontSize: 14, fontFamily: fonts.mono, color: C.text, fontWeight: 800 }}>{log.reps}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{
              padding: "48px 24px", textAlign: 'center',
              background: "rgba(0,0,0,0.15)", borderRadius: 24,
              border: `1px dashed ${C.border}60`,
            }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🏋️</div>
              <div style={{ color: C.text, fontWeight: 900, fontFamily: fonts.header, fontSize: 17, marginBottom: 6 }}>Geçmiş Kayıt Yok</div>
              <div style={{ color: C.mute, fontSize: 13, lineHeight: 1.5, fontFamily: fonts.body }}>
                Bu hareketi ilk defa yapıyorsun. Ağırlıkları girerek rekorunu oluştur!
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
