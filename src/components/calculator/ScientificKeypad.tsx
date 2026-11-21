import type { Dispatch } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import type { Theme } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeProvider';
import type { AngleMode, BinaryOperator, ScientificAction } from '@/domain/scientific';

import { CalculatorKey, type KeyTone } from './CalculatorKey';
import type { CalculatorIconName } from './CalculatorIcon';

type KeySpec = {
  accessibilityLabel: string;
  tone: KeyTone;
  label?: string;
  icon?: CalculatorIconName;
  labelSize: keyof Theme['fontSize'];
  labelWeight?: keyof Theme['fontFamily'];
  /** Action to run on press. Null for placeholder keys with no action yet. */
  action: ScientificAction | null;
  /** Screen-level press handler for keys that leave the engine (the S key). */
  onPress?: () => void;
  selected?: boolean;
};

export type ScientificKeypadProps = {
  onAction: Dispatch<ScientificAction>;
  /** Returns to the standard calculator. Pressed from the S key (left of =). */
  onStandardPress: () => void;
  angle: AngleMode;
  secondArmed: boolean;
  /** Operator waiting for its right operand, if any. */
  activeOperator: BinaryOperator | null;
  style?: StyleProp<ViewStyle>;
};

/** Spoken names for the digit keys, as on the standard keypad ("Seven", "Zero"). */
const DIGIT_NAMES: Record<string, string> = {
  '0': 'Zero',
  '1': 'One',
  '2': 'Two',
  '3': 'Three',
  '4': 'Four',
  '5': 'Five',
  '6': 'Six',
  '7': 'Seven',
  '8': 'Eight',
  '9': 'Nine',
};

const digit = (value: string): KeySpec => ({
  accessibilityLabel: DIGIT_NAMES[value] ?? value,
  tone: 'scientificDigit',
  label: value,
  labelSize: 'lg',
  labelWeight: 'medium',
  action: { type: 'digit', digit: value },
});

const fn = (label: string, accessibilityLabel: string, name: 'sin' | 'cos' | 'tan' | 'ln' | 'log' | 'sqrt') => ({
  accessibilityLabel,
  tone: 'mode' as const,
  label,
  labelSize: 'keyScientific' as const,
  labelWeight: 'regular' as const,
  action: { type: 'function' as const, name },
});

/**
 * The FX-990 keypad (design `iPhone - Scientific calculator`, node 0:312): seven rows of five keys.
 * Layout only: every press is dispatched as an action and handled by `src/domain/scientific.ts`.
 */
