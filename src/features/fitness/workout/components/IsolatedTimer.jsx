// src/features/fitness/workout/components/IsolatedTimer.jsx
import React from 'react';
import { useWorkoutTimerStore } from '../hooks/useWorkoutTimer.js';

export const IsolatedWorkoutTimer = React.memo(({ style }) => {
    // Sadece 'sec' değiştiğinde render olur
    const sec = useWorkoutTimerStore(s => s.sec);
    const fmt = useWorkoutTimerStore(s => s.fmt);
    
    return (
        <span style={style}>
            {fmt(sec)}
        </span>
    );
});