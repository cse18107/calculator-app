import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { AngleMode } from '@/domain/scientific';
import { useTheme } from '@/theme/ThemeProvider';

export type ScientificDisplayProps = {
  /** The primary value: the number being typed, the result, or "Error". */
  primary: string;
  /** The expression line, e.g. "sin(45) + log(100) =". */
  expression: string;
  isError: boolean;
  angle: AngleMode;
};

/**
 * The scientific LCD panel: the indicator row (RAD, DEG, SCI, FIX), the expression line and
 * the primary value. Layout and colours come from the FX-990 design.
 */
export function ScientificDisplay({ primary, expression, isError, angle }: ScientificDisplayProps) {
  const theme = useTheme();
  const indicators: { label: string; active: boolean }[] = [
    { label: 'RAD', active: angle === 'RAD' },
    { label: 'DEG', active: angle === 'DEG' },
    { label: 'SCI', active: true },
    { label: 'FIX', active: false },
  ];

  return (
    <View
      accessible
      accessibilityLabel={`Display. Expression ${expression || 'empty'}. ${isError ? 'Error' : `Value ${primary}`}`}
      style={[
        styles.panel,
        {
          backgroundColor: theme.colors.displayBackground,
          borderColor: theme.colors.displayBorder,
          borderWidth: theme.spacing.xxs,
          borderRadius: theme.radius.lg,
          minHeight: theme.dimensions.displayMinHeight,
          padding: theme.spacing.lg,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.indicators, { gap: theme.spacing.md }]}>
          {indicators.map(({ label, active }) => (
            <Text
              key={label}
              size="label"
              weight="bold"
              style={{ color: active ? theme.colors.displayText : theme.colors.displayInactiveText }}
            >
              {label}
            </Text>
          ))}
        </View>
        <Text size="label" weight="regular" style={{ color: theme.colors.displayModeText }}>
          V.P.A.M. 10
        </Text>
      </View>

      <Text
        testID="scientific-expression"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={theme.dimensions.displayMinFontScale}
        size="scientificExpression"
        weight="medium"
        style={[styles.end, { color: theme.colors.displaySecondaryText }]}
      >
        {expression}
      </Text>

      <Text
        testID="scientific-display"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={theme.dimensions.displayMinFontScale}
        size="displayScientific"
        weight="bold"
        style={[styles.end, { color: theme.colors.displayText }]}
      >
        {primary}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  end: {
    textAlign: 'right',
  },
});
