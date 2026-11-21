/**
 * Calculator memory (MC, MR, M−, M+) and the single app state. Pure TypeScript: no React imports.
 *
 * Memory is kept beside the calculator state, not inside it. Calculator actions
 * never touch memory, and memory actions never change the calculator except MR,
 * which places the stored value into the entry as typing would.
 *
 * History is part of the same state. A completed `=` is recorded here, in the pure
 * reducer, so no effect is needed.
 */

import {
  type CalculatorAction,
  type CalculatorState,
  calculatorReducer,
  getDisplayedValue,
  initialCalculatorState,
  roundToDisplay,
} from './calculator';
import { type HistoryAction, historyReducer, initialHistoryState, type HistoryState } from './history';

export type MemoryAction =
  { type: 'memoryClear' } | { type: 'memoryRecall' } | { type: 'memoryAdd' } | { type: 'memorySubtract' };

export type AppAction = CalculatorAction | MemoryAction | HistoryAction;

export type AppState = {
  calc: CalculatorState;
  /** Stored memory value. 0 means empty. */
  memory: number;
  history: HistoryState;
};

export const initialAppState: AppState = {
  calc: initialCalculatorState,
  memory: 0,
  history: initialHistoryState,
};

/**
 * `now` is the time of the action in epoch milliseconds. It is used only when a
 * completed calculation is recorded, so the reducer stays deterministic.
 */
export function appReducer(state: AppState, action: AppAction, now: number): AppState {
  switch (action.type) {
    case 'memoryClear':
      return { ...state, memory: 0 };
    case 'memoryAdd':
      return addToMemory(state, 1);
    case 'memorySubtract':
      return addToMemory(state, -1);
    case 'memoryRecall':
      return { ...state, calc: calculatorReducer(state.calc, { type: 'recall', value: state.memory }) };
    case 'record':
    case 'setFilter':
    case 'toggleSelect':
    case 'selectAllVisible':
    case 'clearSelection':
    case 'pinSelected':
    case 'deleteSelected':
    case 'clearAll':
      return { ...state, history: historyReducer(state.history, action) };
    default:
      return applyCalculatorAction(state, action, now);
  }
}

function applyCalculatorAction(state: AppState, action: CalculatorAction, now: number): AppState {
  const calc = calculatorReducer(state.calc, action);
  const completed = calc.lastCompletion;
  // A new completion object means this `=` finished a calculation. An unchanged one means nothing was completed.
  if (completed === null || completed === state.calc.lastCompletion) {
    return { ...state, calc };
  }
  return {
    ...state,
    calc,
    history: historyReducer(state.history, {
      type: 'record',
      expression: completed.expression,
      result: completed.result,
      createdAt: now,
    }),
  };
}

/** True when memory holds a value (the MEM indicator is lit). */
export function hasMemoryValue(state: AppState): boolean {
  return state.memory !== 0;
}

/**
 * Adds (sign 1) or subtracts (sign -1) the displayed number to or from memory.
 * Leaves memory unchanged when the display shows an error or the total cannot be shown.
 */
function addToMemory(state: AppState, sign: 1 | -1): AppState {
  const displayed = getDisplayedValue(state.calc);
  if (displayed === null) {
    return state;
  }
  const total = roundToDisplay(state.memory + sign * displayed);
  return total === null ? state : { ...state, memory: total };
}
