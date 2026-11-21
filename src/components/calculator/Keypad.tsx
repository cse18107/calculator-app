import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import type { CalculatorAction, Operator } from '@/domain/calculator';
import type { Theme } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeProvider';

import type { CalculatorIconName } from './CalculatorIcon';
import { CalculatorKey, type KeyTone } from './CalculatorKey';
import { ModeRow } from './ModeRow';

type KeyCell = {
  accessibilityLabel: string;
  tone: KeyTone;
  action: CalculatorAction;
  label?: string;
  icon?: CalculatorIconName;
  labelSize: keyof Theme['fontSize'];
  labelWeight: keyof Theme['fontFamily'];
  operator?: Operator;
};

const DIGIT_NAMES = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'] as const;

function digit(value: number): KeyCell {
  return {
    label: String(value),
    accessibilityLabel: DIGIT_NAMES[value] ?? String(value),
    tone: 'digit',
    action: { type: 'digit', digit: String(value) },
    labelSize: 'keyDigit',
    labelWeight: 'regular',
  };
}

/** Operator keys (÷ × − +) use 26px medium in the design. */
function operatorKey(label: string, accessibilityLabel: string, operator: Operator): KeyCell {
  return {
    label,
    accessibilityLabel,
    tone: 'function',
    action: { type: 'operator', operator },
    labelSize: 'keyDigit',
    labelWeight: 'medium',
    operator,
  };
}

/** Key layout and label styles match the OpenPencil design "Column - Basic calculator". */
const KEY_ROWS: KeyCell[][] = [
  [
    {
      label: 'CE',
      accessibilityLabel: 'Clear entry',
      tone: 'danger',
      action: { type: 'clearEntry' },
      labelSize: 'keyClear',
      labelWeight: 'bold',
    },
    {
      label: '±',
      accessibilityLabel: 'Sign change',
      tone: 'function',
      action: { type: 'toggleSign' },
      labelSize: 'keySign',
      labelWeight: 'medium',
    },
    {
      label: '%',
      accessibilityLabel: 'Percent',
      tone: 'accent',
      action: { type: 'percent' },
      labelSize: 'keyPercent',
      labelWeight: 'regular',
    },
    operatorKey('÷', 'Divide', 'divide'),
  ],
  [digit(7), digit(8), digit(9), operatorKey('×', 'Multiply', 'multiply')],
  [digit(4), digit(5), digit(6), operatorKey('−', 'Subtract', 'subtract')],
  [digit(1), digit(2), digit(3), operatorKey('+', 'Add', 'add')],
  [
    digit(0),
    {
      label: '.',
      accessibilityLabel: 'Decimal point',
      tone: 'function',
      action: { type: 'decimal' },
      labelSize: 'xl',
      labelWeight: 'bold',
    },
    {
      icon: 'backspace',
      accessibilityLabel: 'Backspace',
      tone: 'accent',
      action: { type: 'backspace' },
      labelSize: 'keyDigit',
      labelWeight: 'regular',
    },
    {
      label: '=',
      accessibilityLabel: 'Equals',
      tone: 'function',
      action: { type: 'equals' },
      labelSize: 'xl',
      labelWeight: 'medium',
    },
  ],
];

export type KeypadProps = {
  onAction: (action: CalculatorAction) => void;
  /** Operator waiting for its right operand, if any. */
  activeOperator: Operator | null;
  /** Layout from the parent screen (e.g. the flex share of spare height). */
  style?: StyleProp<ViewStyle>;
};

/**
 * The keypad bed: five key rows and the Converter/Scientific row, as in the design.
 * Holds layout only; all logic lives in `src/domain/`.
 */
export function Keypad({ onAction, activeOperator, style }: KeypadProps) {
  const theme = useTheme();
  // Smallest bed that still fits every row at touch-target height plus the mode row.
  const minHeight =
    5 * theme.dimensions.minTouchTarget +
    5 * theme.dimensions.keyGap +
    theme.dimensions.modeButtonHeight +
    2 * theme.spacing.md +
    2 * theme.dimensions.borderWidth;

  return (
    <View
      style={[
        styles.bed,
        {
          minHeight,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.keypadBorder,
          borderWidth: theme.dimensions.borderWidth,
          borderRadius: theme.dimensions.keypadRadius,
          padding: theme.spacing.md,
          gap: theme.dimensions.keyGap,
        },
        style,
      ]}
    >
      {KEY_ROWS.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={[styles.row, { minHeight: theme.dimensions.minTouchTarget, gap: theme.dimensions.keyGap }]}
        >
          {row.map((cell) => (
            <CalculatorKey
              key={cell.accessibilityLabel}
              accessibilityLabel={cell.accessibilityLabel}
              tone={cell.tone}
              label={cell.label}
              icon={cell.icon}
              labelSize={cell.labelSize}
              labelWeight={cell.labelWeight}
              selected={cell.operator !== undefined && cell.operator === activeOperator}
              onPress={() => onAction(cell.action)}
            />
          ))}
        </View>
      ))}
      <ModeRow />
    </View>
  );
}

const styles = StyleSheet.create({
  bed: {
    alignSelf: 'stretch',
  },
  row: {
    // The five key rows share the bed's height equally; the mode row keeps its own height.
    flex: 1,
    flexDirection: 'row',
  },
});
