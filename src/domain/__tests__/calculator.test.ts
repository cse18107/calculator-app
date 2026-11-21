import {
  type CalculatorAction,
  type CalculatorState,
  calculatorReducer,
  formatNumber,
  getDisplay,
  getPendingOperator,
  initialCalculatorState,
  type Operator,
} from '../calculator';

// Node typings are not in tsconfig (only Jest types), so declare the one `fs` call this file uses.
declare const require: (moduleName: 'fs') => {
  readFileSync: (path: string, encoding: 'utf8') => string;
};
const nodeFs = require('fs');

function press(...actions: CalculatorAction[]): CalculatorState {
  return actions.reduce(calculatorReducer, initialCalculatorState);
}

function run(state: CalculatorState, ...actions: CalculatorAction[]): CalculatorState {
  return actions.reduce(calculatorReducer, state);
}

/** Digit and decimal presses for a typed string such as "1250.5". */
function typed(text: string): CalculatorAction[] {
  return [...text].map((char) => (char === '.' ? { type: 'decimal' } : { type: 'digit', digit: char }));
}

const op = (operator: Operator): CalculatorAction => ({ type: 'operator', operator });
const EQUALS: CalculatorAction = { type: 'equals' };
const PERCENT: CalculatorAction = { type: 'percent' };
const SIGN: CalculatorAction = { type: 'toggleSign' };
const CE: CalculatorAction = { type: 'clearEntry' };
const BACKSPACE: CalculatorAction = { type: 'backspace' };

function primary(state: CalculatorState): string {
  return getDisplay(state).primary;
}

describe('initial state and digit entry', () => {
  it('AC-1: starts at 0 with no pending operation', () => {
    expect(primary(initialCalculatorState)).toBe('0');
    expect(initialCalculatorState.operator).toBeNull();
  });

  it('AC-2: replaces the leading 0 with a typed digit', () => {
    expect(primary(press({ type: 'digit', digit: '5' }))).toBe('5');
  });

  it('AC-3: keeps 0 when 0 is pressed on an empty entry', () => {
    expect(primary(press({ type: 'digit', digit: '0' }))).toBe('0');
  });

  it('AC-4: adds one decimal point and ignores a second', () => {
    expect(primary(press(...typed('12.'), { type: 'decimal' }))).toBe('12.');
  });

  it('AC-5: shows 0. when the decimal point is pressed on an empty entry', () => {
    expect(press({ type: 'decimal' }).entry).toBe('0.');
  });

  it('AC-6: ignores digits once the entry has 12 digits', () => {
    const state = press(...typed('123456789012'));
    expect(run(state, { type: 'digit', digit: '9' }).entry).toBe('123456789012');
  });

  it('does not count the decimal point or sign toward the 12-digit limit', () => {
    const state = press(...typed('12345678901.'), SIGN);
    expect(run(state, { type: 'digit', digit: '2' }).entry).toBe('-12345678901.2');
  });
});

describe('operators and equals', () => {
  it('AC-7: 2 × 3 = shows 6', () => {
    expect(primary(press(...typed('2'), op('multiply'), ...typed('3'), EQUALS))).toBe('6');
  });

  it('AC-8: 1,250 + 4,890.50 = shows 6,140.5 (results have no trailing zeros)', () => {
    const state = press(...typed('1250'), op('add'), ...typed('4890.50'), EQUALS);
    expect(primary(state)).toBe('6,140.5');
  });

  it('AC-9: evaluates left to right with no precedence (2 + 3 × 4 = 20)', () => {
    const state = press(...typed('2'), op('add'), ...typed('3'), op('multiply'), ...typed('4'), EQUALS);
    expect(primary(state)).toBe('20');
  });

  it('AC-10: equals again repeats the last operation (2 × 3 = = shows 18)', () => {
    const state = press(...typed('2'), op('multiply'), ...typed('3'), EQUALS, EQUALS);
    expect(primary(state)).toBe('18');
  });

  it('AC-11: a digit after a result starts a new calculation', () => {
    const state = press(...typed('2'), op('multiply'), ...typed('3'), EQUALS, { type: 'digit', digit: '5' });
    expect(primary(state)).toBe('5');
    expect(state.repeat).toBeNull();
  });

  it('AC-12: an operator after a result continues from the result (16 + 4 = shows 20)', () => {
    const state = press(...typed('8'), op('multiply'), ...typed('2'), EQUALS, op('add'), ...typed('4'), EQUALS);
    expect(primary(state)).toBe('20');
  });

  it('FR-5/FR-9 chained operators evaluate the pending operation first', () => {
    const state = press(...typed('2'), op('multiply'), ...typed('3'), op('add'), ...typed('4'), EQUALS);
    expect(primary(state)).toBe('10');
  });

  it('pressing an operator twice replaces the pending operator', () => {
    const state = press(...typed('7'), op('add'), op('multiply'), ...typed('3'), EQUALS);
    expect(primary(state)).toBe('21');
  });

  it('equals with nothing pending leaves the entry unchanged', () => {
    expect(press(...typed('42'), EQUALS).entry).toBe('42');
  });

  it('shows the pending left operand and operator while waiting for a right operand (AC-26)', () => {
    const state = press(...typed('1250'), op('add'));
    expect(getDisplay(state)).toEqual({ primary: '1,250', secondary: '1,250 +', isError: false });
  });

  it('keeps the expression line while the right operand is typed', () => {
    const state = press(...typed('1250'), op('add'), ...typed('4'));
    expect(getDisplay(state)).toEqual({ primary: '4', secondary: '1,250 +', isError: false });
  });
});

