import { useCallback } from 'react';
import { BADGES, BADGE_ICONS } from '@/features/fitness/workout/data/workoutData.js';

export function useBadgeEngine(setBadges, showToast) {
  const checkBadges = useCallback((cw, currentStreak) => {
    setBadges(prevBadges => {
      const newBadgesList = [...prevBadges];
      let hasNewBadge = false;

      BADGES.forEach(b => {
        if (!prevBadges.includes(b.id) && b.check(cw, currentStreak)) {
          newBadgesList.push(b.id);
          hasNewBadge = true;
          if (showToast) showToast(BADGE_ICONS[b.icon] || "🏅", `Rozet: ${b.label}`);
        }
      });
      
      return hasNewBadge ? newBadgesList : prevBadges;
    });
  }, [setBadges, showToast]);

  return { checkBadges };
}