/**
 * Standard calculator engine. Pure TypeScript: no React or React Native imports.
 *
 * Operations are evaluated left to right with no operator precedence. Results
 * are rounded to 12 significant digits to remove floating-point noise.
 */

export type Operator = 'add' | 'subtract' | 'multiply' | 'divide';

export type CalculatorAction =
  | { type: 'digit'; digit: string }
  | { type: 'decimal' }
  | { type: 'operator'; operator: Operator }
  | { type: 'equals' }
  | { type: 'percent' }
  | { type: 'toggleSign' }
  | { type: 'clearEntry' }
  | { type: 'backspace' }
  /** Places a value (from memory recall) into the entry, as if it had been typed. */
  | { type: 'recall'; value: number };

/**
 * - `entry`: the user is typing the current number.
 * - `operator`: an operator was just pressed; `entry` holds the left operand.
 * - `result`: the last action produced a result; typing starts a new calculation.
 * - `error`: locked until `clearEntry` resets the engine.
 */
export type CalculatorStatus = 'entry' | 'operator' | 'result' | 'error';

/** A calculation finished by `=`, ready to be recorded in history. */
export type CompletedCalculation = {
  /** Display-formatted expression ending with "=", e.g. "1,250 + 4,890.5 =". */
  expression: string;
  /** Plain decimal string of the result, e.g. "6140.5". */
  result: string;
};

export type CalculatorState = {
  /** Raw entry text without separators, e.g. "12.", "-5", "0". */
  entry: string;
  left: number | null;
  operator: Operator | null;
  /** The last operation and its right operand, used by repeated equals. */
  repeat: { operator: Operator; operand: number } | null;
  status: CalculatorStatus;
  /** Committed operands and operators of the current calculation, e.g. ["2", "×", "3", "+"]. */
  tokens: string[];
  /** Set only by a successful `=`. Every other action clears it. */
  lastCompletion: CompletedCalculation | null;
};

export type DisplayModel = {
  primary: string;
  /** Pending expression such as "1,250 +", shown only while an operator waits for its right operand. */
  secondary: string | null;
  isError: boolean;
};

export const MAX_ENTRY_DIGITS = 12;
const MAX_MAGNITUDE = 999999999999;
const MIN_MAGNITUDE = 1e-12;

const OPERATOR_SYMBOLS: Record<Operator, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
};

export const initialCalculatorState: CalculatorState = {
  entry: '0',
  left: null,
  operator: null,
  repeat: null,
  status: 'entry',
  tokens: [],
  lastCompletion: null,
};

const ERROR_STATE: CalculatorState = { ...initialCalculatorState, status: 'error' };

export function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  if (state.status === 'error') {
    return action.type === 'clearEntry' ? initialCalculatorState : state;
  }

  const next = applyAction(state, action);
  if (action.type === 'equals' || next === state) {
    return next;
  }
  // Only the `=` that produced a completion may carry it; any other action clears it.
  return next.lastCompletion === null ? next : { ...next, lastCompletion: null };
}

function applyAction(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'digit':
      return enterDigit(state, action.digit);
    case 'decimal':
      return enterDecimal(state);
    case 'operator':
      return pressOperator(state, action.operator);
    case 'equals':
      return pressEquals(state);
    case 'percent':
      return pressPercent(state);
    case 'toggleSign':
      return toggleSign(state);
    case 'clearEntry':
      return { ...state, entry: '0', status: 'entry', repeat: null };
    case 'backspace':
      return backspace(state);
    case 'recall':
      return recallValue(state, action.value);
  }
}

/**
 * The number the display currently shows, or null while the display shows an error.
 * Memory operations use this value.
 */
export function getDisplayedValue(state: CalculatorState): number | null {
  if (state.status === 'error') {
    return null;
  }
  const value = Number(state.entry);
  return Number.isFinite(value) ? value : null;
}

/** Rounds a value to the display's 12 significant digits. Returns null when it cannot be shown. */
export function roundToDisplay(raw: number): number | null {
  return finalize(raw);
}

