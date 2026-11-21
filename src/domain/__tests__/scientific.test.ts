import { formatNumber } from '../calculator';
import {
  type BinaryOperator,
  type ScientificAction,
  type ScientificState,
  getPendingOperator,
  getScientificDisplay,
  initialScientificState,
  scientificReducer,
} from '../scientific';

const digit = (value: string): ScientificAction => ({ type: 'digit', digit: value });
const digits = (value: string): ScientificAction[] => value.split('').map(digit);
const operator = (value: BinaryOperator): ScientificAction => ({ type: 'operator', operator: value });
const fn = (name: 'sin' | 'cos' | 'tan' | 'ln' | 'log' | 'sqrt'): ScientificAction => ({ type: 'function', name });
const EQUALS: ScientificAction = { type: 'equals' };
const OPEN: ScientificAction = { type: 'openParen' };
const CLOSE: ScientificAction = { type: 'closeParen' };
const DEG: ScientificAction = { type: 'toggleAngle' };
const SECOND: ScientificAction = { type: 'toggleSecond' };
const CE: ScientificAction = { type: 'clearEntry' };
const BACKSPACE: ScientificAction = { type: 'backspace' };
const PI: ScientificAction = { type: 'constant', name: 'pi' };
const E: ScientificAction = { type: 'constant', name: 'e' };

/** Runs a sequence of actions from the initial state and returns the final state. */
function press(...actions: ScientificAction[]): ScientificState {
  return actions.reduce(scientificReducer, initialScientificState);
}

/** The primary value on the display after the actions. */
function shown(...actions: ScientificAction[]): string {
  return getScientificDisplay(press(...actions)).primary;
}

