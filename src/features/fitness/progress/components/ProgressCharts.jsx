import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, ReferenceLine, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// 🔥 CustomTooltip utils dosyasından çekiliyor
import { MEASUREMENT_TYPES, getGlassCardStyle, getGlassInnerStyle, CustomTooltip } from "../utils/progressUtils.jsx";
import { fonts } from '@/shared/ui/uiStyles.js';

export default function ProgressCharts(props) {
  const C = props?.C ?? {};
  const glassCardStyle = getGlassCardStyle(C);
  const glassInnerStyle = getGlassInnerStyle(C);

  const chartData = props?.chartData ?? [];
  const volumeTrendData = props?.volumeTrendData ?? [];

  return (
    <>
      <AnimatePresence>
        {props?.trendInfo && props?.selectedChartType === 'weight' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ background: `linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))`, border: `1px solid rgba(59, 130, 246, 0.4)`, padding: 20, borderRadius: 24, marginBottom: 24, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.15)" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#3b82f6", letterSpacing: 1, marginBottom: 6, fontFamily: fonts.header }}>🧠 KOMPOZİSYON TAHMİNİ (AI)</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{props?.trendInfo?.targetMessage}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={glassCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, fontFamily: fonts.header, color: C?.text }}>Vücut Ölçüleri</h2>
          <button onClick={() => { props?.setMeasureForm?.(prev => ({...prev, type: props?.selectedChartType})); props?.setShowMeasureModal?.(true); }} style={{ background: C?.text, color: C?.bg, border: "none", padding: "8px 16px", borderRadius: 10, fontWeight: 800, cursor: "pointer", fontSize: 12, boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
            Kayıt Gir
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none", marginBottom: 12 }}>
          {MEASUREMENT_TYPES.map(type => (
            <button 
              key={type.id} onClick={() => props?.setSelectedChartType?.(type.id)} 
              style={{ flexShrink: 0, background: props?.selectedChartType === type.id ? C?.text : "rgba(0,0,0,0.2)", border: `1px solid ${props?.selectedChartType === type.id ? C?.text : `${C?.border}40`}`, color: props?.selectedChartType === type.id ? C?.bg : C?.sub, padding: "8px 16px", borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "0.2s" }}
            >
              {type.label.split(" ")[0]}
            </button>
          ))}
        </div>
        
        {props?.deltaInfo && (
          <div style={{ fontSize: 13, color: props?.deltaInfo?.color, fontWeight: 800, marginBottom: 16, background: `rgba(0,0,0,0.2)`, border: `1px solid ${props?.deltaInfo?.color}40`, padding: "8px 12px", borderRadius: 8, display: "inline-block" }}>
            {props?.deltaInfo?.text}
          </div>
        )}
        
        {chartData?.length > 0 ? (
          props?.selectedChartType === 'weight' ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${C?.border}40`} vertical={false} />
                <XAxis dataKey="date" tick={{ fill: C?.mute, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dy={10} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: C?.mute, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dx={-10} />
                
                {/* 🔥 CustomTooltip'e C temasını aktarıyoruz */}
                <Tooltip content={(tooltipProps) => <CustomTooltip {...tooltipProps} C={C} />} cursor={{ stroke: `${C?.border}80`, strokeWidth: 1 }} />
                
                <Line type="monotone" dataKey="value" name="Gerçek Kilo" stroke={C?.text} strokeWidth={3} dot={{ r: 4, fill: C?.text }} activeDot={{ r: 6 }} connectNulls />
                <Line type="monotone" dataKey="projectedValue" name="AI Tahmini" stroke={C?.blue} strokeWidth={3} strokeDasharray="5 5" dot={false} connectNulls />
                {props?.targetWeight && (
                  <ReferenceLine y={props?.targetWeight} stroke={C?.yellow} strokeDasharray="3 3" label={{ position: 'top', value: `Hedef: ${props?.targetWeight}kg`, fill: C?.yellow, fontSize: 10, fontWeight: 'bold' }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 10, right: 0, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="colorMeasure" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C?.text} stopOpacity={0.3}/><stop offset="95%" stopColor={C?.text} stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={`${C?.border}40`} vertical={false} />
                <XAxis dataKey="date" tick={{ fill: C?.mute, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dy={10} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: C?.mute, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dx={-10} />
                
                {/* 🔥 CustomTooltip'e C temasını aktarıyoruz */}
                <Tooltip content={(tooltipProps) => <CustomTooltip {...tooltipProps} C={C} />} cursor={{ stroke: `${C?.border}80`, strokeWidth: 1 }} />
                
                <Area type="monotone" dataKey="value" stroke={C?.text} strokeWidth={3} fill="url(#colorMeasure)" activeDot={{ r: 5, fill: C?.text, stroke: C?.bg, strokeWidth: 2 }} connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          )
        ) : (
          <div style={{ ...glassInnerStyle, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: C?.sub, fontSize: 13, fontWeight: 600 }}>Ölçüm verisi yok.</span>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={glassCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, fontFamily: fonts.header, color: C?.text }}>Tonaj Gelişimi</h2>
            <p style={{ margin: "2px 0 0 0", fontSize: 11, color: C?.mute }}>Kaldırılan toplam ağırlık (kg)</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none", marginBottom: 12 }}>
          {["Tümü", "Göğüs", "Sırt", "Bacak", "Omuz", "Kol", "Karın"].map(type => (
            <button 
              key={type} onClick={() => props?.setVolumeFilter?.(type)} 
              style={{ flexShrink: 0, background: props?.volumeFilter === type ? C?.text : "rgba(0,0,0,0.2)", border: `1px solid ${props?.volumeFilter === type ? C?.text : `${C?.border}40`}`, color: props?.volumeFilter === type ? C?.bg : C?.sub, padding: "6px 14px", borderRadius: 100, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "0.2s" }}
            >
              {type}
            </button>
          ))}
        </div>
        
        {volumeTrendData?.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={volumeTrendData} margin={{ top: 10, right: 0, bottom: 0, left: -24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`${C?.border}40`} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: C?.mute, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fill: C?.mute, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dx={-10} />
              
              {/* 🔥 CustomTooltip'e C temasını aktarıyoruz */}
              <Tooltip content={(tooltipProps) => <CustomTooltip {...tooltipProps} C={C} />} cursor={{ fill: `rgba(255,255,255,0.05)` }} />
              
              <Bar dataKey="Hacim" fill={C?.sub} radius={[4, 4, 0, 0]}>
                {volumeTrendData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === volumeTrendData?.length - 1 ? C?.text : `${C?.sub}80`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ ...glassInnerStyle, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: C?.sub, fontSize: 12, fontWeight: 600 }}>Veri bulunamadı.</span>
          </div>
        )}
      </motion.div>
    </>
  );
}