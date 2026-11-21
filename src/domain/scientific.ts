/**
 * Scientific calculator engine. Pure TypeScript: no React or React Native imports.
 *
 * Input builds an expression of tokens. `=` evaluates it with operator precedence and
 * brackets (spec 03-scientific-mode, FR-8). The standard engine in `calculator.ts` is separate
 * and unchanged.
 */
import { formatNumber } from './calculator';

export type BinaryOperator = 'add' | 'subtract' | 'multiply' | 'divide';
export type Constant = 'pi' | 'e';
/** Function keys on the keypad, before the 2nd key is applied. */
export type FunctionKey = 'sin' | 'cos' | 'tan' | 'ln' | 'log' | 'sqrt';
/** Functions that can appear in an expression, including the 2nd-function variants. */
export type ScientificFunction = FunctionKey | 'asin' | 'acos' | 'atan' | 'exp' | 'pow10';
export type AngleMode = 'RAD' | 'DEG';
/**
 * - `input`: the expression is being built.
 * - `result`: the last `=` produced `entry`; typing starts a new expression.
 * - `error`: locked until `clearEntry` resets the engine.
 */
export type ScientificStatus = 'input' | 'result' | 'error';

export type Token =
  | { kind: 'number'; text: string }
  | { kind: 'constant'; name: Constant }
  | { kind: 'operator'; operator: BinaryOperator }
  | { kind: 'negate' }
  | { kind: 'open' }
  | { kind: 'close' }
  | { kind: 'function'; name: ScientificFunction }
  | { kind: 'square' }
  | { kind: 'percent' };

export type ScientificState = {
  tokens: Token[];
  /** Number being typed, or the result after `=`. Null means nothing is typed and the display shows 0. */
  entry: string | null;
  status: ScientificStatus;
  angle: AngleMode;
  /** Set by the 2nd key. The next sin, cos, tan, ln, log, √x or x² uses its secondary function. */
  secondArmed: boolean;
  /** Expression shown with "=" after a completed calculation. */
  completion: string | null;
};

export type ScientificAction =
  | { type: 'digit'; digit: string }
  | { type: 'decimal' }
  | { type: 'operator'; operator: BinaryOperator }
  | { type: 'openParen' }
  | { type: 'closeParen' }
  | { type: 'constant'; name: Constant }
  | { type: 'function'; name: FunctionKey }
  | { type: 'square' }
  | { type: 'percent' }
  | { type: 'toggleSign' }
  | { type: 'clearEntry' }
  | { type: 'backspace' }
  | { type: 'equals' }
  | { type: 'toggleSecond' }
  | { type: 'toggleAngle' };

export type ScientificDisplayModel = {
  primary: string;
  /** Expression line: the tokens typed so far, or the completed expression with "=". */
  expression: string;
  isError: boolean;
};

/** Typed numbers hold at most this many digits (the design's "10-DIGIT" label). */
export const MAX_TYPED_DIGITS = 10;
const SIGNIFICANT_DIGITS = 10;
/** 9.999999999e+9: the largest result that fits the 10-digit display. */
const MAX_MAGNITUDE = 9999999999;
const MIN_MAGNITUDE = 1e-10;
/** Tolerance for `tan` at an odd multiple of 90 degrees (or π/2 in radians). */
const TAN_POLE_TOLERANCE = 1e-12;

const CONSTANT_VALUES: Record<Constant, number> = { pi: 3.14159265358979, e: 2.71828182845905 };
const CONSTANT_SYMBOLS: Record<Constant, string> = { pi: 'π', e: 'e' };
const OPERATOR_SYMBOLS: Record<BinaryOperator, string> = { add: '+', subtract: '−', multiply: '×', divide: '÷' };
const FUNCTION_SYMBOLS: Record<ScientificFunction, string> = {
  sin: 'sin(',
  cos: 'cos(',
  tan: 'tan(',
  asin: 'sin⁻¹(',
  acos: 'cos⁻¹(',
  atan: 'tan⁻¹(',
  ln: 'ln(',
  log: 'log(',
  exp: 'eˣ(',
  pow10: '10ˣ(',
  sqrt: '√(',
};
/** The function that the 2nd key selects for each function key. */
const SECOND_FUNCTION: Record<FunctionKey, ScientificFunction> = {
  sin: 'asin',
  cos: 'acos',
  tan: 'atan',
  ln: 'exp',
  log: 'pow10',
  sqrt: 'sqrt',
};

const CLOSE: Token = { kind: 'close' };

export const initialScientificState: ScientificState = {
  tokens: [],
  entry: null,
  status: 'input',
  angle: 'RAD',
  secondArmed: false,
  completion: null,
};

export function scientificReducer(state: ScientificState, action: ScientificAction): ScientificState {
  if (state.status === 'error') {
    return action.type === 'clearEntry' ? initialScientificState : state;
  }
  const next = applyAction(state, action);
  // The 2nd arm is used up by the next function key (sin, cos, tan, ln, log, √x, x²).
  return action.type === 'function' || action.type === 'square' ? { ...next, secondArmed: false } : next;
}

function applyAction(state: ScientificState, action: ScientificAction): ScientificState {
  switch (action.type) {
    case 'digit':
      return enterDigit(state, action.digit);
    case 'decimal':
      return enterDecimal(state);
    case 'operator':
      return pressOperator(state, action.operator);
    case 'openParen':
      return pressOpen(state);
    case 'closeParen':
      return pressClose(state);
    case 'constant':
      return pressConstant(state, action.name);
    case 'function':
      return pressFunction(state, action.name);
    case 'square':
      return pressPostfix(state, { kind: 'square' });
    case 'percent':
      return pressPostfix(state, { kind: 'percent' });
    case 'toggleSign':
      return toggleSign(state);
    case 'clearEntry':
      return clearEntry(state);
    case 'backspace':
      return backspace(state);
    case 'equals':
      return pressEquals(state);
    case 'toggleSecond':
      return { ...state, secondArmed: !state.secondArmed };
    case 'toggleAngle':
      return { ...state, angle: state.angle === 'RAD' ? 'DEG' : 'RAD' };
  }
}

/** The display model for the screen: primary value, expression line, and error flag. */
export function getScientificDisplay(state: ScientificState): ScientificDisplayModel {
  if (state.status === 'error') {
    return { primary: 'Error', expression: '', isError: true };
  }
  if (state.status === 'result') {
    return { primary: formatNumber(state.entry ?? '0'), expression: state.completion ?? '', isError: false };
  }
  const items: Token[] = state.entry === null ? state.tokens : [...state.tokens, { kind: 'number', text: state.entry }];
  return { primary: formatNumber(state.entry ?? '0'), expression: renderExpression(items), isError: false };
}

/**
 * The operator the expression is waiting on (its right operand is not finished yet).
 * Used to mark the operator key as selected.
 */
export function getPendingOperator(state: ScientificState): BinaryOperator | null {
  if (state.status !== 'input') {
    return null;
  }
  const last = state.tokens[state.tokens.length - 1];
  return last?.kind === 'operator' ? last.operator : null;
}

/** Renders tokens as the expression line, e.g. "sin(45) + log(100)". */
export function renderExpression(tokens: readonly Token[]): string {
  let text = '';
  for (const token of tokens) {
    text += token.kind === 'operator' ? ` ${OPERATOR_SYMBOLS[token.operator]} ` : tokenSymbol(token);
  }
  return text.trim();
}

function tokenSymbol(token: Token): string {
  switch (token.kind) {
    case 'number':
      return formatNumber(token.text);
    case 'constant':
      return CONSTANT_SYMBOLS[token.name];
    case 'operator':
      return OPERATOR_SYMBOLS[token.operator];
    case 'negate':
      return '−';
    case 'open':
      return '(';
    case 'close':
      return ')';
    case 'function':
      return FUNCTION_SYMBOLS[token.name];
    case 'square':
      return '²';
    case 'percent':
      return '%';
  }
}

function enterDigit(state: ScientificState, digit: string): ScientificState {
  if (state.status === 'result') {
    return freshExpression(state, { entry: digit });
  }
  if (state.entry === null) {
    return endsOperand(lastToken(state.tokens)) ? state : { ...state, entry: digit };
  }
  if (countDigits(state.entry) >= MAX_TYPED_DIGITS) {
    return state;
  }
  return { ...state, entry: state.entry === '0' ? digit : `${state.entry}${digit}` };
}

function enterDecimal(state: ScientificState): ScientificState {
  if (state.status === 'result') {
    return freshExpression(state, { entry: '0.' });
  }
  if (state.entry === null) {
    return endsOperand(lastToken(state.tokens)) ? state : { ...state, entry: '0.' };
  }
  return state.entry.includes('.') ? state : { ...state, entry: `${state.entry}.` };
}

function pressOperator(state: ScientificState, operator: BinaryOperator): ScientificState {
  if (state.status === 'result') {
    // Continue from the result as the first operand.
    return {
      ...state,
      tokens: [
        { kind: 'number', text: state.entry ?? '0' },
        { kind: 'operator', operator },
      ],
      entry: null,
      status: 'input',
      completion: null,
    };
  }

  if (state.entry !== null) {
    return {
      ...state,
      tokens: [...state.tokens, { kind: 'number', text: state.entry }, { kind: 'operator', operator }],
      entry: null,
    };
  }

  const last = lastToken(state.tokens);
  if (last === undefined || last.kind === 'open' || last.kind === 'function' || last.kind === 'negate') {
    // Only a minus sign can start an operand (a negative value).
    if (operator === 'subtract' && last?.kind !== 'negate') {
      return { ...state, tokens: [...state.tokens, { kind: 'negate' }] };
    }
    return state;
  }
  if (last.kind === 'operator') {
    // A minus after an operator is a negative operand. Any other operator replaces the last one.
    if (operator === 'subtract') {
      return { ...state, tokens: [...state.tokens, { kind: 'negate' }] };
    }
    return { ...state, tokens: [...state.tokens.slice(0, -1), { kind: 'operator', operator }] };
  }
  return { ...state, tokens: [...state.tokens, { kind: 'operator', operator }] };
}

function pressOpen(state: ScientificState): ScientificState {
  if (state.status === 'result') {
    return freshExpression(state, { tokens: [{ kind: 'open' }] });
  }
  if (state.entry !== null || endsOperand(lastToken(state.tokens))) {
    return state; // No implicit multiplication: "2(" and "π(" are ignored.
  }
  return { ...state, tokens: [...state.tokens, { kind: 'open' }] };
}

function pressClose(state: ScientificState): ScientificState {
  if (state.status !== 'input' || openDepth(state.tokens) <= 0) {
    return state;
  }
  if (state.entry !== null) {
    return {
      ...state,
      tokens: [...state.tokens, { kind: 'number', text: state.entry }, CLOSE],
      entry: null,
    };
  }
  return endsOperand(lastToken(state.tokens)) ? { ...state, tokens: [...state.tokens, CLOSE] } : state;
}

function pressConstant(state: ScientificState, name: Constant): ScientificState {
  const token: Token = { kind: 'constant', name };
  if (state.status === 'result') {
    return freshExpression(state, { tokens: [token] });
  }
  if (state.entry !== null || endsOperand(lastToken(state.tokens))) {
    return state;
  }
  return { ...state, tokens: [...state.tokens, token] };
}

function pressFunction(state: ScientificState, name: FunctionKey): ScientificState {
  const token: Token = { kind: 'function', name: state.secondArmed ? SECOND_FUNCTION[name] : name };
  if (state.status === 'result') {
    return freshExpression(state, { tokens: [token] });
  }
  if (state.entry !== null || endsOperand(lastToken(state.tokens))) {
    return state;
  }
  return { ...state, tokens: [...state.tokens, token] };
}

/** x² and %: postfix operators that apply to the operand before them. */
function pressPostfix(state: ScientificState, postfix: Token): ScientificState {
  if (state.status === 'result') {
    return {
      ...state,
      tokens: [{ kind: 'number', text: state.entry ?? '0' }, postfix],
      entry: null,
      status: 'input',
      completion: null,
    };
  }
  if (state.entry !== null) {
    return { ...state, tokens: [...state.tokens, { kind: 'number', text: state.entry }, postfix], entry: null };
  }
  return endsOperand(lastToken(state.tokens)) ? { ...state, tokens: [...state.tokens, postfix] } : state;
}

function toggleSign(state: ScientificState): ScientificState {
  if (state.status !== 'input' || state.entry === null || state.entry === '0') {
    return state;
  }
  return { ...state, entry: state.entry.startsWith('-') ? state.entry.slice(1) : `-${state.entry}` };
}

