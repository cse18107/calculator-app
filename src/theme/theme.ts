import { type ColorPalette, midnightOled, sageClassic } from './palettes';
import {
  dimensions,
  elevation,
  fontSize,
  fontWeight,
  iconSize,
  layout,
  letterSpacing,
  lineHeight,
  motion,
  opacity,
  radius,
  spacing,
} from './tokens';

export type ThemeMode = 'light' | 'dark';

export type Theme = {
  mode: ThemeMode;
  colors: ColorPalette;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  lineHeight: typeof lineHeight;
  letterSpacing: typeof letterSpacing;
  opacity: typeof opacity;
  iconSize: typeof iconSize;
  elevation: typeof elevation;
  dimensions: typeof dimensions;
  layout: typeof layout;
  motion: typeof motion;
};

const sharedTokens = {
  spacing,
  radius,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  opacity,
  iconSize,
  elevation,
  dimensions,
  layout,
  motion,
} as const;

export const themes: Record<ThemeMode, Theme> = {
  light: { mode: 'light', colors: sageClassic, ...sharedTokens },
  dark: { mode: 'dark', colors: midnightOled, ...sharedTokens },
};