describe('expression line during a calculation', () => {
  const OP_SYMBOL: Record<Operator, string> = { add: '+', subtract: '−', multiply: '×', divide: '÷' };

  it.each([
    ['add', '34', '22', '56'],
    ['subtract', '34', '22', '12'],
    ['multiply', '34', '22', '748'],
    ['divide', '34', '22', '1.54545454545'],
  ] as const)('34 → operator → 22 → = keeps the expression until = (%s)', (operator, left, right, result) => {
    let state = press(...typed(left));
    expect(getDisplay(state)).toEqual({ primary: '34', secondary: null, isError: false });

    state = run(state, op(operator));
    expect(getDisplay(state)).toEqual({ primary: '34', secondary: `34 ${OP_SYMBOL[operator]}`, isError: false });

    state = run(state, ...typed(right));
    expect(getDisplay(state)).toEqual({ primary: '22', secondary: `34 ${OP_SYMBOL[operator]}`, isError: false });
    expect(getPendingOperator(state)).toBe(operator);

    state = run(state, EQUALS);
    expect(getDisplay(state)).toEqual({ primary: formatNumber(result), secondary: null, isError: false });
    expect(getPendingOperator(state)).toBeNull();
  });

  it('keeps the expression when the right operand is cleared with CE', () => {
    const state = press(...typed('34'), op('add'), ...typed('22'), { type: 'clearEntry' });
    expect(getDisplay(state)).toEqual({ primary: '0', secondary: '34 +', isError: false });
  });

  it('a chained operator shows the running total as the new expression', () => {
    const state = press(...typed('34'), op('add'), ...typed('22'), op('multiply'));
    expect(getDisplay(state)).toEqual({ primary: '56', secondary: '56 ×', isError: false });
  });

  it('replacing the operator keeps the expression with the new symbol', () => {
    const state = press(...typed('34'), op('add'), op('subtract'));
    expect(getDisplay(state).secondary).toBe('34 −');
  });

  it('is cleared by a completed calculation and by an error', () => {
    expect(getDisplay(press(...typed('5'), op('divide'), ...typed('0'), EQUALS)).secondary).toBeNull();
    expect(getDisplay(press(...typed('34'), op('add'), ...typed('22'), EQUALS)).secondary).toBeNull();
  });
});

describe('sign toggle', () => {
  it('AC-13: toggles the sign of the entry and back', () => {
    const negative = press(...typed('5'), SIGN);
    expect(primary(negative)).toBe('-5');
    expect(primary(press(...typed('5'), SIGN, SIGN))).toBe('5');
  });

  it('AC-14: ignores the sign toggle on 0', () => {
    expect(primary(press(SIGN))).toBe('0');
  });
});