/** CE clears the number being typed. After a result it starts a fresh expression. */
function clearEntry(state: ScientificState): ScientificState {
  if (state.status === 'result') {
    return freshExpression(state, {});
  }
  return state.entry === null ? state : { ...state, entry: null };
}

/** ⌫ removes the last digit of the number being typed, or the last token when nothing is typed. */
function backspace(state: ScientificState): ScientificState {
  if (state.status !== 'input') {
    return state;
  }
  if (state.entry !== null) {
    return { ...state, entry: shortenNumber(state.entry) };
  }
  const removed = lastToken(state.tokens);
  if (removed === undefined) {
    return state;
  }
  const tokens = state.tokens.slice(0, -1);
  if (removed.kind === 'number') {
    return { ...state, tokens, entry: shortenNumber(removed.text) };
  }
  // A number that is now the last token goes back into the entry, so its digits can be edited.
  const tail = lastToken(tokens);
  if (tail?.kind === 'number') {
    return { ...state, tokens: tokens.slice(0, -1), entry: tail.text };
  }
  return { ...state, tokens };
}

function pressEquals(state: ScientificState): ScientificState {
  if (state.status !== 'input') {
    return state;
  }
  const items = stripTrailingOperators(
    state.entry === null ? state.tokens : [...state.tokens, { kind: 'number', text: state.entry }],
  );
  if (items.length === 0) {
    return state;
  }

  const depth = openDepth(items);
  const closed = [...items, ...Array.from({ length: depth }, () => CLOSE)];
  const value = evaluate(closed, state.angle);
  if (value === null) {
    return { ...initialScientificState, angle: state.angle, status: 'error' };
  }
  return {
    ...initialScientificState,
    angle: state.angle,
    entry: toPlainString(value),
    status: 'result',
    completion: `${renderExpression(closed)} =`,
  };
}

/** Starts a new expression after a result, keeping the angle mode and the 2nd arm. */
function freshExpression(state: ScientificState, patch: Partial<ScientificState>): ScientificState {
  return { ...initialScientificState, angle: state.angle, secondArmed: state.secondArmed, ...patch };
}

class CalculationError extends Error {}

/**
 * Evaluates a complete expression (every bracket closed). Returns null when the result is
 * an error: undefined maths, an overflow, or a value outside the display range.
 */
export function evaluate(tokens: readonly Token[], angle: AngleMode): number | null {
  let position = 0;

  function fail(): never {
    throw new CalculationError();
  }

  function peek(): Token | undefined {
    return tokens[position];
  }

  function parseExpression(): number {
    let value = parseTerm();
    let token = peek();
    while (token?.kind === 'operator' && (token.operator === 'add' || token.operator === 'subtract')) {
      position += 1;
      const right = parseTerm();
      value = token.operator === 'add' ? value + right : value - right;
      token = peek();
    }
    return value;
  }

  function parseTerm(): number {
    let value = parseUnary();
    let token = peek();
    while (token?.kind === 'operator' && (token.operator === 'multiply' || token.operator === 'divide')) {
      position += 1;
      const right = parseUnary();
      if (token.operator === 'divide') {
        if (right === 0) {
          fail();
        }
        value /= right;
      } else {
        value *= right;
      }
      token = peek();
    }
    return value;
  }

  function parseUnary(): number {
    if (peek()?.kind === 'negate') {
      position += 1;
      return -parseUnary();
    }
    return parsePostfix();
  }

  function parsePostfix(): number {
    let value = parsePrimary();
    let token = peek();
    while (token?.kind === 'square' || token?.kind === 'percent') {
      position += 1;
      value = token.kind === 'square' ? value * value : value / 100;
      token = peek();
    }
    return value;
  }

  function parsePrimary(): number {
    const token = peek();
    if (token === undefined) {
      fail();
    }
    position += 1;
    switch (token.kind) {
      case 'number': {
        const value = Number(token.text);
        return Number.isFinite(value) ? value : fail();
      }
      case 'constant':
        return CONSTANT_VALUES[token.name];
      case 'open':
        return closeGroup(parseExpression());
      case 'function':
        return applyFunction(token.name, closeGroup(parseExpression()), angle);
      default:
        return fail();
    }
  }

  function closeGroup(value: number): number {
    if (peek()?.kind !== 'close') {
      fail();
    }
    position += 1;
    return value;
  }

  try {
    const value = parseExpression();
    return position === tokens.length ? finalize(value) : null;
  } catch (error) {
    if (error instanceof CalculationError) {
      return null;
    }
    throw error;
  }
}

