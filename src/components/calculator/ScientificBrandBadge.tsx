import { StyleSheet, View } from 'react-native';

import { HistoryButton } from '@/components/calculator/HistoryButton';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type ScientificBrandBadgeProps = {
  /** Opens the calculation history screen. */
  onHistoryPress: () => void;
};

/**
 * Model name and power status above the scientific display, as in the FX-990 design.
 * The HISTORY button sits at the right end, as on the standard screen.
 */
export function ScientificBrandBadge({ onHistoryPress }: ScientificBrandBadgeProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.row,
        {
          paddingHorizontal: theme.spacing.xs,
          paddingVertical: theme.spacing.xxs,
        },
      ]}
    >
      <Text size="micro" weight="bold" style={{ color: theme.colors.textSecondary }}>
        FX-990 SCIENTIFIC
      </Text>
      <View style={[styles.end, { gap: theme.spacing.sm }]}>
        <Text size="micro" weight="bold" style={{ color: theme.colors.textPrimary }}>
          10-DIGIT
        </Text>
        <Text size="micro" weight="regular" style={{ color: theme.colors.textMuted }}>
          V.P.A.M.
        </Text>
        <HistoryButton onPress={onHistoryPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  end: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
