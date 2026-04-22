import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function VolumeChart({ weightLog, C }) {
  // Basit bir mock data üretiyoruz (Gerçek verin dolana kadar boş durmasın)
  const data = [
    { name: 'Pzt', volume: 1200 }, { name: 'Sal', volume: 2100 },
    { name: 'Çar', volume: 800 }, { name: 'Per', volume: 2600 },
    { name: 'Cum', volume: 1900 }, { name: 'Cmt', volume: 3100 },
    { name: 'Paz', volume: 2400 }
  ];

  return (
    <div style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2))`, border: `1px solid ${C.border}50`, borderRadius: 24, padding: "20px 20px 10px 20px", marginTop: 24, height: 220 }}>
      <div style={{ fontSize: 11, color: C.sub, fontWeight: 800, letterSpacing: 1, marginBottom: 16 }}>HAFTALIK TONAJ GRAFİĞİ</div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={C.green} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={C.green} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{ background: "rgba(0,0,0,0.8)", border: `1px solid ${C.border}`, borderRadius: 12, color: C.text }}
            itemStyle={{ color: C.green, fontWeight: 900 }} 
          />
          <XAxis dataKey="name" stroke={C.mute} fontSize={10} tickLine={false} axisLine={false} />
          <Area type="monotone" dataKey="volume" stroke={C.green} strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}