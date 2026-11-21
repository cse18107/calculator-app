import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type DisplayProps = {
  /** Current entry or result, already formatted for display. */
  primary: string;
  /** Pending expression such as "1,250 +", or null. */
  secondary: string | null;
  isError: boolean;
  /** Lights the MEM indicator when memory holds a value. */
  memoryActive: boolean;
};

/**
 * LCD-style display panel, as in the design: mode labels on top, the expression
 * line, and the large result value. The history line is reserved for Step 2
 * and stays empty.
 */
export function Display({ primary, secondary, isError, memoryActive }: DisplayProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.panel,
        {
          minHeight: theme.dimensions.displayMinHeight,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          borderWidth: theme.spacing.xxs,
          borderColor: theme.colors.displayBorder,
          backgroundColor: theme.colors.displayBackground,
        },
      ]}
    >
      <View style={styles.modeRow}>
        <View style={[styles.modeGroup, { gap: theme.spacing.sm }]}>
          <Text size="label" weight="bold" style={{ color: theme.colors.displayText }}>
            BASIC
          </Text>
          <Text
            size="label"
            weight="bold"
            style={{ color: memoryActive ? theme.colors.displayText : theme.colors.displayInactiveText }}
          >
            MEM
          </Text>
        </View>
        <Text size="label" weight="regular" style={{ color: theme.colors.displayModeText }}>
          STANDARD MODE
        </Text>
      </View>

      <View style={[styles.expressionGroup, { gap: theme.spacing.xxs }]}>
        <Text size="xs" weight="medium" style={[styles.right, { color: theme.colors.displayHistoryText }]}>
          {' '}
        </Text>
        <Text
          size="md"
          weight="medium"
          testID="calculator-expression"
          numberOfLines={1}
          style={[styles.right, { color: theme.colors.displaySecondaryText }]}
        >
          {secondary ?? ''}
        </Text>
      </View>

      <Text
        variant="display"
        testID="calculator-display"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={theme.dimensions.displayMinFontScale}
        accessibilityLabel={isError ? 'Error' : primary}
        accessibilityLiveRegion="polite"
        style={[styles.right, { color: theme.colors.displayText }]}
      >
        {primary}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    // Takes all spare height in the screen column, so the keypad stays at the bottom.
    flex: 1,
    justifyContent: 'space-between',
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expressionGroup: {
    alignItems: 'flex-end',
  },
  right: {
    textAlign: 'right',
  },
});
