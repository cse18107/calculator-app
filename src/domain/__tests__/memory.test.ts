import { type CalculatorAction, getDisplay, type Operator } from '../calculator';
import { type AppAction, type AppState, appReducer, hasMemoryValue, initialAppState } from '../memory';

function run(actions: AppAction[], state: AppState = initialAppState): AppState {
  return actions.reduce(appReducer, state);
}

/** Digit and decimal presses for a typed string such as "1250.5". Use a leading "±" press for negatives. */
function typed(text: string): CalculatorAction[] {
  return [...text].map((char) => (char === '.' ? { type: 'decimal' } : { type: 'digit', digit: char }));
}

const op = (operator: Operator): CalculatorAction => ({ type: 'operator', operator });
const EQUALS: CalculatorAction = { type: 'equals' };
const PERCENT: CalculatorAction = { type: 'percent' };
const SIGN: CalculatorAction = { type: 'toggleSign' };
const CE: CalculatorAction = { type: 'clearEntry' };
const MC: AppAction = { type: 'memoryClear' };
const MR: AppAction = { type: 'memoryRecall' };
const MMINUS: AppAction = { type: 'memorySubtract' };
const MPLUS: AppAction = { type: 'memoryAdd' };

function shown(state: AppState): string {
  return getDisplay(state.calc).primary;
}

describe('memory initial state', () => {
  it('starts with an empty memory (0) and the MEM indicator off', () => {
    expect(initialAppState.memory).toBe(0);
    expect(hasMemoryValue(initialAppState)).toBe(false);
  });
});

describe('M+ (memory add)', () => {
  it('adds the displayed value to memory', () => {
    const state = run([...typed('5'), MPLUS]);
    expect(state.memory).toBe(5);
    expect(hasMemoryValue(state)).toBe(true);
  });

  it('accumulates over several presses (5 M+ 3 M+ = 8)', () => {
    expect(run([...typed('5'), MPLUS, CE, ...typed('3'), MPLUS]).memory).toBe(8);
  });

  it('leaves the calculator display and expression unchanged', () => {
    const before = run([...typed('1250'), op('add')]);
    const after = run([MPLUS], before);
    expect(after.calc).toEqual(before.calc);
    expect(shown(after)).toBe('1,250');
  });

  it('adds the value of a result after =', () => {
    expect(run([...typed('2'), op('multiply'), ...typed('3'), EQUALS, MPLUS]).memory).toBe(6);
  });

  it('adds the left operand while an operator waits for its right operand', () => {
    expect(run([...typed('7'), op('add'), MPLUS]).memory).toBe(7);
  });

  it('adds decimals without floating-point noise (0.1 M+ 0.2 M+ = 0.3)', () => {
    expect(run([...typed('0.1'), MPLUS, CE, ...typed('0.2'), MPLUS]).memory).toBe(0.3);
  });

  it('adds negative numbers (± then M+ stores -5)', () => {
    expect(run([...typed('5'), SIGN, MPLUS]).memory).toBe(-5);
  });

  it('a value that rounds to zero leaves memory empty', () => {
    expect(run([...typed('0.0000000000001'), MPLUS]).memory).toBe(0);
  });

  it('does nothing while the display shows an error', () => {
    const errored = run([...typed('5'), op('divide'), ...typed('0'), EQUALS]);
    const after = run([MPLUS, MPLUS], errored);
    expect(after.memory).toBe(0);
    expect(after.calc).toEqual(errored.calc);
  });

  it('leaves memory unchanged when the total is too large to store', () => {
    const full = run([...typed('999999999999'), MPLUS]);
    const after = run([CE, ...typed('1'), MPLUS], full);
    expect(full.memory).toBe(999999999999);
    expect(after.memory).toBe(999999999999);
  });
});