function buildRows(
  angle: AngleMode,
  secondArmed: boolean,
  activeOperator: BinaryOperator | null,
  onStandardPress: () => void,
): KeySpec[][] {
  const operator = (
    label: string,
    accessibilityLabel: string,
    op: BinaryOperator,
    labelSize: KeySpec['labelSize'],
  ): KeySpec => ({
    accessibilityLabel,
    tone: 'function',
    label,
    labelSize,
    labelWeight: 'medium',
    action: { type: 'operator', operator: op },
    selected: activeOperator === op,
  });

  return [
    [
      {
        accessibilityLabel: 'Second function',
        tone: 'function',
        label: '2nd',
        labelSize: 'keyDeg',
        labelWeight: 'bold',
        action: { type: 'toggleSecond' },
        selected: secondArmed,
      },
      {
        accessibilityLabel: 'Degree mode',
        tone: 'function',
        label: 'deg',
        labelSize: 'keyDeg',
        labelWeight: 'bold',
        action: { type: 'toggleAngle' },
        selected: angle === 'DEG',
      },
      fn('sin', 'Sine', 'sin'),
      fn('cos', 'Cosine', 'cos'),
      fn('tan', 'Tangent', 'tan'),
    ],
    [
      fn('ln', 'Natural logarithm', 'ln'),
      fn('log', 'Logarithm', 'log'),
      fn('√x', 'Square root', 'sqrt'),
      {
        accessibilityLabel: 'Square',
        tone: 'mode',
        label: 'x²',
        labelSize: 'keyScientific',
        labelWeight: 'regular',
        action: { type: 'square' },
      },
      {
        accessibilityLabel: 'Pi',
        tone: 'mode',
        label: 'π',
        labelSize: 'keySymbol',
        labelWeight: 'regular',
        action: { type: 'constant', name: 'pi' },
      },
    ],
    [
      {
        accessibilityLabel: 'Clear entry',
        tone: 'danger',
        label: 'CE',
        labelSize: 'keyClear',
        labelWeight: 'bold',
        action: { type: 'clearEntry' },
      },
      {
        accessibilityLabel: 'Open bracket',
        tone: 'accent',
        label: '(',
        labelSize: 'keySymbol',
        action: { type: 'openParen' },
      },
      {
        accessibilityLabel: 'Close bracket',
        tone: 'accent',
        label: ')',
        labelSize: 'keySymbol',
        action: { type: 'closeParen' },
      },
      {
        accessibilityLabel: 'Backspace',
        tone: 'accent',
        icon: 'backspace',
        labelSize: 'lg',
        action: { type: 'backspace' },
      },
      operator('÷', 'Divide', 'divide', 'lg'),
    ],
    [
      digit('7'),
      digit('8'),
      digit('9'),
      {
        accessibilityLabel: 'Percent',
        tone: 'accent',
        label: '%',
        labelSize: 'keySymbol',
        action: { type: 'percent' },
      },
      operator('×', 'Multiply', 'multiply', 'lg'),
    ],
    [
      digit('4'),
      digit('5'),
      digit('6'),
      {
        accessibilityLabel: 'Sign change',
        tone: 'function',
        label: '±',
        labelSize: 'keySymbol',
        labelWeight: 'medium',
        action: { type: 'toggleSign' },
      },
      operator('−', 'Subtract', 'subtract', 'lg'),
    ],
    [
      digit('1'),
      digit('2'),
      digit('3'),
      {
        accessibilityLabel: 'Euler number',
        tone: 'function',
        label: 'e',
        labelSize: 'keySymbol',
        labelWeight: 'medium',
        action: { type: 'constant', name: 'e' },
      },
      operator('+', 'Add', 'add', 'lg'),
    ],
    [
      {
        accessibilityLabel: 'Converter (not available yet)',
        tone: 'mode',
        icon: 'globe',
        labelSize: 'lg',
        action: null,
      },
      digit('0'),
      {
        accessibilityLabel: 'Decimal point',
        tone: 'function',
        label: '.',
        labelSize: 'keyDecimal',
        labelWeight: 'bold',
        action: { type: 'decimal' },
      },
      {
        accessibilityLabel: 'Standard calculator',
        tone: 'mode',
        label: 'S',
        labelSize: 'lg',
        labelWeight: 'bold',
        action: null,
        onPress: onStandardPress,
      },
      {
        accessibilityLabel: 'Equals',
        tone: 'function',
        label: '=',
        labelSize: 'lg',
        labelWeight: 'medium',
        action: { type: 'equals' },
      },
    ],
  ];
}

/** The 7 × 5 scientific keypad inside the keypad bed, using the design colours and sizes. */
export function ScientificKeypad({
  onAction,
  onStandardPress,
  angle,
  secondArmed,
  activeOperator,
  style,
}: ScientificKeypadProps) {
  const theme = useTheme();
  const rows = buildRows(angle, secondArmed, activeOperator, onStandardPress);

  return (
    <View
      style={[
        styles.bed,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.keypadBorder,
          borderWidth: theme.dimensions.borderWidth,
          borderRadius: theme.dimensions.keypadRadius,
          padding: theme.spacing.compact,
          gap: theme.dimensions.scientificKeyGap,
        },
        style,
      ]}
    >
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={[styles.row, { height: theme.dimensions.scientificKeyHeight, gap: theme.dimensions.scientificKeyGap }]}
        >
          {row.map((spec) => (
            <CalculatorKey
              key={spec.accessibilityLabel}
              accessibilityLabel={spec.accessibilityLabel}
              tone={spec.tone}
              disabled={spec.action === null && spec.onPress === undefined}
              label={spec.label}
              icon={spec.icon}
              labelSize={spec.labelSize}
              labelWeight={spec.labelWeight}
              selected={spec.selected}
              onPress={() => {
                if (spec.onPress !== undefined) {
                  spec.onPress();
                } else if (spec.action !== null) {
                  onAction(spec.action);
                }
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bed: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
});
