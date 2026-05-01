import React, { lazy, Suspense } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';
import { BottomNav } from '@/widgets/bottom-nav/BottomNav.jsx';
import { TopHeader } from '@/widgets/top-header/TopHeader.jsx';
import { ToastNotification } from '@/widgets/toast-notification/ToastNotification.jsx';
import { TabErrorFallback } from '@/shared/ui/ErrorFallbacks.jsx';
import AuthScreen from '@/features/user/auth/components/AuthScreen.jsx';
import OnboardingWizard from '@/features/user/onboarding/components/OnboardingWizard.jsx';
import GlobalModal from '@/shared/ui/GlobalModal.jsx';
import { fonts } from '@/shared/ui/uiStyles.js';
import { playDing } from "@/features/fitness/workout/hooks/useWorkoutTimer.js";
import { useAppShell } from '@/widgets/app-shell/useAppShell.jsx';

// 🔥 Doğru import yeri burası. (Dosya uzantısının doğruluğundan emin ol)
import { useDataMigration } from '@/shared/hooks/useDataMigration.js';

const TabNutrition = lazy(() => import('@/features/fitness/nutrition/components/TabNutrition.jsx'));
const TabProgram = lazy(() => import('@/features/fitness/workout/components/TabProgram.jsx'));
const TabToday = lazy(() => import('@/features/fitness/workout/components/TabToday.jsx'));
const TabProgress = lazy(() => import("@/features/fitness/progress/components/TabProgress.jsx"));
const TabProfile = lazy(() => import('@/features/user/profile/components/TabProfile.jsx'));
const TabSocial = lazy(() => import('@/features/social/components/TabSocial.jsx'));

const LoadingFallback = ({ C, text }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: C?.bg || '#121212', color: C?.text || '#fff' }}>
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 40, height: 40, borderRadius: "50%", border: `4px solid ${C?.border || '#333'}`, borderTopColor: C?.green || '#2ecc71', marginBottom: 16 }} />
    {text && <div style={{ fontFamily: fonts.body, fontSize: '14px', opacity: 0.8 }}>{text}</div>}
  </div>
);

export default function App() {
  // 🔥 1. ADIM: Veritabanı göçünü (Migration) başlat ve durumunu dinle
  const isMigrating = useDataMigration();
  
  const { state, actions, timers, constants } = useAppShell();
  const { isAuthLoading, currentUser, user, macros, tab, nutDay, toast, C, programs, badges, totalDone, overallPct, dayPlan, shopping } = state;
  const { setTab, setNutDay, handleLogout, handleWizardComplete, regeneratePlan, finishSessionWrapper, handleSelectProgram } = actions;

  const renderContent = () => {
    // 🔥 2. ADIM: Eğer veriler Dexie'ye taşınıyorsa uygulamayı beklet (Loading göster)
    if (isMigrating) return <LoadingFallback C={C} text="Veritabanı optimize ediliyor..." />;
    
    if (isAuthLoading) return <LoadingFallback C={C} />;
    if (!currentUser) return <AuthScreen C={C} />;
    if (!user?.hasCompletedOnboarding) return <OnboardingWizard onComplete={handleWizardComplete} themeColors={C} />;

    return (
      <>
        <ToastNotification toast={toast} themeColors={C} />
        <TopHeader user={user} onLogout={handleLogout} themeColors={C} />

        <div className="scrollable-content" style={{ padding: "24px 20px", paddingBottom: 120 }}>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
              <ErrorBoundary FallbackComponent={(props) => <TabErrorFallback {...props} C={C} />} onReset={() => { if (tab !== 0) setTab(0); }}>
                <Suspense fallback={<LoadingFallback C={C} />}>
                  {tab === 0 && (
                    <TabToday timer={timers.timer} restT={timers.restT} finishSession={finishSessionWrapper} themeColors={C} playDing={playDing} />
                  )}
                  {tab === 1 && (
                    <TabNutrition user={user} macros={macros} regeneratePlan={regeneratePlan} dayPlan={dayPlan} nutDay={nutDay} setNutDay={setNutDay} themeColors={C} shoppingList={shopping} />
                  )}
                  {tab === 2 && (
                    <TabProgress 
                      totalDone={totalDone} 
                      overallPct={overallPct} 
                      badges={badges} 
                      BADGES={constants.BADGES} 
                      BADGE_ICONS={constants.BADGE_ICONS} 
                      themeColors={C} 
                      hasActiveProgram={programs?.length > 0} 
                      selectedProgram={programs?.find(p => p.id === user?.activePlanId) || programs?.[0]} 
                      onSelectProgram={handleSelectProgram}
                    />
                  )}
                  {tab === 3 && <TabSocial themeColors={C} />}
                  {tab === 4 && <TabProfile themeColors={C} />} 
                </Suspense>
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>

        <BottomNav activeTab={tab} onTabChange={setTab} themeColors={C} />
      </>
    );
  };

  return (
    <div className="mobile-app-wrapper" style={{ background: C?.bg || '#121212', color: C?.text || '#fff', fontFamily: fonts.body, minHeight: '100dvh', position: 'relative' }}>
      {renderContent()}
      {GlobalModal && <GlobalModal C={C} />}
    </div>
  );
}