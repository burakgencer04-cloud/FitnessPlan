import { renderHook, act } from "@testing-library/react";
import { useWorkoutSessionManager } from "./useWorkoutSessionManager.js";
import { useAppStore } from "@/app/store.js";

describe("useWorkoutSessionManager Hook", () => {
  // Her testten önce Zustand store'unu temizleyerek test izolasyonu sağlıyoruz
  beforeEach(() => {
    useAppStore.setState({
      dynamicSetCounts: {},
      swappedExercises: {},
      sessionSets: {},
      isSessionActive: true,
      sessionPhase: 1,
    });
  });

  const mockProgram = {
    exercises: [
      { name: "Squat", sets: "3", reps: "10" },
      { name: "Bench Press", sets: "3", reps: "10" }
    ]
  };

  it("hook başlatıldığında çökmemeli (Render testi)", () => {
    const { result } = renderHook(() => useWorkoutSessionManager(mockProgram));
    expect(result.current).toBeDefined();
    expect(typeof result.current.addSet).toBe("function");
  });

  it("addSet çağrıldığında store güncellenmeli ve uygulama ÇÖKMEMELİ (Crash Fix Verify)", () => {
    const { result } = renderHook(() => useWorkoutSessionManager(mockProgram));

    // 2.1'de çözdüğümüz bug'ın testi: addSet çalıştırıldığında hata fırlatmamalı
    expect(() => {
      act(() => {
        // İlk egzersiz (index: 0) için set ekle
        result.current.addSet(0);
      });
    }).not.toThrow();

    // Store'un gerçekten güncellendiğini doğrula
    const state = useAppStore.getState();
    expect(state.dynamicSetCounts[0]).toBeDefined();
  });

  it("swapExercise çağrıldığında egzersiz değişmeli ve ÇÖKMEMELİ", () => {
    const { result } = renderHook(() => useWorkoutSessionManager(mockProgram));

    expect(() => {
      act(() => {
        // İlk egzersizi (index: 0) "Leg Press" ile değiştir
        result.current.swapExercise(0, { name: "Leg Press", sets: "3", reps: "12" });
      });
    }).not.toThrow();

    const state = useAppStore.getState();
    expect(state.swappedExercises[0].name).toBe("Leg Press");
  });
});