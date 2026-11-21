import { type ColorPalette, midnightOled, sageClassic } from './palettes';
import {
  dimensions,
  elevation,
  fontFamily,
  fontSize,
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
  fontFamily: typeof fontFamily;
  fontSize: typeof fontSize;
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
  fontFamily,
  fontSize,
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
