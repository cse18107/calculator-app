import { type ColorPalette, midnightOled, sageClassic } from '../palettes';

/** Linearised sRGB channel for the hex digits starting at `offset`. */
function linearChannel(hex: string, offset: number): number {
  const c = parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG 2.x relative luminance of a `#RRGGBB` color. */
function luminance(hex: string): number {
  return 0.2126 * linearChannel(hex, 1) + 0.7152 * linearChannel(hex, 3) + 0.0722 * linearChannel(hex, 5);
}

/** WCAG contrast ratio between two `#RRGGBB` colors. */
function contrast(foreground: string, background: string): number {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

const palettes: Record<string, ColorPalette> = { sageClassic, midnightOled };

describe.each(Object.entries(palettes))('%s palette', (_name, palette) => {
  it('defines only valid #RRGGBB colors', () => {
    for (const value of Object.values(palette)) {
      expect(value).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it.each([
    ['textPrimary', 'background'],
    ['textPrimary', 'surface'],
    ['textSecondary', 'background'],
    ['displayText', 'displayBackground'],
    ['displaySecondaryText', 'displayBackground'],
    ['keyDigitText', 'keyDigit'],
    ['keyFunctionText', 'keyFunction'],
    ['keyAccentText', 'keyAccent'],
    ['keyDangerText', 'keyDanger'],
    ['keyModeText', 'keyMode'],
  ] as const)('%s on %s meets WCAG AA (4.5:1)', (text, background) => {
    expect(contrast(palette[text], palette[background])).toBeGreaterThanOrEqual(4.5);
  });
});

describe('palette parity', () => {
  it('both themes define exactly the same color roles', () => {
    expect(Object.keys(midnightOled).sort()).toEqual(Object.keys(sageClassic).sort());
  });
});
