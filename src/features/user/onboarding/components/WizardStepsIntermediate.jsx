import React from 'react';
import { motion } from 'framer-motion';
import { getSharedStyles, SelectionCard, ExpandableDietCard } from './WizardShared.jsx';
import { POPULAR_DISLIKES, POPULAR_LIKES } from '../hooks/useOnboarding.js';
import { fonts } from '@/shared/ui/uiStyles.js';

export const Step4Goals = ({ form, setForm, C, t }) => (
  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1 }}>
    <h2 style={{ margin: "0 0 12px 0", fontSize: 28, fontWeight: 900, fontFamily: fonts.header }}>{t('wiz_step4_title')}</h2>
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
      <SelectionCard title={t('wiz_goal_lose')} desc={t('wiz_goal_lose_desc')} icon="🔥" isSelected={form.goal === "kilo_ver"} onClick={() => setForm({...form, goal: "kilo_ver"})} color={C.red} C={C} />
      <SelectionCard title={t('wiz_goal_gain')} desc={t('wiz_goal_gain_desc')} icon="🥩" isSelected={form.goal === "kilo_al"} onClick={() => setForm({...form, goal: "kilo_al"})} color={C.blue} C={C} />
      <SelectionCard title={t('wiz_goal_muscle')} desc={t('wiz_goal_muscle_desc')} icon="💪" isSelected={form.goal === "kas_yap"} onClick={() => setForm({...form, goal: "kas_yap"})} color={C.green} C={C} />
    </div>
    <h2 style={{ margin: "0 0 12px 0", fontSize: 20, fontWeight: 900, fontFamily: fonts.header }}>{t('wiz_step4_subtitle')}</h2>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SelectionCard title={t('wiz_act_sed')} desc={t('wiz_act_sed_desc')} icon="💻" isSelected={form.activity === "sedanter"} onClick={() => setForm({...form, activity: "sedanter"})} color={C.mute} C={C} />
      <SelectionCard title={t('wiz_act_mod')} desc={t('wiz_act_mod_desc')} icon="🚶‍♂️" isSelected={form.activity === "orta"} onClick={() => setForm({...form, activity: "orta"})} color={C.yellow} C={C} />
      <SelectionCard title={t('wiz_act_act')} desc={t('wiz_act_act_desc')} icon="⚡" isSelected={form.activity === "aktif"} onClick={() => setForm({...form, activity: "aktif"})} color={C.red} C={C} />
    </div>
  </motion.div>
);

export const Step5Diet = ({ form, setForm, C, t }) => {
  const DIET_OPTIONS = [
    { id: "standart", color: C.blue, icon: "🍽️", title: t('diet_std_title'), shortDesc: t('diet_std_desc'), macros: t('diet_std_mac'), principle: t('diet_std_prin'), benefits: t('diet_std_ben'), risks: t('diet_std_risk'), targetAudience: t('diet_std_aud') },
    { id: "high_protein", color: C.text, icon: "🥩", title: t('diet_pro_title'), shortDesc: t('diet_pro_desc'), macros: t('diet_pro_mac'), principle: t('diet_pro_prin'), benefits: t('diet_pro_ben'), risks: t('diet_pro_risk'), targetAudience: t('diet_pro_aud') },
    { id: "akdeniz", color: C.yellow, icon: "🫒", title: t('diet_med_title'), shortDesc: t('diet_med_desc'), macros: t('diet_med_mac'), principle: t('diet_med_prin'), benefits: t('diet_med_ben'), risks: t('diet_med_risk'), targetAudience: t('diet_med_aud') },
    { id: "keto", color: C.red, icon: "🥑", title: t('diet_keto_title'), shortDesc: t('diet_keto_desc'), macros: t('diet_keto_mac'), principle: t('diet_keto_prin'), benefits: t('diet_keto_ben'), risks: t('diet_keto_risk'), targetAudience: t('diet_keto_aud') },
    { id: "if", color: C.mute, icon: "⏱️", title: t('diet_if_title'), shortDesc: t('diet_if_desc'), macros: t('diet_if_mac'), principle: t('diet_if_prin'), benefits: t('diet_if_ben'), risks: t('diet_if_risk'), targetAudience: t('diet_if_aud') }
  ];

  return (
    <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1 }}>
      <h2 style={{ margin: "0 0 12px 0", fontSize: 28, fontWeight: 900, fontFamily: fonts.header }}>{t('wiz_step5_title')}</h2>
      <p style={{ margin: "0 0 24px 0", fontSize: 15, color: C.sub }}>{t('wiz_step5_desc')}</p>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {DIET_OPTIONS.map(diet => (<ExpandableDietCard key={diet.id} diet={diet} C={C} t={t} color={diet.color} isSelected={form.dietType === diet.id} onClick={() => setForm({...form, dietType: diet.id})} />))}
      </div>
    </motion.div>
  );
};

