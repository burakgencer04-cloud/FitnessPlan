import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Sentry, Analytics veya Logger gibi sistemlerin testleri patlatmasını engelle
vi.mock('@/shared/lib/logger.js', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), log: vi.fn(), info: vi.fn() }
}));

// LocalStorage Mock
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) { return store[key] || null; },
    setItem: function(key, value) { store[key] = value.toString(); },
    removeItem: function(key) { delete store[key]; },
    clear: function() { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });