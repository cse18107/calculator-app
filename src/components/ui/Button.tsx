import { Pressable, type PressableProps, StyleSheet } from 'react-native';

import type { Theme } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeProvider';

import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

export type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: ButtonVariant;
  accessibilityLabel?: string;
};

/**
 * General-purpose button. The calculator keypad will use its own key
 * component built on the same tokens; this is for app chrome (e.g. Reset,
 * Apply) in later features.
 */
export function Button({ label, variant = 'primary', disabled, style, accessibilityLabel, ...rest }: ButtonProps) {
  const theme = useTheme();
  const colors = colorsFor(variant, theme);

  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      style={(state) => [
        styles.base,
        {
          minHeight: theme.dimensions.minTouchTarget,
          borderRadius: theme.radius.md,
          backgroundColor: colors.background,
          paddingHorizontal: theme.spacing.xl,
          opacity: disabled ? theme.opacity.disabled : state.pressed ? theme.opacity.pressed : theme.opacity.full,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <Text variant="label" style={{ color: colors.text }}>
        {label}
      </Text>
    </Pressable>
  );
}

function colorsFor(variant: ButtonVariant, theme: Theme): { background: string; text: string } {
  switch (variant) {
    case 'primary':
      return { background: theme.colors.keyAccent, text: theme.colors.keyAccentText };
    case 'secondary':
      return { background: theme.colors.keyFunction, text: theme.colors.keyFunctionText };
    case 'danger':
      return { background: theme.colors.keyDanger, text: theme.colors.keyDangerText };
  }
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
