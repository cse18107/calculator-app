/**
 * Non-color design tokens. Components must read these instead of hardcoding
 * numbers. Values are starting points derived from the designs in `designs/`
 * and should be adjusted when a feature spec defines exact measurements.
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
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  display: 48,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
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
} as const;

export const elevation = {
  none: { shadowOpacity: 0, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, androidElevation: 0 },
  raised: { shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, androidElevation: 3 },
  floating: { shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, androidElevation: 8 },
} as const;

export const dimensions = {
  /** Minimum touch target per platform guidance (44pt iOS / 48dp Android, rounded up). */
  minTouchTarget: 48,
  keyHeight: 60,
  keyGap: 8,
  displayMinHeight: 180,
  modeButtonHeight: 48,
  maxContentWidth: 480,
} as const;

export const layout = {
  screenPaddingHorizontal: spacing.lg,
  screenPaddingVertical: spacing.md,
  sectionGap: spacing.lg,
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