describe('scientific engine', () => {
  it('AC-1: starts at 0 with no expression and RAD selected', () => {
    const display = getScientificDisplay(initialScientificState);

    expect(display.primary).toBe('0');
    expect(display.expression).toBe('');
    expect(initialScientificState.angle).toBe('RAD');
  });

  it('AC-3: the deg key toggles between RAD and DEG', () => {
    expect(press(DEG).angle).toBe('DEG');
    expect(press(DEG, DEG).angle).toBe('RAD');
  });

  it('AC-4: 2nd then sin appends sin⁻¹( and clears the 2nd arm', () => {
    const state = press(SECOND, fn('sin'));

    expect(getScientificDisplay(state).expression).toBe('sin⁻¹(');
    expect(state.secondArmed).toBe(false);
  });

  it('FR-6: 2nd pressed twice cancels the arm', () => {
    expect(press(SECOND, SECOND).secondArmed).toBe(false);
  });

  it('AC-5: the expression line shows the tokens typed so far', () => {
    const state = press(digit('2'), operator('add'), digit('3'), operator('multiply'));

    expect(getScientificDisplay(state).expression).toBe('2 + 3 ×');
    expect(getPendingOperator(state)).toBe('multiply');
  });

  it('AC-6: multiplication binds before addition', () => {
    expect(shown(digit('2'), operator('add'), digit('3'), operator('multiply'), digit('4'), EQUALS)).toBe('14');
  });

  it('AC-7: brackets change the order of evaluation', () => {
    expect(shown(OPEN, digit('2'), operator('add'), digit('3'), CLOSE, operator('multiply'), digit('4'), EQUALS)).toBe(
      '20',
    );
  });

  it('AC-8: sin(30) in DEG shows 0.5', () => {
    const state = press(DEG, fn('sin'), ...digits('30'), CLOSE, EQUALS);

    expect(getScientificDisplay(state).primary).toBe('0.5');
    expect(getScientificDisplay(state).expression).toBe('sin(30) =');
  });

  it('AC-9: an open bracket is closed at = (sin(30 gives 0.5 in DEG)', () => {
    expect(shown(DEG, fn('sin'), ...digits('30'), EQUALS)).toBe('0.5');
  });

  it('AC-10: π × 2 shows 6.283185307 (10 significant digits)', () => {
    expect(shown(PI, operator('multiply'), digit('2'), EQUALS)).toBe('6.283185307');
  });

  it('AC-11: √9 is 3 and 3 squared is 9', () => {
    expect(shown(fn('sqrt'), digit('9'), EQUALS)).toBe('3');
    expect(shown(digit('3'), { type: 'square' }, EQUALS)).toBe('9');
  });

  it('AC-12: log(100) is 2 and ln(e) is 1', () => {
    expect(shown(fn('log'), ...digits('100'), EQUALS)).toBe('2');
    expect(shown(fn('ln'), E, CLOSE, EQUALS)).toBe('1');
  });

  it('AC-13: 1 ÷ 3 shows 0.3333333333', () => {
    expect(shown(digit('1'), operator('divide'), digit('3'), EQUALS)).toBe('0.3333333333');
  });

  it('AC-14: division by zero shows Error', () => {
    expect(shown(digit('5'), operator('divide'), digit('0'), EQUALS)).toBe('Error');
  });

  it('AC-15: √ of a negative, ln(0) and asin(2) show Error', () => {
    expect(shown(fn('sqrt'), operator('subtract'), digit('4'), EQUALS)).toBe('Error');
    expect(shown(fn('ln'), digit('0'), EQUALS)).toBe('Error');
    expect(shown(SECOND, fn('sin'), digit('2'), EQUALS)).toBe('Error');
  });

  it('AC-16: tan(90) in DEG shows Error', () => {
    expect(shown(DEG, fn('tan'), ...digits('90'), EQUALS)).toBe('Error');
  });

  it('AC-16: tan(π/2) in RAD shows Error', () => {
    expect(shown(fn('tan'), PI, operator('divide'), digit('2'), EQUALS)).toBe('Error');
  });

  it('AC-17: in the error state only CE is accepted, and it resets to 0', () => {
    const errored = press(digit('5'), operator('divide'), digit('0'), EQUALS);

    expect(scientificReducer(errored, digit('7'))).toBe(errored);
    const cleared = scientificReducer(errored, CE);
    expect(getScientificDisplay(cleared).primary).toBe('0');
    expect(getScientificDisplay(cleared).expression).toBe('');
  });

  it('AC-18: CE clears the number being typed and keeps the pending operator', () => {
    const state = press(digit('1'), digit('2'), operator('add'), digit('3'), digit('4'), CE);

    expect(getScientificDisplay(state).primary).toBe('0');
    expect(getScientificDisplay(state).expression).toBe('12 +');
  });

  it('AC-19: backspace removes a digit, and removes a whole function token when nothing is typed', () => {
    expect(shown(digit('1'), digit('2'), digit('3'), BACKSPACE)).toBe('12');
    expect(getScientificDisplay(press(fn('sin'), BACKSPACE)).expression).toBe('');
  });

  it('AC-20: after = a new operator continues from the result', () => {
    const result = press(digit('8'), operator('add'), digit('4'), EQUALS);

    expect(getScientificDisplay(result).primary).toBe('12');
    expect(getScientificDisplay(result).expression).toBe('8 + 4 =');
    expect(
      getScientificDisplay(scientificReducer(scientificReducer(result, operator('multiply')), digit('2'))).expression,
    ).toBe('12 × 2');
    expect(
      getScientificDisplay(
        press(digit('8'), operator('add'), digit('4'), EQUALS, operator('multiply'), digit('2'), EQUALS),
      ).primary,
    ).toBe('24');
  });

  it('AC-21: 50 % then = shows 0.5', () => {
    expect(shown(digit('5'), digit('0'), { type: 'percent' }, EQUALS)).toBe('0.5');
  });

  it('AC-22: the sign key negates the number being typed, and does nothing when no number is typed', () => {
    expect(shown(digit('5'), { type: 'toggleSign' })).toBe('-5');
    expect(press({ type: 'toggleSign' })).toBe(initialScientificState);
  });

  it('AC-23: thousands separators are added to the display value', () => {
    expect(formatNumber('1234567.5')).toBe('1,234,567.5');
  });

  it('AC-24: the scientific engine imports no React or React Native module', () => {
    // Jest runs from the project root. Only `fs` is declared here, because the project has no Node type definitions.
    const fileSystem = jest.requireActual<{ readFileSync: (path: string, encoding: 'utf8') => string }>('fs');
    const source = fileSystem.readFileSync('src/domain/scientific.ts', 'utf8');

    expect(source).not.toMatch(/from ['"](react|react-native)/);
  });

  it('FR-9: a result is rounded to 10 significant digits', () => {
    expect(shown(digit('2'), operator('divide'), digit('3'), EQUALS)).toBe('0.6666666667');
  });

  it('FR-7: the entry holds at most 10 digits', () => {
    expect(shown(...digits('12345678901234'))).toBe('1,234,567,890');
  });

  it('FR-8: an operator replaces the previous operator when no operand is typed', () => {
    expect(shown(digit('5'), operator('add'), operator('multiply'), digit('2'), EQUALS)).toBe('10');
  });

  it('FR-8: a minus at the start is a negative operand', () => {
    expect(shown(operator('subtract'), digit('5'), operator('add'), digit('3'), EQUALS)).toBe('-2');
  });

  it('FR-8: x² binds before × (2 × 3² = 18)', () => {
    expect(shown(digit('2'), operator('multiply'), digit('3'), { type: 'square' }, EQUALS)).toBe('18');
  });

  it('FR-9: = with an open bracket and a trailing operator closes the bracket and drops the operator', () => {
    expect(shown(OPEN, digit('2'), operator('add'), digit('3'), EQUALS)).toBe('5');
    expect(shown(digit('5'), operator('multiply'), EQUALS)).toBe('5');
  });

  it('FR-9: = with an empty expression changes nothing', () => {
    expect(press(EQUALS)).toBe(initialScientificState);
  });

  it('FR-6: 2nd with ln uses eˣ and 2nd with log uses 10ˣ', () => {
    expect(shown(SECOND, fn('ln'), digit('1'), EQUALS)).toBe('2.718281828');
    expect(shown(SECOND, fn('log'), digit('2'), EQUALS)).toBe('100');
  });

  it('FR-7: a digit or constant after π, e or a closing bracket is ignored (no implicit multiplication)', () => {
    expect(getScientificDisplay(press(PI, digit('2'))).expression).toBe('π');
    expect(getScientificDisplay(press(digit('2'), PI)).expression).toBe('2');
  });

  it('FR-17: after = a digit starts a new expression', () => {
    const state = press(digit('8'), operator('add'), digit('4'), EQUALS, digit('5'));

    expect(getScientificDisplay(state).expression).toBe('5');
    expect(getScientificDisplay(state).primary).toBe('5');
  });

  it('FR-13: a result above the 10-digit range shows Error', () => {
    expect(shown(...digits('100000'), operator('multiply'), ...digits('100000'), EQUALS)).toBe('Error');
  });

  it('FR-18: changing the angle mode keeps the expression being typed', () => {
    const state = press(fn('sin'), digit('3'), DEG);

    expect(getScientificDisplay(state).expression).toBe('sin(3');
    expect(state.angle).toBe('DEG');
  });
});
