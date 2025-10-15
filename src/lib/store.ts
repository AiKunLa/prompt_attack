import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { AttackTestResult, DefenseLevel } from '@/types';

/**
 * Attack Test Store
 * Manages attack test state and history
 */
interface AttackTestStore {
  // Current test state
  currentTest: {
    input: string;
    defenseLevel: DefenseLevel;
    isLoading: boolean;
    result: AttackTestResult | null;
    error: string | null;
  };

  // Test history (client-side cache)
  history: AttackTestResult[];

  // Actions
  setInput: (input: string) => void;
  setDefenseLevel: (level: DefenseLevel) => void;
  setLoading: (loading: boolean) => void;
  setResult: (result: AttackTestResult | null) => void;
  setError: (error: string | null) => void;
  addToHistory: (result: AttackTestResult) => void;
  clearHistory: () => void;
  reset: () => void;
}

const initialState = {
  currentTest: {
    input: '',
    defenseLevel: 'MEDIUM' as DefenseLevel,
    isLoading: false,
    result: null,
    error: null,
  },
  history: [],
};

export const useAttackTestStore = create<AttackTestStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setInput: (input) =>
          set((state) => ({
            currentTest: { ...state.currentTest, input },
          })),

        setDefenseLevel: (level) =>
          set((state) => ({
            currentTest: { ...state.currentTest, defenseLevel: level },
          })),

        setLoading: (loading) =>
          set((state) => ({
            currentTest: { ...state.currentTest, isLoading: loading },
          })),

        setResult: (result) =>
          set((state) => ({
            currentTest: { ...state.currentTest, result, error: null },
          })),

        setError: (error) =>
          set((state) => ({
            currentTest: { ...state.currentTest, error, result: null },
          })),

        addToHistory: (result) =>
          set((state) => ({
            history: [result, ...state.history].slice(0, 50), // Keep last 50
          })),

        clearHistory: () => set({ history: [] }),

        reset: () => set(initialState),
      }),
      {
        name: 'attack-test-storage',
        partialize: (state) => ({ history: state.history }),
      }
    )
  )
);

/**
 * UI Store
 * Manages UI state (theme, modals, etc.)
 */
interface UIStore {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        theme: 'system',
        sidebarOpen: true,

        setTheme: (theme) => set({ theme }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      }),
      {
        name: 'ui-storage',
      }
    )
  )
);

