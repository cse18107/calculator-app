/**
 * Non-color design tokens. Components must read these instead of hardcoding
 * numbers. Calculator values are measured from the OpenPencil design
 * "Column - Basic calculator" (Demo.fig) and are the source of truth for this phase.
 */

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  /** 10px: keypad and mode-row gaps, display-to-memory gap in the design. */
  compact: 10,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Inter font families, loaded in `src/app/_layout.tsx` with `@expo-google-fonts/inter`. */
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const fontSize = {
  /** 10px: memory keys, brand badge. */
  micro: 10,
  /** 11px: display mode labels, mode buttons. */
  label: 11,
  /** 12px: display history line. */
  xs: 12,
  sm: 14,
  /** 16px: display expression line. */
  md: 16,
  /** 19px: CE key. */
  keyClear: 19,
  lg: 20,
  /** 22px: % key. */
  keyPercent: 22,
  /** 24px: sign-change key. */
  keySign: 24,
  /** 26px: digit and operator keys. */
  keyDigit: 26,
  xl: 28,
  /** 54px: display value. */
  display: 54,
} as const;

export const lineHeight = {
  tight: 1.15,
  normal: 1.4,
  relaxed: 1.6,
} as const;

/** Letter spacing for the uppercase labels seen in the designs (e.g. "STANDARD CALC"). */
export const letterSpacing = {
  label: 1.2,
  normal: 0,
} as const;

export const opacity = {
  disabled: 0.4,
  muted: 0.6,
  pressed: 0.85,
  full: 1,
} as const;

export const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  /** 18px: globe and atom icons on the mode buttons. */
  button: 18,
  /** 22px: backspace icon on the keypad. */
  key: 22,
} as const;

export const elevation = {
  none: { shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, androidElevation: 0 },
  raised: { shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, androidElevation: 3 },
  floating: { shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, androidElevation: 8 },
  /** Soft drop shadow under each calculator key (design: black 15.7%, y 4, blur 4). */
  key: {
    shadowColor: '#000000',
    shadowOpacity: 0.157,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
    androidElevation: 3,
  },
} as const;

export const dimensions = {
  /** Minimum touch target per platform guidance (44pt iOS / 48dp Android, rounded up). */
  minTouchTarget: 48,
  /** Gap between keys and between keypad rows (design: 10). */
  keyGap: 10,
  /** Corner radius of a keypad key (design: 12). */
  keyRadius: 12,
  /** Hard bottom edge under each key, in px (design: 3.5). */
  keyEdgeOffset: 3.5,
  /**
   * Smallest display panel height. The content (mode labels, expression, 54px value)
   * needs about 168. The panel grows to fill spare height (design size: 185).
   */
  displayMinHeight: 168,
  /** Smallest scale the display value may shrink to so long numbers stay on one line. */
  displayMinFontScale: 0.5,
  /** Keypad bed corner radius (design: 22). */
  keypadRadius: 22,
  /** Hairline border width used on panels (design: 1). */
  borderWidth: 1,
  /** Memory bar height (design: 32). */
  memoryBarHeight: 32,
  /** Memory key height (design: 26). */
  memoryKeyHeight: 26,
  /** Memory key corner radius (design: 4). */
  memoryKeyRadius: 4,
  /** Inset of the memory keys from the memory bar edge (design: 6). */
  memoryBarInset: 6,
  /** Mode button height (design: 38). Below minTouchTarget; see the spec's accessibility notes. */
  modeButtonHeight: 38,
  /** Mode button corner radius (design: 10). */
  modeButtonRadius: 10,
  /** Mode button hard bottom edge, in px (design: 2.5). */
  modeEdgeOffset: 2.5,
  maxContentWidth: 480,
} as const;

export const layout = {
  screenPaddingHorizontal: spacing.lg,
  screenPaddingVertical: spacing.md,
  sectionGap: spacing.lg,
  /**
   * Share of spare height given to the keypad, relative to the display (flex 1).
   * Design proportion: keypad bed 422px : display 185px.
   */
  keypadFlex: 2.28,
} as const;

export const motion = {
  duration: {
    fast: 120,
    normal: 200,
    slow: 320,
  },
  /** Cubic-bezier control points for the standard easing curve. */
  easing: {
    standard: [0.2, 0, 0, 1],
    decelerate: [0, 0, 0.2, 1],
    accelerate: [0.4, 0, 1, 1],
  },
} as const;
