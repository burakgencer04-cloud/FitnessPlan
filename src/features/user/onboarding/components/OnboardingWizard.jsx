import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../hooks/useOnboarding.js';
import { fonts } from './WizardShared.jsx';

// Böldüğümüz Bütün Adımlar
import { Step1Personal, Step2Demographics, Step3Body } from './WizardStepsBasic.jsx';
import { Step4Goals, Step5Diet, Step6Experience, Step7Preferences } from './WizardStepsIntermediate.jsx';
import { Step8Water, LoadingScreen } from './WizardStepsFinal.jsx';

export default function OnboardingWizard({ onComplete, themeColors: C }) {
  // 🧠 Logic tamamen Hook içinden geliyor
  const { t, step, setStep, totalSteps, isCalculating, calcText, form, setForm, handleNext, toggleArrayItem } = useOnboarding(onComplete);

  if (isCalculating) {
    return <LoadingScreen calcText={calcText} C={C} />;
  }

  // Ortak prop aktarımı
  const stepProps = { form, setForm, C, t };

  return (
    <div style={{ height: "100%", overflowY: "auto", background: C.bg, display: "flex", flexDirection: "column", color: C.text, fontFamily: fonts.body }}>
      
      {/* Arka Plan Efekti */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '70vw', height: '70vw', background: `radial-gradient(circle, ${C.blue}20 0%, transparent 60%)`, filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '70vw', height: '70vw', background: `radial-gradient(circle, ${C.green}1A 0%, transparent 60%)`, filter: 'blur(80px)' }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", width: "100%", padding: "40px 20px" }}>
        
        {/* İlerleme Çubuğu (Progress Bar) */}
        <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i + 1 <= step ? C.green : `rgba(255,255,255,0.1)`, transition: "0.3s" }} />
          ))}
        </div>
        
        {/* Adımlar Ekranı */}
        <AnimatePresence mode="wait">
          {step === 1 && <Step1Personal {...stepProps} />}
          {step === 2 && <Step2Demographics {...stepProps} />}
          {step === 3 && <Step3Body {...stepProps} />}
          {step === 4 && <Step4Goals {...stepProps} />}
          {step === 5 && <Step5Diet {...stepProps} />}
          {step === 6 && <Step6Experience {...stepProps} />}
          {step === 7 && <Step7Preferences form={form} toggleArrayItem={toggleArrayItem} C={C} t={t} />}
          {step === 8 && <Step8Water {...stepProps} />}
        </AnimatePresence>

        {/* Aksiyon Butonları */}
        <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} style={{ background: "rgba(0,0,0,0.3)", color: C.text, border: `1px solid ${C.border}60`, padding: "16px 24px", borderRadius: 20, fontWeight: 900, cursor: "pointer", fontFamily: fonts.header }}>
              {t('wiz_btn_back') || "Geri"}
            </button>
          )}
          <button onClick={handleNext} style={{ flex: 1, background: `linear-gradient(135deg, ${C.green}, #22c55e)`, color: "#000", border: "none", padding: "16px 24px", borderRadius: 20, fontWeight: 900, cursor: "pointer", fontSize: 16, fontFamily: fonts.header, boxShadow: `0 10px 30px ${C.green}40` }}>
            {step === totalSteps ? (t('wiz_btn_create') || "Planı Oluştur") : (t('wiz_btn_next') || "İleri")}
          </button>
        </div>

      </div>
    </div>
  );
}