import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { touchSlop } from '@/lib/touchTarget';
import { useTheme } from '@/theme/ThemeProvider';

export type DisplayProps = {
  /** Current entry or result, already formatted for display. */
  primary: string;
  /** Pending expression such as "1,250 +", or null. */
  secondary: string | null;
  isError: boolean;
  /** Lights the MEM indicator when memory holds a value. */
  memoryActive: boolean;
  /** Most recent calculation, e.g. "450 × 8 = 3,600", or null when there is no history. */
  historyLine: string | null;
  /** Opens the history screen when the history line is pressed. */
  onHistoryPress: () => void;
};

/**
 * LCD-style display panel, as in the design: mode labels on top, the history line,
 * the expression line, and the large result value. The history line keeps its
 * height when empty, and is a control when it shows a calculation.
 */
export function Display({ primary, secondary, isError, memoryActive, historyLine, onHistoryPress }: DisplayProps) {
  const theme = useTheme();
  const historyText = (
    <Text size="xs" weight="medium" style={[styles.right, { color: theme.colors.displayHistoryText }]}>
      {historyLine === null ? ' ' : `HISTORY: ${historyLine}`}
    </Text>
  );
  // Hit slop extends the 12pt line to the minimum touch target without changing its size.
  const historySlop = touchSlop(
    Math.round(theme.fontSize.xs * theme.lineHeight.normal),
    theme.dimensions.minTouchTarget,
  );

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
        {historyLine === null ? (
          historyText
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open calculation history. Latest: ${historyLine}`}
            hitSlop={{ top: historySlop, bottom: historySlop }}
            onPress={onHistoryPress}
            style={({ pressed }) => [
              styles.historyPressable,
              { opacity: pressed ? theme.opacity.muted : theme.opacity.full },
            ]}
          >
            {historyText}
          </Pressable>
        )}
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
  historyPressable: {
    alignSelf: 'stretch',
  },
});
