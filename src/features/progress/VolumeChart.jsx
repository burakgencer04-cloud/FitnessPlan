import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fonts, getGlassCardStyle, getGlassInnerStyle, CustomTooltip } from './progressUtils.jsx';

export default function VolumeChart({ volumeTrendData, volumeFilter, setVolumeFilter, C }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={getGlassCardStyle(C)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, fontFamily: fonts.header, color: C.text }}>Ağırlık Gelişimim</h2>
          <p style={{ margin: "2px 0 0 0", fontSize: 11, color: C.mute }}>Kaldırdığım toplam ağırlık (kg)</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none", marginBottom: 12 }}>
        {["Tümü", "Göğüs", "Sırt", "Bacak", "Omuz", "Kol", "Karın"].map(type => (
          <button 
            key={type} onClick={() => setVolumeFilter(type)} 
            style={{ flexShrink: 0, background: volumeFilter === type ? C.text : "rgba(0,0,0,0.2)", border: `1px solid ${volumeFilter === type ? C.text : `${C.border}40`}`, color: volumeFilter === type ? C.bg : C.sub, padding: "6px 14px", borderRadius: 100, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "0.2s" }}
          >
            {type}
          </button>
        ))}
      </div>
      
      {volumeTrendData.length > 0 ? (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={volumeTrendData} margin={{ top: 10, right: 0, bottom: 0, left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={`${C.border}40`} vertical={false} />
            <XAxis dataKey="date" tick={{ fill: C.mute, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{ fill: C.mute, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dx={-10} />
            <Tooltip content={<CustomTooltip C={C} />} cursor={{ fill: `rgba(255,255,255,0.05)` }} />
            <Bar dataKey="Hacim" fill={C.sub} radius={[4, 4, 0, 0]}>
              {volumeTrendData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === volumeTrendData.length - 1 ? C.text : `${C.sub}80`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ ...getGlassInnerStyle(C), height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: C.sub, fontSize: 12, fontWeight: 600 }}>Veri bulunamadı.</span>
        </div>
      )}
    </motion.div>
  );
}