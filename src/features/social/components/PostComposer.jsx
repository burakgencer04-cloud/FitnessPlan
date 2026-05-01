// src/features/social/components/PostComposer.jsx
import React, { useState, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { globalFonts as fonts } from '@/shared/ui/globalStyles';
import { useAppStore } from '@/app/store';
import useModalStore from '@/shared/store/useModalStore';

// 🔥 SENİN ORİJİNAL VERİLERİN (Eksiksiz korundu)
const MOOD_EMOJIS = ['💪', '🔥', '🏆', '⚡', '🎯', '😤', '🚀', '💥'];

const AI_CAPTIONS = [
  "Limitleri zorlamak için buradayız! 🔥 Bugünü de fethettik.",
  "Disiplin motivasyondan üstündür. Yeni bir PR kapıda! 💪",
  "Sessizce çalış, sonuçlar gürültü yapsın. ⚡",
  "Vücut neye inanırsa, onu başarır. Makrolar tamam! 🥗",
  "Recovery bitti, sıra demirleri bükmekte. 🏋️‍♂️"
];

const QuickActionBtn = memo(({ onClick, color, bg, border, icon, label }) => (
  <motion.button
    whileTap={{ scale: 0.92 }}
    whileHover={{ scale: 1.04 }}
    onClick={onClick}
    style={{
      background: bg, border, color,
      padding: '7px 13px', borderRadius: 100,
      fontSize: 11.5, fontWeight: 800, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 5,
      outline: 'none', whiteSpace: 'nowrap', flexShrink: 0,
      transition: 'box-shadow 0.2s'
    }}
  >
    <span style={{ fontSize: 14 }}>{icon}</span>
    {label}
  </motion.button>
));

export const PostComposer = memo(function PostComposer({ currentUserAvatar, onPostSubmit }) {
  const [text, setText] = useState('');
  const [mood, setMood] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { openModal } = useModalStore();
  const user = useAppStore(state => state.user);
  const programs = useAppStore(state => state.programs || []);

  const activeWorkout = programs.find(p => p.id === user?.activePlanId) || programs[0] || null;
  const activeNutrition = user?.nutritionPlan || user?.nutrition || user?.macros || null;

  const handleAIGenerate = useCallback(() => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      setText(AI_CAPTIONS[Math.floor(Math.random() * AI_CAPTIONS.length)]);
      setIsGeneratingAI(false);
    }, 800);
  }, []);

  const handleSubmit = useCallback(async (overrideType = "STANDARD", extraData = {}) => {
    if (!text.trim() && !mood && overrideType === "STANDARD") return;
    setIsSubmitting(true);
    
    await onPostSubmit({
      text: text.trim(),
      type: overrideType,
      mood: mood, // Seçilen ruh halini de post datasına ekliyoruz
      ...extraData
    });
    
    setText("");
    setMood(null);
    setIsSubmitting(false);
  }, [text, mood, onPostSubmit]);

  const handleShareWorkout = useCallback(() => {
     if (!activeWorkout) {
       openModal({ type: 'alert', title: 'Program Bulunamadı', message: 'Paylaşmak için önce bir antrenman programı oluşturmalısınız.' });
       return;
     }
     handleSubmit("WORKOUT_PLAN_SHARE", { workoutPlan: activeWorkout });
  }, [activeWorkout, handleSubmit, openModal]);

  const handleShareNutrition = useCallback(() => {
     if (!activeNutrition) {
       openModal({ type: 'alert', title: 'Diyet Bulunamadı', message: 'Paylaşmak için önce profilinizden makro hedeflerinizi belirlemelisiniz.' });
       return;
     }
     handleSubmit("NUTRITION_PLAN_SHARE", { nutritionPlan: activeNutrition });
  }, [activeNutrition, handleSubmit, openModal]);

  const handleMediaClick = useCallback(() => {
     openModal({ type: 'alert', title: 'Medya', message: 'Fotoğraf ve video yükleme özelliği yakında aktif olacak!' });
  }, [openModal]);

  return (
    <div style={{ 
      marginBottom: 24, 
      // 🔥 PREMIUM GLASSMORPHISM
      background: "linear-gradient(145deg, rgba(25,25,30,0.85) 0%, rgba(10,10,15,0.95) 100%)", 
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      border: "1px solid rgba(255,255,255,0.06)", 
      borderRadius: 24, padding: "16px 16px 12px", 
      boxShadow: "0 15px 35px rgba(0,0,0,0.25)" 
    }}>
      
      {/* ÜST BÖLÜM: Avatar + Textarea + Mood */}
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ 
          width: 44, height: 44, borderRadius: 22, 
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,197,94,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", 
          fontSize: 20, flexShrink: 0 
        }}>
          {currentUserAvatar || "👤"}
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <textarea 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="Bugün ne başardın? Liderlik tablosunu sars..." 
            style={{ 
              width: "100%", background: "transparent", border: "none", 
              color: "#fff", fontSize: 15, outline: "none", 
              fontFamily: fonts.body, resize: 'none', minHeight: 48, paddingTop: 10 
            }}
          />

          {/* 🔥 SENİN MOOD EMOJI LİSTEN */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto', paddingBottom: 4, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {MOOD_EMOJIS.map(m => (
              <motion.button
                key={m}
                whileTap={{ scale: 0.85 }}
                onClick={() => setMood(mood === m ? null : m)}
                style={{
                  background: mood === m ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.03)',
                  border: mood === m ? '1px solid rgba(34,197,94,0.4)' : '1px solid transparent',
                  borderRadius: '50%', width: 28, height: 28, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, cursor: 'pointer', outline: 'none', transition: 'all 0.2s'
                }}
              >
                {m}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* ORTA BÖLÜM: AI + Paylaş Butonu */}
      <div style={{ 
        display: "flex", justifyContent: "space-between", alignItems: "center", 
        marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12,
        flexWrap: 'wrap', gap: 10
      }}>
        
        <AnimatePresence mode="wait">
          {!text.trim() && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <motion.button 
                onClick={handleAIGenerate} 
                whileTap={{ scale: 0.9 }} 
                disabled={isGeneratingAI}
                style={{ 
                  background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.05))", 
                  border: "1px solid rgba(168, 85, 247, 0.3)", 
                  padding: "8px 14px", borderRadius: 100, color: "#a855f7", 
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6, 
                  fontSize: 12, fontWeight: 800, outline: 'none'
                }}
              >
                {isGeneratingAI ? (
                  <>
                    {/* 🔥 SENİN SPINNER ANİMASYONUN */}
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }} 
                      style={{ width: 14, height: 14, border: '2px solid rgba(168,85,250,0.3)', borderTopColor: '#a78bfa', borderRadius: '50%' }}
                    />
                    AI Yazıyor...
                  </>
                ) : (
                  <>✨ AI Caption Öner</>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button 
          whileTap={{ scale: 0.9 }} 
          onClick={() => handleSubmit()} 
          disabled={isSubmitting || (!text.trim() && !mood)}
          style={{ 
            background: text.trim() || mood ? "#22c55e" : "rgba(255,255,255,0.05)", 
            color: text.trim() || mood ? "#000" : "rgba(255,255,255,0.3)", 
            border: "none", padding: "0 20px", height: 36, borderRadius: 18, 
            fontWeight: 900, cursor: text.trim() || mood ? "pointer" : "default",
            marginLeft: 'auto', outline: 'none', transition: 'all 0.3s'
          }}
        >
          {isSubmitting ? '...' : 'Paylaş'}
        </motion.button>
      </div>

      {/* ALT BÖLÜM: SENİN HIZLI AKSİYON (QUICK ACTION) BUTONLARIN */}
      <div style={{
        display: 'flex', gap: 8, marginTop: 12,
        overflowX: 'auto', paddingBottom: 4,
        msOverflowStyle: 'none', scrollbarWidth: 'none'
      }}>
        <QuickActionBtn
          onClick={handleShareWorkout}
          color="#3b82f6"
          bg="rgba(59,130,246,0.12)"
          border="1px solid rgba(59,130,246,0.25)"
          icon="📋"
          label="Programımı Paylaş"
        />
        <QuickActionBtn
          onClick={handleShareNutrition}
          color="#eab308"
          bg="rgba(234,179,8,0.12)"
          border="1px solid rgba(234,179,8,0.25)"
          icon="🥑"
          label="Diyetimi Paylaş"
        />
        <QuickActionBtn
          onClick={handleMediaClick}
          color="rgba(255,255,255,0.7)"
          bg="rgba(255,255,255,0.05)"
          border="1px solid rgba(255,255,255,0.1)"
          icon="📷"
          label="Medya Ekle"
        />
      </div>
    </div>
  );
});