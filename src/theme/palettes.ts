/**
 * Color palettes for the two base themes.
 *
 * `sageClassic` (light) matches the OpenPencil design "Column - Basic calculator"
 * exactly. Design fidelity is the priority for this phase, so its colours are not
 * adjusted for contrast. Known contrast gaps are listed in
 * `src/theme/__tests__/palettes.test.ts` and in the spec.
 *
 * `midnightOled` (dark) has no design yet. Its new keys reuse the light values
 * until a dark design exists.
 *
 * Every palette MUST define exactly the keys of `ColorPalette`. The tests in
 * `palettes.test.ts` enforce this and the contrast of key text pairs.
 */

export type ColorPalette = {
  /** Phone canvas behind the calculator body. */
  background: string;
  /** Keypad bed (the raised panel that holds the keys). */
  surface: string;
  /** Outline of the phone body and similar frames. */
  border: string;

  /** Primary text (labels, function-key symbols). */
  textPrimary: string;
  /** Secondary text (brand badge, bold label). */
  textSecondary: string;
  /** Tertiary text (brand badge, "AUTO POWER OFF"). */
  textMuted: string;

  /** Display (LCD) panel background. */
  displayBackground: string;
  /** Display panel border (2px inside). */
  displayBorder: string;
  /** Main result value and the active mode label ("BASIC"). */
  displayText: string;
  /** Expression line on the display (e.g. "1,250 +"). */
  displaySecondaryText: string;
  /** History line on the display. */
  displayHistoryText: string;
  /** Inactive mode label ("STANDARD MODE"). */
  displayModeText: string;
  /** Inactive indicator ("MEM" when no memory is stored). */
  displayInactiveText: string;

  /** Digit keys (0-9). */
  keyDigit: string;
  keyDigitText: string;
  /** Hard bottom edge under digit keys. */
  keyDigitEdge: string;
  /** Light function keys (±, ÷, ×, −, +, ., =). */
  keyFunction: string;
  keyFunctionText: string;
  /** Hard bottom edge under function keys. */
  keyFunctionEdge: string;
  /** Accent keys (%, backspace). */
  keyAccent: string;
  keyAccentText: string;
  /** Hard bottom edge under accent keys. */
  keyAccentEdge: string;
  /** Destructive key (CE). */
  keyDanger: string;
  keyDangerText: string;
  /** Hard bottom edge under the CE key. */
  keyDangerEdge: string;
  /** Mode buttons (Converter, Scientific). */
  keyMode: string;
  keyModeText: string;
  /** Hard bottom edge under mode buttons. */
  keyModeEdge: string;

  /** Digit keys on the scientific keypad (darker than `keyDigit`, as in the FX-990 design). */
  keyScientificDigit: string;
  keyScientificDigitText: string;
  /** Hard bottom edge under the scientific digit keys. */
  keyScientificDigitEdge: string;
  /** Selected tab of the scientific mode selector (COMP), and its label. */
  modeTabSelected: string;
  modeTabSelectedText: string;
  /** Unselected mode selector tab label (STAT, BASE-N, MATRIX). */
  modeTabText: string;

  /** Outline of the keypad bed. */
  keypadBorder: string;
  /** Memory bar background and outline. */
  memoryBar: string;
  memoryBarBorder: string;
  /** Memory key background and label. */
  memoryKey: string;
  memoryKeyText: string;

  /** Calculation history entry card background and outline (Tape Record). */
  historyCard: string;
  historyCardBorder: string;

  /** Focus ring and selected-operator border. */
  focus: string;
};

export const sageClassic: ColorPalette = {
  background: '#B9BDA9',
  surface: '#C9CDB8',
  border: '#A6AA98',

  textPrimary: '#2C3028',
  textSecondary: '#686E60',
  textMuted: '#7B8173',

  displayBackground: '#0C1A0C',
  displayBorder: '#050C05',
  displayText: '#F5A623',
  displaySecondaryText: '#B87714',
  displayHistoryText: '#7B4E0C',
  displayModeText: '#9B6512',
  displayInactiveText: '#54380B',

  keyDigit: '#7C8473',
  keyDigitText: '#FFFFFF',
  keyDigitEdge: '#565D4F',
  keyFunction: '#E9EADB',
  keyFunctionText: '#2C3028',
  keyFunctionEdge: '#BCBEAC',
  keyAccent: '#F39C12',
  keyAccentText: '#FFFFFF',
  keyAccentEdge: '#C97E0A',
  keyDanger: '#D63B47',
  keyDangerText: '#FFFFFF',
  keyDangerEdge: '#A8252F',
  keyMode: '#3F7E93',
  keyModeText: '#FFFFFF',
  keyModeEdge: '#285B6B',

  keyScientificDigit: '#6B7362',
  keyScientificDigitText: '#FFFFFF',
  keyScientificDigitEdge: '#4A5142',
  modeTabSelected: '#2C3028',
  modeTabSelectedText: '#E9EADB',
  modeTabText: '#CCD1BD',

  keypadBorder: '#BCBFAC',
  memoryBar: '#A8AC9A',
  memoryBarBorder: '#9A9E8C',
  memoryKey: '#8C907E',
  memoryKeyText: '#E9EADB',

  historyCard: '#162916',
  historyCardBorder: '#213B21',

  focus: '#F5A623',
};

export const midnightOled: ColorPalette = {
  background: '#000000',
  surface: '#0F1A12',
  border: '#22382A',

  textPrimary: '#E9EFE6',
  textSecondary: '#9DB0A0',
  textMuted: '#9DB0A0',

  displayBackground: '#0A140D',
  displayBorder: '#050C05',
  displayText: '#F5A01A',
  displaySecondaryText: '#C07A12',
  displayHistoryText: '#7B4E0C',
  displayModeText: '#9B6512',
  displayInactiveText: '#54380B',

  keyDigit: '#2A3A2E',
  keyDigitText: '#FFFFFF',
  keyDigitEdge: '#565D4F',
  keyFunction: '#33463A',
  keyFunctionText: '#E9EFE6',
  keyFunctionEdge: '#BCBEAC',
  keyAccent: '#F29E14',
  keyAccentText: '#1E2320',
  keyAccentEdge: '#C97E0A',
  keyDanger: '#C93A42',
  keyDangerText: '#FFFFFF',
  keyDangerEdge: '#A8252F',
  keyMode: '#3D7889',
  keyModeText: '#FFFFFF',
  keyModeEdge: '#285B6B',

  keyScientificDigit: '#6B7362',
  keyScientificDigitText: '#FFFFFF',
  keyScientificDigitEdge: '#4A5142',
  modeTabSelected: '#2C3028',
  modeTabSelectedText: '#E9EADB',
  modeTabText: '#CCD1BD',

  keypadBorder: '#BCBFAC',
  memoryBar: '#A8AC9A',
  memoryBarBorder: '#9A9E8C',
  memoryKey: '#8C907E',
  memoryKeyText: '#E9EADB',

  historyCard: '#162916',
  historyCardBorder: '#213B21',

  focus: '#F5A01A',
};
