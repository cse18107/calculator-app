import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { Theme } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeProvider';

export type KeyTone = 'digit' | 'function' | 'accent' | 'danger';

export type CalculatorKeyProps = {
  label: string;
  accessibilityLabel: string;
  tone: KeyTone;
  /** Marks the key of the operator that is waiting for its right operand. */
  selected?: boolean;
  onPress: () => void;
};

/** One key of the calculator keypad. Colours come from the palette tone pairs. */
export function CalculatorKey({ label, accessibilityLabel, tone, selected = false, onPress }: CalculatorKeyProps) {
  const theme = useTheme();
  const colors = toneColors(tone, theme);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.key,
        {
          flex: 1,
          minHeight: theme.dimensions.keyHeight,
          minWidth: theme.dimensions.minTouchTarget,
          borderRadius: theme.radius.md,
          backgroundColor: colors.background,
          borderWidth: selected ? theme.spacing.xxs : 0,
          borderColor: selected ? theme.colors.focus : colors.background,
          opacity: pressed ? theme.opacity.pressed : theme.opacity.full,
        },
      ]}
    >
      <Text variant="title" style={[styles.label, { color: colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function toneColors(tone: KeyTone, theme: Theme): { background: string; text: string } {
  switch (tone) {
    case 'digit':
      return { background: theme.colors.keyDigit, text: theme.colors.keyDigitText };
    case 'function':
      return { background: theme.colors.keyFunction, text: theme.colors.keyFunctionText };
    case 'accent':
      return { background: theme.colors.keyAccent, text: theme.colors.keyAccentText };
    case 'danger':
      return { background: theme.colors.keyDanger, text: theme.colors.keyDangerText };
  }
}

const styles = StyleSheet.create({
  key: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