/** Formats a raw entry or result for display: thousands separators, sign and trailing "." kept. */
export function formatNumber(raw: string): string {
  const negative = raw.startsWith('-');
  const unsigned = negative ? raw.slice(1) : raw;
  const dotIndex = unsigned.indexOf('.');
  const integerPart = dotIndex === -1 ? unsigned : unsigned.slice(0, dotIndex);
  const fractionPart = dotIndex === -1 ? null : unsigned.slice(dotIndex + 1);
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const fraction = fractionPart === null ? '' : `.${fractionPart}`;
  return `${negative ? '-' : ''}${grouped}${fraction}`;
}

/**
 * The operator of the calculation in progress, or null. It stays pending from the
 * operator press until `=`, including while the right operand is being typed.
 */
export function getPendingOperator(state: CalculatorState): Operator | null {
  if (state.left === null || state.operator === null) {
    return null;
  }
  return state.status === 'operator' || state.status === 'entry' ? state.operator : null;
}

export function getDisplay(state: CalculatorState): DisplayModel {
  if (state.status === 'error') {
    return { primary: 'Error', secondary: null, isError: true };
  }

  // The expression line (e.g. "34 +") and the current input are independent:
  // the expression is kept while the right operand is typed into the primary value.
  const pending = getPendingOperator(state);
  const secondary =
    pending !== null && state.left !== null
      ? `${formatNumber(toPlainString(state.left))} ${OPERATOR_SYMBOLS[pending]}`
      : null;

  return { primary: formatNumber(state.entry), secondary, isError: false };
}

function enterDigit(state: CalculatorState, digit: string): CalculatorState {
  if (state.status === 'entry') {
    if (countDigits(state.entry) >= MAX_ENTRY_DIGITS) {
      return state;
    }
    const entry = state.entry === '0' ? digit : `${state.entry}${digit}`;
    return { ...state, entry };
  }
  return startEntry(state, digit);
}

function enterDecimal(state: CalculatorState): CalculatorState {
  if (state.status === 'entry') {
    return state.entry.includes('.') ? state : { ...state, entry: `${state.entry}.` };
  }
  return startEntry(state, '0.');
}

/**
 * Begins a new right operand (after an operator) or a new calculation (after a result).
 * After a result, the previous left operand, operator and repeat are discarded.
 */
function startEntry(state: CalculatorState, entry: string): CalculatorState {
  if (state.status === 'result') {
    return { ...initialCalculatorState, entry };
  }
  return { ...state, entry, status: 'entry' };
}

function pressOperator(state: CalculatorState, operator: Operator): CalculatorState {
  if (state.status === 'operator') {
    // Replaces the operator that was just pressed; its operand was already committed.
    return { ...state, operator, tokens: [...state.tokens.slice(0, -1), OPERATOR_SYMBOLS[operator]] };
  }

  // Commit the operand that is on screen, then the operator, to the expression.
  const tokens = [...state.tokens, formatNumber(state.entry), OPERATOR_SYMBOLS[operator]];

  if (state.status === 'entry' && state.operator !== null && state.left !== null) {
    const result = compute(state.left, state.operator, Number(state.entry));
    if (result === null) {
      return ERROR_STATE;
    }
    return {
      entry: toPlainString(result),
      left: result,
      operator,
      repeat: null,
      status: 'operator',
      tokens,
      lastCompletion: null,
    };
  }

  return {
    entry: state.entry,
    left: Number(state.entry),
    operator,
    repeat: null,
    status: 'operator',
    tokens,
    lastCompletion: null,
  };
}

function pressEquals(state: CalculatorState): CalculatorState {
  if (state.operator !== null && state.left !== null && (state.status === 'entry' || state.status === 'operator')) {
    const right = Number(state.entry);
    const result = compute(state.left, state.operator, right);
    if (result === null) {
      return ERROR_STATE;
    }
    const resultText = toPlainString(result);
    return {
      entry: resultText,
      left: null,
      operator: null,
      repeat: { operator: state.operator, operand: right },
      status: 'result',
      tokens: [],
      lastCompletion: {
        expression: [...state.tokens, formatNumber(state.entry), '='].join(' '),
        result: resultText,
      },
    };
  }

  if (state.operator === null && state.repeat !== null && state.status === 'result') {
    const { operator, operand } = state.repeat;
    const result = compute(Number(state.entry), operator, operand);
    if (result === null) {
      return ERROR_STATE;
    }
    const resultText = toPlainString(result);
    return {
      ...state,
      entry: resultText,
      lastCompletion: {
        expression: `${formatNumber(state.entry)} ${OPERATOR_SYMBOLS[operator]} ${formatNumber(toPlainString(operand))} =`,
        result: resultText,
      },
    };
  }

  return state;
}

