import { useCallback } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export function useHaptics() {
  const lightTap = useCallback(async () => {
    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch(e){}
  }, []);

  const mediumTap = useCallback(async () => {
    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch(e){}
  }, []);

  const heavyImpact = useCallback(async () => {
    try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch(e){}
  }, []);

  const successPulse = useCallback(async () => {
    try { await Haptics.notification({ type: NotificationType.Success }); } catch(e){}
  }, []);

  const warningPulse = useCallback(async () => {
    try { await Haptics.notification({ type: NotificationType.Warning }); } catch(e){}
  }, []);

  return { lightTap, mediumTap, heavyImpact, successPulse, warningPulse };
}