describe('M− (memory subtract)', () => {
  it('subtracts the displayed value from memory (5 M+ 2 M− = 3)', () => {
    expect(run([...typed('5'), MPLUS, CE, ...typed('2'), MMINUS]).memory).toBe(3);
  });

  it('can make memory negative (2 M− stores -2)', () => {
    expect(run([...typed('2'), MMINUS]).memory).toBe(-2);
  });

  it('handles decimals (1 M+ 0.25 M− = 0.75)', () => {
    expect(run([...typed('1'), MPLUS, CE, ...typed('0.25'), MMINUS]).memory).toBe(0.75);
  });

  it('subtracting a negative value adds it (5 M+ then -5 M− = 10)', () => {
    expect(run([...typed('5'), MPLUS, CE, ...typed('5'), SIGN, MMINUS]).memory).toBe(10);
  });

  it('leaves the calculator unchanged', () => {
    const before = run([...typed('9'), op('subtract'), ...typed('4')]);
    expect(run([MMINUS], before).calc).toEqual(before.calc);
  });

  it('does nothing while the display shows an error', () => {
    const errored = run([...typed('5'), op('divide'), ...typed('0'), EQUALS]);
    expect(run([MMINUS], errored).memory).toBe(0);
  });

  it('leaves memory unchanged when the total would be below the display range', () => {
    const low = run([...typed('999999999999'), MMINUS]);
    const after = run([CE, ...typed('2'), MMINUS], low);
    expect(low.memory).toBe(-999999999999);
    expect(after.memory).toBe(-999999999999);
  });
});

describe('MR (memory recall)', () => {
  it('shows 0 when memory is empty', () => {
    const state = run([MR]);
    expect(shown(state)).toBe('0');
    expect(state.memory).toBe(0);
  });

  it('shows the stored value on the display', () => {
    expect(shown(run([...typed('1250'), MPLUS, CE, MR]))).toBe('1,250');
  });

  it('replaces the current entry', () => {
    expect(shown(run([...typed('5'), MPLUS, CE, ...typed('99'), MR]))).toBe('5');
  });

  it('keeps memory unchanged', () => {
    expect(run([...typed('5'), MPLUS, CE, MR, MR]).memory).toBe(5);
  });

  it('shows a negative value', () => {
    expect(shown(run([...typed('5'), SIGN, MPLUS, CE, MR]))).toBe('-5');
  });

  it('shows a decimal value without losing digits', () => {
    expect(shown(run([...typed('0.5'), MPLUS, CE, MR]))).toBe('0.5');
  });

  it('after = starts a new calculation with the recalled value', () => {
    const state = run([...typed('5'), MPLUS, CE, ...typed('2'), op('multiply'), ...typed('3'), EQUALS, MR]);
    expect(shown(state)).toBe('5');
    expect(state.calc.operator).toBeNull();
    expect(state.calc.repeat).toBeNull();
  });

  it('after an operator becomes the right operand (7 + MR = 12 when 5 is stored)', () => {
    const state = run([...typed('5'), MPLUS, CE, ...typed('7'), op('add'), MR, EQUALS]);
    expect(shown(state)).toBe('12');
  });

  it('is ignored while the display shows an error, and memory stays intact', () => {
    const errored = run([...typed('5'), MPLUS, CE, ...typed('5'), op('divide'), ...typed('0'), EQUALS]);
    const after = run([MR], errored);
    expect(after.calc).toEqual(errored.calc);
    expect(after.memory).toBe(5);
  });
});

describe('MC (memory clear)', () => {
  it('resets memory to 0 and turns the MEM indicator off', () => {
    const state = run([...typed('5'), MPLUS, MC]);
    expect(state.memory).toBe(0);
    expect(hasMemoryValue(state)).toBe(false);
  });

  it('leaves the calculator unchanged', () => {
    const before = run([...typed('5'), MPLUS, CE, ...typed('9'), op('add')]);
    expect(run([MC], before).calc).toEqual(before.calc);
  });

  it('works while the display shows an error', () => {
    const errored = run([...typed('5'), MPLUS, CE, ...typed('5'), op('divide'), ...typed('0'), EQUALS]);
    expect(run([MC], errored).memory).toBe(0);
  });
});

describe('memory is independent of the calculator', () => {
  it('clear entry (CE) does not clear memory', () => {
    expect(run([...typed('5'), MPLUS, CE]).memory).toBe(5);
  });

  it('clear entry in the error state resets the calculator but keeps memory', () => {
    const errored = run([...typed('5'), MPLUS, CE, ...typed('5'), op('divide'), ...typed('0'), EQUALS]);
    const after = run([CE], errored);
    expect(shown(after)).toBe('0');
    expect(after.memory).toBe(5);
  });

  it('calculator operations do not change memory', () => {
    const state = run([...typed('5'), MPLUS, CE, ...typed('2'), op('add'), ...typed('3'), EQUALS, PERCENT]);
    expect(state.memory).toBe(5);
  });

  it('a recalled value can be used in a new calculation without changing memory', () => {
    const state = run([...typed('4'), MPLUS, CE, MR, op('multiply'), ...typed('2'), EQUALS]);
    expect(shown(state)).toBe('8');
    expect(state.memory).toBe(4);
  });
});
