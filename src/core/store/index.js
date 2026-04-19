import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createUserSlice } from './userSlice';
import { createWorkoutSlice } from './workoutSlice';
import { createNutritionSlice } from './nutritionSlice';

export const useAppStore = create(
  persist(
    (...a) => ({
      ...createUserSlice(...a),
      ...createWorkoutSlice(...a),
      ...createNutritionSlice(...a),
    }),
    { name: 'fitness-app-vault' }
  )
);