export const Step6Experience = ({ form, setForm, C, t }) => {
  const { labelStyle } = getSharedStyles(C);
  return (
    <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1 }}>
      <h2 style={{ margin: "0 0 12px 0", fontSize: 28, fontWeight: 900, fontFamily: fonts.header }}>{t('wiz_step6_title')}</h2>
      <p style={{ margin: "0 0 32px 0", fontSize: 15, color: C.sub }}>{t('wiz_step6_desc')}</p>
      
      <label style={labelStyle}>{t('wiz_lbl_sport_hist')}</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        <SelectionCard title={t('wiz_exp_beg')} desc={t('wiz_exp_beg_desc')} icon="👶" isSelected={form.experience === "beginner"} onClick={() => setForm({...form, experience: "beginner"})} color={C.green} C={C} />
        <SelectionCard title={t('wiz_exp_int')} desc={t('wiz_exp_int_desc')} icon="🧑‍🔧" isSelected={form.experience === "intermediate"} onClick={() => setForm({...form, experience: "intermediate"})} color={C.blue} C={C} />
        <SelectionCard title={t('wiz_exp_adv')} desc={t('wiz_exp_adv_desc')} icon="🦍" isSelected={form.experience === "advanced"} onClick={() => setForm({...form, experience: "advanced"})} color={C.red} C={C} />
      </div>
      
      <label style={labelStyle}>{t('wiz_lbl_train_days')}</label>
      <div style={{ display: "flex", gap: 12 }}>
        {[3, 4, 5].map(d => (
          <button key={d} onClick={() => setForm({...form, days: d})} style={{ flex: 1, background: form.days === d ? C.text : "rgba(0,0,0,0.3)", color: form.days === d ? C.bg : C.mute, border: `1px solid ${form.days === d ? C.text : `${C.border}40`}`, padding: "16px", borderRadius: 16, fontSize: 20, fontWeight: 900, cursor: "pointer", transition: "0.2s" }}>{d} {t('wiz_day')}</button>
        ))}
      </div>
    </motion.div>
  );
};

export const Step7Preferences = ({ form, toggleArrayItem, C, t }) => {
  const { labelStyle } = getSharedStyles(C);
  return (
    <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1 }}>
      <h2 style={{ margin: "0 0 12px 0", fontSize: 28, fontWeight: 900, fontFamily: fonts.header }}>{t('wiz_step7_title')}</h2>
      <p style={{ margin: "0 0 32px 0", fontSize: 15, color: C.sub }}>{t('wiz_step7_desc')}</p>
      
      <label style={{...labelStyle, color: C.red}}>{t('wiz_lbl_dislikes')} 🚫</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
        {POPULAR_DISLIKES.map(item => { const isSelected = form.dislikes.includes(item); return (<button key={item} onClick={() => toggleArrayItem("dislikes", item)} style={{ background: isSelected ? C.red : "rgba(0,0,0,0.3)", color: isSelected ? "#fff" : C.text, border: `1px solid ${isSelected ? C.red : `${C.border}40`}`, padding: "10px 16px", borderRadius: 100, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "0.2s" }}>{item} {isSelected && "❌"}</button>) })}
      </div>
      
      <label style={{...labelStyle, color: C.green}}>{t('wiz_lbl_likes')} ❤️</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24, justifyContent: 'center' }}>
        {POPULAR_LIKES.map(item => { const isSelected = form.likes.includes(item); return (<button key={item} onClick={() => toggleArrayItem("likes", item)} style={{ background: isSelected ? C.green : "rgba(0,0,0,0.3)", color: isSelected ? "#000" : C.text, border: `1px solid ${isSelected ? C.green : `${C.border}40`}`, padding: "10px 16px", borderRadius: 100, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "0.2s" }}>{item} {isSelected && "✅"}</button>) })}
      </div>
    </motion.div>
  );
};