describe('percent', () => {
  it('AC-15: 200 + 10 % shows 20 (percent of the left operand)', () => {
    const state = press(...typed('200'), op('add'), ...typed('10'), PERCENT);
    expect(state.entry).toBe('20');
  });

  it('AC-15: 200 + 10 % = shows 220', () => {
    const state = press(...typed('200'), op('add'), ...typed('10'), PERCENT, EQUALS);
    expect(primary(state)).toBe('220');
  });

  it('AC-16: 50 % with no pending operation shows 0.5', () => {
    expect(primary(press(...typed('50'), PERCENT))).toBe('0.5');
  });

  it('percent while waiting for a right operand changes nothing', () => {
    const state = press(...typed('200'), op('add'), PERCENT);
    expect(state.entry).toBe('200');
  });
});

describe('clear entry and backspace', () => {
  it('AC-17: CE sets the entry to 0 and keeps the pending operation and left operand', () => {
    const state = press(...typed('7'), op('add'), ...typed('3'), CE);
    expect(state.entry).toBe('0');
    expect(state.operator).toBe('add');
    expect(state.left).toBe(7);
    expect(run(state, EQUALS).entry).toBe('7');
  });

  it('AC-18: backspace removes the last digit', () => {
    expect(primary(press(...typed('123'), BACKSPACE))).toBe('12');
  });

  it('AC-19: backspace on the last digit leaves 0', () => {
    expect(primary(press(...typed('5'), BACKSPACE))).toBe('0');
  });

  it('backspace on a negative single digit leaves 0, not "-"', () => {
    expect(primary(press(...typed('5'), SIGN, BACKSPACE))).toBe('0');
  });

  it('AC-20: backspace after a result does not change it', () => {
    const state = press(...typed('2'), op('multiply'), ...typed('3'), EQUALS);
    expect(run(state, BACKSPACE)).toBe(state);
  });
});

describe('errors and number limits', () => {
  it('AC-21: division by zero shows Error', () => {
    const state = press(...typed('5'), op('divide'), ...typed('0'), EQUALS);
    expect(primary(state)).toBe('Error');
    expect(getDisplay(state).isError).toBe(true);
  });

  it('division of 0 by 0 shows Error', () => {
    expect(primary(press(...typed('0'), op('divide'), ...typed('0'), EQUALS))).toBe('Error');
  });

  it('AC-22: in the error state digits are ignored and CE recovers to 0', () => {
    const errored = press(...typed('5'), op('divide'), ...typed('0'), EQUALS);
    const ignored = run(errored, { type: 'digit', digit: '7' });
    expect(primary(ignored)).toBe('Error');
    expect(primary(run(ignored, CE))).toBe('0');
    expect(run(errored, CE).operator).toBeNull();
  });

  it('AC-23: 0.1 + 0.2 = shows 0.3 (12-digit rounding)', () => {
    const state = press(...typed('0.1'), op('add'), ...typed('0.2'), EQUALS);
    expect(primary(state)).toBe('0.3');
  });

  it('AC-24: a result beyond 999999999999 shows Error', () => {
    const state = press(...typed('999999999999'), op('add'), ...typed('1'), EQUALS);
    expect(primary(state)).toBe('Error');
  });

  it('a result that is too small for the display becomes 0', () => {
    const state = press(...typed('0.000000000001'), op('divide'), ...typed('1000'), EQUALS);
    expect(state.entry).toBe('0');
  });

  it('expands very small results without exponent notation', () => {
    const state = press(...typed('0.0000001'), op('multiply'), ...typed('1'), EQUALS);
    expect(state.entry).toBe('0.0000001');
  });

  it('1 ÷ 3 is rounded to 12 significant digits', () => {
    expect(primary(press(...typed('1'), op('divide'), ...typed('3'), EQUALS))).toBe('0.333333333333');
  });
});

describe('formatNumber (AC-25)', () => {
  it('groups thousands and keeps the decimal part', () => {
    expect(formatNumber('1234567.5')).toBe('1,234,567.5');
  });

  it('keeps a trailing decimal point while typing', () => {
    expect(formatNumber('1250.')).toBe('1,250.');
  });

  it('keeps the sign and leaves short numbers unchanged', () => {
    expect(formatNumber('-999')).toBe('-999');
    expect(formatNumber('-1234')).toBe('-1,234');
  });
});

