import { StyleSheet, View } from 'react-native';

import { Surface } from '@/components/ui/Surface';
import type { CalculatorAction, Operator } from '@/domain/calculator';
import { useTheme } from '@/theme/ThemeProvider';

import { CalculatorKey, type KeyTone } from './CalculatorKey';

type KeyCell = {
  label: string;
  accessibilityLabel: string;
  tone: KeyTone;
  action: CalculatorAction;
  operator?: Operator;
};

const DIGIT_NAMES = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'] as const;

function digit(value: number): KeyCell {
  return {
    label: String(value),
    accessibilityLabel: DIGIT_NAMES[value] ?? String(value),
    tone: 'digit',
    action: { type: 'digit', digit: String(value) },
  };
}

function operatorKey(label: string, accessibilityLabel: string, operator: Operator): KeyCell {
  return { label, accessibilityLabel, tone: 'function', action: { type: 'operator', operator }, operator };
}

/** Layout matches `designs/Column - Basic calculator@1.5x.png`, top row first. */
const KEY_ROWS: KeyCell[][] = [
  [
    { label: 'CE', accessibilityLabel: 'Clear entry', tone: 'danger', action: { type: 'clearEntry' } },
    { label: '±', accessibilityLabel: 'Sign change', tone: 'function', action: { type: 'toggleSign' } },
    { label: '%', accessibilityLabel: 'Percent', tone: 'accent', action: { type: 'percent' } },
    operatorKey('÷', 'Divide', 'divide'),
  ],
  [digit(7), digit(8), digit(9), operatorKey('×', 'Multiply', 'multiply')],
  [digit(4), digit(5), digit(6), operatorKey('−', 'Subtract', 'subtract')],
  [digit(1), digit(2), digit(3), operatorKey('+', 'Add', 'add')],
  [
    digit(0),
    { label: '.', accessibilityLabel: 'Decimal point', tone: 'function', action: { type: 'decimal' } },
    { label: '⌫', accessibilityLabel: 'Backspace', tone: 'accent', action: { type: 'backspace' } },
    { label: '=', accessibilityLabel: 'Equals', tone: 'function', action: { type: 'equals' } },
  ],
];

export type KeypadProps = {
  onAction: (action: CalculatorAction) => void;
  /** Operator waiting for its right operand, if any. */
  activeOperator: Operator | null;
};

/** The 20-key calculator keypad. Holds layout only; all logic lives in `src/domain/`. */
export function Keypad({ onAction, activeOperator }: KeypadProps) {
  const theme = useTheme();

  return (
    <Surface elevation="raised" style={{ padding: theme.spacing.sm, gap: theme.dimensions.keyGap }}>
      {KEY_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { gap: theme.dimensions.keyGap }]}>
          {row.map((cell) => (
            <CalculatorKey
              key={cell.accessibilityLabel}
              label={cell.label}
              accessibilityLabel={cell.accessibilityLabel}
              tone={cell.tone}
              selected={cell.operator !== undefined && cell.operator === activeOperator}
              onPress={() => onAction(cell.action)}
            />
          ))}
        </View>
      ))}
    </Surface>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});
