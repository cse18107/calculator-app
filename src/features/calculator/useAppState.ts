import { createContext, useContext } from 'react';

import type { AppAction, AppState } from '@/domain/memory';

export type AppStateContextValue = {
  state: AppState;
  dispatch: (action: AppAction) => void;
};

export const AppStateContext = createContext<AppStateContextValue | null>(null);

/** Reads the shared calculator, memory, and history state. Must be used inside `AppStateProvider`. */
export function useAppState(): AppStateContextValue {
  const value = useContext(AppStateContext);
  if (value === null) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }
  return value;
}