function pressPercent(state: CalculatorState): CalculatorState {
  if (state.status === 'operator') {
    return state;
  }

  if (state.operator !== null && state.left !== null) {
    const value = finalize((state.left * Number(state.entry)) / 100);
    return value === null ? ERROR_STATE : { ...state, entry: toPlainString(value) };
  }

  const value = finalize(Number(state.entry) / 100);
  return value === null ? ERROR_STATE : { ...state, entry: toPlainString(value), status: 'result' };
}

/**
 * Flips the sign of the entry. While an operator waits for its right operand,
 * the flipped value becomes that right operand, so the entry state changes to `entry`.
 */
function toggleSign(state: CalculatorState): CalculatorState {
  if (Number(state.entry) === 0) {
    return state;
  }
  const entry = state.entry.startsWith('-') ? state.entry.slice(1) : `-${state.entry}`;
  if (state.status === 'operator') {
    return { ...state, entry, status: 'entry' };
  }
  return { ...state, entry };
}

/** Removes the last character of the entry. Ignored after a result, while an operator waits, and in error. */
function backspace(state: CalculatorState): CalculatorState {
  if (state.status !== 'entry') {
    return state;
  }
  const trimmed = state.entry.slice(0, -1);
  const entry = trimmed === '' || trimmed === '-' || trimmed === '-0' ? '0' : trimmed;
  return { ...state, entry };
}

/**
 * Places a recalled value into the entry, using the same rules as typing:
 * after a result it starts a new calculation, after an operator it becomes the
 * right operand, and in the entry state it replaces the current entry.
 */
function recallValue(state: CalculatorState, value: number): CalculatorState {
  if (!Number.isFinite(value)) {
    return state;
  }
  return startEntry(state, toPlainString(value));
}

function compute(left: number, operator: Operator, right: number): number | null {
  switch (operator) {
    case 'add':
      return finalize(left + right);
    case 'subtract':
      return finalize(left - right);
    case 'multiply':
      return finalize(left * right);
    case 'divide':
      return right === 0 ? null : finalize(left / right);
  }
}

/**
 * Rounds to 12 significant digits and checks the display range.
 * Returns `null` when the value cannot be shown (not finite, or too large).
 * Non-zero values smaller than 1e-12 become 0.
 */
function finalize(raw: number): number | null {
  const rounded = Number(raw.toPrecision(MAX_ENTRY_DIGITS));
  if (!Number.isFinite(rounded)) {
    return null;
  }
  if (rounded !== 0 && Math.abs(rounded) < MIN_MAGNITUDE) {
    return 0;
  }
  if (Math.abs(rounded) > MAX_MAGNITUDE) {
    return null;
  }
  return rounded === 0 ? 0 : rounded;
}

/** Converts a number to a plain decimal string, expanding exponent notation (1e-7 -> "0.0000001"). */
function toPlainString(value: number): string {
  if (value === 0) {
    return '0';
  }
  const text = String(value);
  if (!/e/i.test(text)) {
    return text;
  }

  const negative = text.startsWith('-');
  const unsigned = negative ? text.slice(1) : text;
  const [mantissa = '', exponentText = '0'] = unsigned.split(/e/i);
  const exponent = Number(exponentText);
  const dotIndex = mantissa.indexOf('.');
  const integerLength = dotIndex === -1 ? mantissa.length : dotIndex;
  const digits = mantissa.replace('.', '');
  const pointIndex = integerLength + exponent;

  let plain: string;
  if (pointIndex <= 0) {
    plain = `0.${'0'.repeat(-pointIndex)}${digits}`;
  } else if (pointIndex >= digits.length) {
    plain = `${digits}${'0'.repeat(pointIndex - digits.length)}`;
  } else {
    plain = `${digits.slice(0, pointIndex)}.${digits.slice(pointIndex)}`;
  }
  return `${negative ? '-' : ''}${plain}`;
}

/** Counts typed digits. The leading "0" of "0.xxx" is not counted, so "0.000000000001" has 12 digits. */
function countDigits(entry: string): number {
  return entry.replace(/^-?0(?=\.)/, '').replace(/[^0-9]/g, '').length;
}
