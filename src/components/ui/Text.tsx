import { type ComponentProps } from 'react';
import { StyleSheet, Text as NativeText } from 'react-native';

import type { Theme } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeProvider';

type TextVariant = 'display' | 'title' | 'body' | 'label' | 'caption';
type TextTone = 'primary' | 'secondary';

export type TextProps = ComponentProps<typeof NativeText> & {
  variant?: TextVariant;
  tone?: TextTone;
};

/**
 * Themed text. Use this instead of React Native's `Text` so typography and
 * color stay on the design tokens.
 */
export function Text({ variant = 'body', tone = 'primary', style, ...rest }: TextProps) {
  const theme = useTheme();
  const color = tone === 'primary' ? theme.colors.textPrimary : theme.colors.textSecondary;

  return (
    <NativeText
      {...rest}
      style={[
        styles.base,
        {
          color,
          fontSize: theme.fontSize[sizeFor(variant)],
          fontWeight: theme.fontWeight[weightFor(variant)],
          lineHeight: Math.round(theme.fontSize[sizeFor(variant)] * theme.lineHeight.normal),
          letterSpacing: variant === 'label' ? theme.letterSpacing.label : theme.letterSpacing.normal,
        },
        style,
      ]}
    />
  );
}

function sizeFor(variant: TextVariant): keyof Theme['fontSize'] {
  switch (variant) {
    case 'display':
      return 'display';
    case 'title':
      return 'xl';
    case 'body':
      return 'md';
    case 'label':
      return 'sm';
    case 'caption':
      return 'xs';
  }
}

function weightFor(variant: TextVariant): keyof Theme['fontWeight'] {
  switch (variant) {
    case 'display':
    case 'title':
      return 'bold';
    case 'label':
      return 'semibold';
    case 'body':
    case 'caption':
      return 'regular';
  }
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