function applyFunction(name: ScientificFunction, argument: number, angle: AngleMode): number {
  const toRadians = (value: number) => (angle === 'DEG' ? (value * Math.PI) / 180 : value);
  const fromRadians = (value: number) => (angle === 'DEG' ? (value * 180) / Math.PI : value);

  switch (name) {
    case 'sin':
      return Math.sin(toRadians(argument));
    case 'cos':
      return Math.cos(toRadians(argument));
    case 'tan': {
      const radians = toRadians(argument);
      if (Math.abs(Math.cos(radians)) < TAN_POLE_TOLERANCE) {
        throw new CalculationError();
      }
      return Math.tan(radians);
    }
    case 'asin':
      return checkUnit(argument, () => fromRadians(Math.asin(argument)));
    case 'acos':
      return checkUnit(argument, () => fromRadians(Math.acos(argument)));
    case 'atan':
      return fromRadians(Math.atan(argument));
    case 'ln':
      return argument > 0 ? Math.log(argument) : throwCalculation();
    case 'log':
      return argument > 0 ? Math.log10(argument) : throwCalculation();
    case 'exp':
      return Math.exp(argument);
    case 'pow10':
      return Math.pow(10, argument);
    case 'sqrt':
      return argument >= 0 ? Math.sqrt(argument) : throwCalculation();
  }
}

function checkUnit(argument: number, compute: () => number): number {
  return Math.abs(argument) <= 1 ? compute() : throwCalculation();
}

function throwCalculation(): never {
  throw new CalculationError();
}

/**
 * Rounds to 10 significant digits and checks the display range.
 * Returns null when the value cannot be shown. Non-zero values below 1e-10 become 0.
 */
function finalize(raw: number): number | null {
  if (!Number.isFinite(raw)) {
    return null;
  }
  const rounded = Number(raw.toPrecision(SIGNIFICANT_DIGITS));
  if (!Number.isFinite(rounded) || Math.abs(rounded) > MAX_MAGNITUDE) {
    return null;
  }
  if (rounded !== 0 && Math.abs(rounded) < MIN_MAGNITUDE) {
    return 0;
  }
  return rounded === 0 ? 0 : rounded;
}

/** Converts a number to a plain decimal string, expanding exponent notation (1e-7 -> "0.0000001"). */
export function toPlainString(value: number): string {
  if (value === 0) {
    return '0';
  }
  const text = String(value);
  if (!/e/i.test(text)) {
    return text;
  }
  return value.toFixed(20).replace(/\.?0+$/, '');
}

function lastToken(tokens: readonly Token[]): Token | undefined {
  return tokens[tokens.length - 1];
}

/** True when the token completes an operand, so a digit or operator may follow but not a new operand. */
function endsOperand(token: Token | undefined): boolean {
  return (
    token?.kind === 'number' ||
    token?.kind === 'constant' ||
    token?.kind === 'close' ||
    token?.kind === 'square' ||
    token?.kind === 'percent'
  );
}

function stripTrailingOperators(tokens: readonly Token[]): Token[] {
  let end = tokens.length;
  while (end > 0) {
    const token = tokens[end - 1];
    if (token?.kind !== 'operator' && token?.kind !== 'negate') {
      break;
    }
    end -= 1;
  }
  return tokens.slice(0, end);
}

/** Brackets and function calls that are still open. */
function openDepth(tokens: readonly Token[]): number {
  return tokens.reduce((depth, token) => {
    if (token.kind === 'open' || token.kind === 'function') {
      return depth + 1;
    }
    return token.kind === 'close' ? depth - 1 : depth;
  }, 0);
}

/** Shortens a typed number by one character. A lone digit or a lone minus sign leaves nothing typed. */
function shortenNumber(text: string): string | null {
  const shorter = text.slice(0, -1);
  return shorter === '' || shorter === '-' ? null : shorter;
}

/** Counts typed digits. The leading "0" of "0.xxx" is not counted. */
function countDigits(entry: string): number {
  return entry.replace(/^-?0(?=\.)/, '').replace(/[^0-9]/g, '').length;
}
