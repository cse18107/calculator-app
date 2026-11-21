import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { Theme } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeProvider';

import { CalculatorIcon, type CalculatorIconName } from './CalculatorIcon';

/**
 * - `digit`, `function`, `accent`, `danger`: the standard keypad.
 * - `scientificDigit`: digit keys on the scientific keypad.
 * - `mode`: the teal scientific function keys and the placeholder keys.
 */
export type KeyTone = 'digit' | 'function' | 'accent' | 'danger' | 'scientificDigit' | 'mode';

export type CalculatorKeyProps = {
  accessibilityLabel: string;
  tone: KeyTone;
  /** A key with no action yet. It keeps its look and ignores presses. */
  disabled?: boolean;
  /** Text label. Ignored when `icon` is set. */
  label?: string;
  /** Icon shown instead of the text label (e.g. backspace). */
  icon?: CalculatorIconName;
  /** Label font size token from the design (e.g. 26 for digits). */
  labelSize?: keyof Theme['fontSize'];
  /** Label weight token (Inter family). */
  labelWeight?: keyof Theme['fontFamily'];
  /** Marks the key of the operator that is waiting for its right operand. */
  selected?: boolean;
  onPress: () => void;
};

/**
 * One key of the calculator keypad. Matches the design: a rounded key, a soft
 * drop shadow, and a hard darker edge under the key.
 */
export function CalculatorKey({
  accessibilityLabel,
  tone,
  disabled = false,
  label,
  icon,
  labelSize = 'keyDigit',
  labelWeight = 'regular',
  selected = false,
  onPress,
}: CalculatorKeyProps) {
  const theme = useTheme();
  const colors = toneColors(tone, theme);
  const shadow = theme.elevation.key;

  return (
    <View style={styles.wrapper}>
      <View
        pointerEvents="none"
        style={[
          styles.edge,
          {
            top: theme.dimensions.keyEdgeOffset,
            bottom: -theme.dimensions.keyEdgeOffset,
            borderRadius: theme.dimensions.keyRadius,
            backgroundColor: colors.edge,
          },
        ]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected, disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.key,
          {
            minWidth: theme.dimensions.minTouchTarget,
            minHeight: theme.dimensions.minTouchTarget,
            borderRadius: theme.dimensions.keyRadius,
            backgroundColor: colors.background,
            borderWidth: selected ? theme.spacing.xxs : 0,
            borderColor: selected ? theme.colors.focus : colors.background,
            opacity: disabled ? theme.opacity.disabled : pressed ? theme.opacity.pressed : theme.opacity.full,
            shadowColor: shadow.shadowColor,
            shadowOpacity: shadow.shadowOpacity,
            shadowRadius: shadow.shadowRadius,
            shadowOffset: shadow.shadowOffset,
            elevation: shadow.androidElevation,
          },
        ]}
      >
        {icon ? (
          <CalculatorIcon name={icon} size={theme.iconSize.key} color={colors.text} />
        ) : (
          <Text size={labelSize} weight={labelWeight} style={[styles.label, { color: colors.text }]}>
            {label}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

function toneColors(tone: KeyTone, theme: Theme): { background: string; text: string; edge: string } {
  switch (tone) {
    case 'digit':
      return { background: theme.colors.keyDigit, text: theme.colors.keyDigitText, edge: theme.colors.keyDigitEdge };
    case 'function':
      return {
        background: theme.colors.keyFunction,
        text: theme.colors.keyFunctionText,
        edge: theme.colors.keyFunctionEdge,
      };
    case 'accent':
      return { background: theme.colors.keyAccent, text: theme.colors.keyAccentText, edge: theme.colors.keyAccentEdge };
    case 'danger':
      return { background: theme.colors.keyDanger, text: theme.colors.keyDangerText, edge: theme.colors.keyDangerEdge };
    case 'scientificDigit':
      return {
        background: theme.colors.keyScientificDigit,
        text: theme.colors.keyScientificDigitText,
        edge: theme.colors.keyScientificDigitEdge,
      };
    case 'mode':
      return { background: theme.colors.keyMode, text: theme.colors.keyModeText, edge: theme.colors.keyModeEdge };
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  edge: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  key: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
