import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { AttackType, DefenseLevel } from '@/types/supabase';

/**
 * Attack Test Item
 */
interface AttackTestItem {
  id: string;
  attackType: AttackType;
  defenseLevel: DefenseLevel;
  inputText: string;
  outputText: string | null;
  isBlocked: boolean;
  timestamp: Date;
}

/**
 * Attack Test Store
 * Manages attack test state and history
 */
interface AttackTestStore {
  // Current test state
  currentTestId: string | null;
  tests: Record<string, AttackTestItem>;

  // Actions
  addTest: (test: AttackTestItem) => void;
  removeTest: (id: string) => void;
  setCurrentTest: (id: string | null) => void;
  clearTests: () => void;
}

const initialState = {
  currentTestId: null,
  tests: {},
};

export const useStore = create<AttackTestStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        addTest: (test) =>
          set((state) => ({
            tests: { ...state.tests, [test.id]: test },
            currentTestId: test.id,
          })),

        removeTest: (id) =>
          set((state) => {
            const { [id]: _, ...rest } = state.tests;
            return {
              tests: rest,
              currentTestId: state.currentTestId === id ? null : state.currentTestId,
            };
          }),

        setCurrentTest: (id) => set({ currentTestId: id }),

        clearTests: () => set(initialState),
      }),
      {
        name: 'attack-test-storage',
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

