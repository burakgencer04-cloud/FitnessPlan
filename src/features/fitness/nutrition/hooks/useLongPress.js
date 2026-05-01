// src/features/fitness/nutrition/hooks/useLongPress.js
import { useState, useRef, useEffect } from 'react';

export function useLongPress(callback, ms = 500) {
  const [startLongPress, setStartLongPress] = useState(false);
  const timerRef = useRef();

  useEffect(() => {
    if (startLongPress) timerRef.current = setTimeout(callback, ms);
    else clearTimeout(timerRef.current);
    return () => clearTimeout(timerRef.current);
  }, [callback, ms, startLongPress]);

  return {
    onPointerDown: () => setStartLongPress(true),
    onPointerUp: () => setStartLongPress(false),
    onPointerLeave: () => setStartLongPress(false),
    onTouchEnd: () => setStartLongPress(false)
  };
}