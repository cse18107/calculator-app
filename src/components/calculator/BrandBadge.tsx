import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type BrandBadgeProps = {
  /** Optional control shown at the right end of the row, after the power status. */
  trailing?: ReactNode;
};

/** Product name and power status line above the display, as in the design. */
export function BrandBadge({ trailing }: BrandBadgeProps) {
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
        STANDARD CALC
      </Text>
      <View style={[styles.end, { gap: theme.spacing.sm }]}>
        <Text size="micro" weight="regular" style={{ color: theme.colors.textMuted }}>
          AUTO POWER OFF
        </Text>
        {trailing}
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
