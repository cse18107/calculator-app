/**
 * Color palettes for the two base themes shown in `designs/`.
 *
 * Values are approximations read from the design screenshots, not sampled
 * from the source files. Refine them against the Figma/source assets when the
 * Themes feature is specified.
 *
 * Every palette MUST define exactly the keys of `ColorPalette`. The tests in
 * `palettes.test.ts` enforce this and the contrast of key text pairs.
 */

export type ColorPalette = {
  /** Device/app canvas behind the calculator body. */
  background: string;
  /** Raised panel that holds the keypad. */
  surface: string;
  /** Border and divider color on surfaces. */
  border: string;

  /** Primary body text on `background`/`surface`. */
  textPrimary: string;
  /** Secondary, de-emphasised text (labels, captions). */
  textSecondary: string;

  /** Display (LCD) area background. */
  displayBackground: string;
  /** Main result text on the display. */
  displayText: string;
  /** Expression/history text on the display. */
  displaySecondaryText: string;

  /** Digit keys (0-9, decimal point). */
  keyDigit: string;
  keyDigitText: string;
  /** Light function keys (±, ÷, =, etc.). */
  keyFunction: string;
  keyFunctionText: string;
  /** Accent operator keys (%, backspace, parentheses). */
  keyAccent: string;
  keyAccentText: string;
  /** Destructive key (CE / clear). */
  keyDanger: string;
  keyDangerText: string;
  /** Mode switch keys (Converter, Scientific). */
  keyMode: string;
  keyModeText: string;

  /** Focus ring and selection highlight. */
  focus: string;
};

export const sageClassic: ColorPalette = {
  background: '#B9BDA8',
  surface: '#C8CCB7',
  border: '#9EA391',

  textPrimary: '#1E2320',
  textSecondary: '#353C30',

  displayBackground: '#0E1A0F',
  displayText: '#F5A01A',
  displaySecondaryText: '#C07A12',

  keyDigit: '#5F6A56',
  keyDigitText: '#FFFFFF',
  keyFunction: '#E8EBDD',
  keyFunctionText: '#1E2320',
  keyAccent: '#F29E14',
  keyAccentText: '#1E2320',
  keyDanger: '#C93A42',
  keyDangerText: '#FFFFFF',
  keyMode: '#3D7889',
  keyModeText: '#FFFFFF',

  focus: '#F5A01A',
};

export const midnightOled: ColorPalette = {
  background: '#000000',
  surface: '#0F1A12',
  border: '#22382A',

  textPrimary: '#E9EFE6',
  textSecondary: '#9DB0A0',

  displayBackground: '#0A140D',
  displayText: '#F5A01A',
  displaySecondaryText: '#C07A12',

  keyDigit: '#2A3A2E',
  keyDigitText: '#FFFFFF',
  keyFunction: '#33463A',
  keyFunctionText: '#E9EFE6',
  keyAccent: '#F29E14',
  keyAccentText: '#1E2320',
  keyDanger: '#C93A42',
  keyDangerText: '#FFFFFF',
  keyMode: '#3D7889',
  keyModeText: '#FFFFFF',

  focus: '#F5A01A',
};
