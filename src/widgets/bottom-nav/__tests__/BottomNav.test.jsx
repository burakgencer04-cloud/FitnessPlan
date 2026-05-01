// src/widgets/bottom-nav/__tests__/BottomNav.test.jsx

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // 🔥 FIX: DOM Matcher'ları (toBeInTheDocument, toHaveStyle) eklendi!
import { BottomNav } from '../BottomNav.jsx';
import { HapticEngine, SoundEngine } from '@/shared/lib/hapticSoundEngine.js';

// --- MOCK'LAR ---
vi.mock('@/shared/lib/hapticSoundEngine.js', () => ({
  HapticEngine: { light: vi.fn(), medium: vi.fn() },
  SoundEngine: { tick: vi.fn() }
}));

// Framer motion'ın testleri yavaşlatmaması ve doğru render alması için minimal mock
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, whileTap, style, ...props }) => (
      <button onClick={onClick} style={style} data-testid="motion-button" {...props}>
        {children}
      </button>
    )
  }
}));

describe('BottomNav Component', () => {
  const mockOnTabChange = vi.fn();
  const mockTheme = { card: '#111', border: '#222', green: '#0f0', mute: '#888', sub: '#aaa' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Tüm 5 sekmeyi doğru ikon ve isimlerle render etmeli', () => {
    render(<BottomNav activeTab={0} onTabChange={mockOnTabChange} themeColors={mockTheme} />);
    
    expect(screen.getByText('Antrenman')).toBeInTheDocument();
    expect(screen.getByText('Beslenme')).toBeInTheDocument();
    expect(screen.getByText('İlerleme')).toBeInTheDocument();
    expect(screen.getByText('Topluluk')).toBeInTheDocument();
    expect(screen.getByText('Profilim')).toBeInTheDocument();
  });

  it('Aktif sekme görsel olarak farklı (highlight) olmalı', () => {
    render(<BottomNav activeTab={1} onTabChange={mockOnTabChange} themeColors={mockTheme} />);
    
    // activeTab 1 -> Beslenme. Renginin 'green' (#0f0) olmasını bekliyoruz
    const nutritionText = screen.getByText('Beslenme');
    expect(nutritionText).toHaveStyle({ color: 'rgb(0, 255, 0)' }); // #0f0'ın RGB karşılığı

    // Aktif olmayan bir sekmenin (örn: İlerleme) rengi 'sub' (#aaa) olmalı
    const progressText = screen.getByText('İlerleme');
    expect(progressText).toHaveStyle({ color: 'rgb(170, 170, 170)' }); // #aaa'nın RGB karşılığı
  });

  it('Sekmeye tıklandığında onTabChange, HapticEngine ve SoundEngine tetiklenmeli', () => {
    render(<BottomNav activeTab={0} onTabChange={mockOnTabChange} themeColors={mockTheme} />);
    
    const profileTab = screen.getByText('Profilim').closest('button');
    fireEvent.click(profileTab);

    // Sekme ID'si 4 (Profilim) olarak onTabChange çağrılmalı
    expect(mockOnTabChange).toHaveBeenCalledWith(4);
    
    // Donanımsal geri bildirimler tetiklenmeli
    expect(HapticEngine.light).toHaveBeenCalledTimes(1);
    expect(SoundEngine.tick).toHaveBeenCalledTimes(1);
  });
});