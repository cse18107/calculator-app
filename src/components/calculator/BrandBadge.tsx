import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

/** Product name and power status line above the display, as in the design. */
export function BrandBadge() {
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
      <Text size="micro" weight="regular" style={{ color: theme.colors.textMuted }}>
        AUTO POWER OFF
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
