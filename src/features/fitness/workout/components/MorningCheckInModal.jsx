import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { globalFonts as fonts } from '@/shared/ui/globalStyles.js';
import { HapticEngine } from '@/shared/lib/hapticSoundEngine.js';

export default function MorningCheckInModal({ show, onClose, modalEnergy, setModalEnergy, modalSleep, setModalSleep, onSave, C }) {
  if (!show) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:'fixed', inset:0, zIndex:50000, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center'}}>
         <motion.div initial={{scale:0.9, y:20}} animate={{scale:1, y:0}} style={{background:'linear-gradient(145deg, #1e1e24, #15151a)', padding: 32, borderRadius: 32, border:`1px solid ${C.border}40`, width:'90%', maxWidth:400, boxShadow: "0 20px 50px rgba(0,0,0,0.5)"}}>
            <div style={{fontSize: 50, textAlign: 'center', marginBottom: 16, filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.4))'}}>🛌</div>
            <h2 style={{color:'#fff', fontFamily:fonts.header, fontStyle:"italic", textAlign:'center', margin:'0 0 8px 0', fontSize:22}}>Günlük Check-in</h2>
            <p style={{color:C.sub, fontSize:12, textAlign:'center', marginBottom: 24, lineHeight:1.5}}>Kaslar dinlenirken büyür. Bugünkü idman şiddetini belirlemek için vücudunu dinleyelim.</p>
            
            <div style={{marginBottom: 24, background:"rgba(0,0,0,0.2)", padding:16, borderRadius:20}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
                <label style={{color:'#fff', fontWeight:800, fontSize:13, fontFamily:fonts.header}}>Enerji Seviyen</label>
                <span style={{color:C.yellow, fontWeight:900, fontFamily:fonts.mono, fontSize:16}}>{modalEnergy}/10</span>
              </div>
              <input type="range" min="1" max="10" value={modalEnergy} onChange={e=>setModalEnergy(e.target.value)} style={{width:'100%', accentColor:C.yellow}} />
            </div>

            <div style={{marginBottom: 32, background:"rgba(0,0,0,0.2)", padding:16, borderRadius:20}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
                <label style={{color:'#fff', fontWeight:800, fontSize:13, fontFamily:fonts.header}}>Uyku Süren</label>
                <span style={{color:C.blue, fontWeight:900, fontFamily:fonts.mono, fontSize:16}}>{modalSleep} Saat</span>
              </div>
              <input type="range" min="0" max="12" step="0.5" value={modalSleep} onChange={e=>setModalSleep(e.target.value)} style={{width:'100%', accentColor:C.blue}} />
            </div>

            {/* 🔥 DÜZELTME: Butonlar güvenli bir div içine alındı */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                onClick={() => { onSave(); HapticEngine.success(); }} 
                style={{width:'100%', background:`linear-gradient(135deg, ${C.green}, #22c55e)`, color:'#000', padding:'16px', borderRadius:20, fontWeight:900, fontSize:15, border:'none', cursor:'pointer', fontFamily:fonts.header, boxShadow:`0 10px 20px ${C.green}40`}}
              >
                Güne Başla ⚡
              </button>

              <button 
                onClick={onClose} 
                style={{width:'100%', background:'transparent', color:C.mute, padding:'12px', borderRadius:16, fontWeight:800, fontSize:13, border:`1px solid ${C.border}40`, cursor:'pointer', fontFamily:fonts.header}}
              >
                Şimdi Değil, Sonra Girerim
              </button>
            </div>

         </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
