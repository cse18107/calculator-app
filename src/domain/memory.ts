/**
 * Calculator memory (MC, MR, M−, M+). Pure TypeScript: no React imports.
 *
 * Memory is kept beside the calculator state, not inside it. Calculator actions
 * never touch memory, and memory actions never change the calculator except MR,
 * which places the stored value into the entry as typing would.
 */

import {
  type CalculatorAction,
  type CalculatorState,
  calculatorReducer,
  getDisplayedValue,
  initialCalculatorState,
  roundToDisplay,
} from './calculator';

export type MemoryAction =
  { type: 'memoryClear' } | { type: 'memoryRecall' } | { type: 'memoryAdd' } | { type: 'memorySubtract' };

export type AppAction = CalculatorAction | MemoryAction;

export type AppState = {
  calc: CalculatorState;
  /** Stored memory value. 0 means empty. */
  memory: number;
};

export const initialAppState: AppState = {
  calc: initialCalculatorState,
  memory: 0,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'memoryClear':
      return { ...state, memory: 0 };
    case 'memoryAdd':
      return addToMemory(state, 1);
    case 'memorySubtract':
      return addToMemory(state, -1);
    case 'memoryRecall':
      return { ...state, calc: calculatorReducer(state.calc, { type: 'recall', value: state.memory }) };
    default:
      return { ...state, calc: calculatorReducer(state.calc, action) };
  }
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