describe('engine independence (AC-29)', () => {
  it('calculator.ts imports nothing from React or React Native', () => {
    // Jest runs from the project root.
    const source = nodeFs.readFileSync('src/domain/calculator.ts', 'utf8');
    expect(source).not.toMatch(/from ['"]react/);
    expect(source).not.toMatch(/require\(['"]react/);
  });
});

describe('completed calculations (history recording)', () => {
  const multiply: CalculatorAction = { type: 'operator', operator: 'multiply' };
  const add: CalculatorAction = { type: 'operator', operator: 'add' };
  const subtract: CalculatorAction = { type: 'operator', operator: 'subtract' };
  const divide: CalculatorAction = { type: 'operator', operator: 'divide' };
  const equals: CalculatorAction = { type: 'equals' };

  it('AC-1: 2 × 3 = completes with expression "2 × 3 =" and result 6', () => {
    const state = press(...typed('2'), multiply, ...typed('3'), equals);
    expect(state.lastCompletion).toEqual({ expression: '2 × 3 =', result: '6' });
  });

  it('AC-2: 2 × 3 + 4 = records the whole chain as one completion', () => {
    const state = press(...typed('2'), multiply, ...typed('3'), add, ...typed('4'), equals);
    expect(state.lastCompletion).toEqual({ expression: '2 × 3 + 4 =', result: '10' });
  });

  it('AC-3: repeated equals completes with the previous result, operator and operand', () => {
    const once = press(...typed('2'), multiply, ...typed('3'), equals);
    const repeated = run(once, equals);
    expect(repeated.lastCompletion).toEqual({ expression: '6 × 3 =', result: '18' });
    expect(primary(repeated)).toBe('18');
  });

  it('AC-4: percent used as the right operand is recorded with the operand actually used', () => {
    const state = press(...typed('200'), add, ...typed('10'), { type: 'percent' }, equals);
    expect(state.lastCompletion).toEqual({ expression: '200 + 20 =', result: '220' });
  });

  it('AC-5: a calculation that shows Error is not recorded', () => {
    const state = press(...typed('5'), divide, ...typed('0'), equals);
    expect(state.status).toBe('error');
    expect(state.lastCompletion).toBeNull();
  });

  it('AC-6: keys other than equals never complete a calculation', () => {
    const state = press(
      ...typed('5'),
      add,
      ...typed('3'),
      { type: 'percent' },
      { type: 'toggleSign' },
      { type: 'backspace' },
      { type: 'clearEntry' },
    );
    expect(state.lastCompletion).toBeNull();
  });

  it('AC-7: 1250 + 4890.5 = uses thousands separators in the expression and plain result', () => {
    const state = press(...typed('1250'), add, ...typed('4890.5'), equals);
    expect(state.lastCompletion).toEqual({ expression: '1,250 + 4,890.5 =', result: '6140.5' });
    expect(primary(state)).toBe('6,140.5');
  });

  it('AC-35: equals with nothing pending returns the same state and records nothing', () => {
    expect(calculatorReducer(initialCalculatorState, equals)).toBe(initialCalculatorState);
  });

  it('AC-35: equals while the display shows an error does not record', () => {
    const errored = press(...typed('5'), divide, ...typed('0'), equals);
    expect(calculatorReducer(errored, equals)).toBe(errored);
  });

  it('a completion is cleared by the next key press, so it is recorded once', () => {
    const completed = press(...typed('2'), multiply, ...typed('3'), equals);
    expect(completed.lastCompletion).not.toBeNull();
    expect(calculatorReducer(completed, { type: 'digit', digit: '9' }).lastCompletion).toBeNull();
  });

  it('replacing an operator keeps only the new operator in the expression', () => {
    const state = press(...typed('2'), add, multiply, ...typed('3'), equals);
    expect(state.lastCompletion).toEqual({ expression: '2 × 3 =', result: '6' });
  });

  it('clearing the entry mid-calculation keeps the left operand and records the new entry', () => {
    const state = press(...typed('2'), multiply, { type: 'clearEntry' }, ...typed('3'), equals);
    expect(state.lastCompletion).toEqual({ expression: '2 × 3 =', result: '6' });
  });

  it('equals right after an operator uses the left operand as the right operand', () => {
    const state = press(...typed('2'), subtract, equals);
    expect(state.lastCompletion).toEqual({ expression: '2 − 2 =', result: '0' });
  });

  it('starting a new calculation after a result drops the earlier expression', () => {
    const completed = press(...typed('2'), multiply, ...typed('3'), equals);
    const next = run(completed, ...typed('4'), add, ...typed('1'), equals);
    expect(next.lastCompletion).toEqual({ expression: '4 + 1 =', result: '5' });
  });
});
