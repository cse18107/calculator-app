import { type PropsWithChildren, useCallback, useMemo, useReducer } from 'react';

import { type AppAction, type AppState, appReducer, initialAppState } from '@/domain/memory';

import { AppStateContext } from './useAppState';

type TimedAction = { action: AppAction; now: number };

export type AppStateProviderProps = PropsWithChildren<{
  /** Starting state. Tests use it to seed history or the calculator; the app uses the default. */
  initialState?: AppState;
}>;

function timedReducer(state: AppState, { action, now }: TimedAction): AppState {
  return appReducer(state, action, now);
}

/**
 * Holds the single app state (calculator, memory, history). Each dispatched action
 * is stamped with the current time, which the reducer uses only when it records a
 * completed calculation.
 */
export function AppStateProvider({ children, initialState = initialAppState }: AppStateProviderProps) {
  const [state, dispatchTimed] = useReducer(timedReducer, initialState);

  const dispatch = useCallback((action: AppAction) => dispatchTimed({ action, now: Date.now() }), []);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
