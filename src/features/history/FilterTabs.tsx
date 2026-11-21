import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { touchSlop } from '@/lib/touchTarget';
import type { HistoryFilter } from '@/domain/history';
import { useTheme } from '@/theme/ThemeProvider';

export const HISTORY_FILTERS: readonly { filter: HistoryFilter; label: string }[] = [
  { filter: 'all', label: 'ALL' },
  { filter: 'basic', label: 'BASIC' },
  { filter: 'scientific', label: 'SCIENTIFIC' },
  { filter: 'pinned', label: 'PINNED' },
];

export type FilterTabsProps = {
  filter: HistoryFilter;
  onSelect: (filter: HistoryFilter) => void;
};

/** The four filter tabs under the list (ALL, BASIC, SCIENTIFIC, PINNED), as in the design. */
export function FilterTabs({ filter, onSelect }: FilterTabsProps) {
  const theme = useTheme();
  const height = theme.dimensions.historyTabHeight;
  const slop = touchSlop(height, theme.dimensions.minTouchTarget);

  return (
    <View style={[styles.row, { gap: theme.spacing.xs }]}>
      {HISTORY_FILTERS.map(({ filter: value, label }) => {
        const selected = value === filter;
        return (
          <Pressable
            key={value}
            accessibilityRole="tab"
            accessibilityLabel={`Filter: ${label.toLowerCase()}`}
            accessibilityState={{ selected }}
            hitSlop={{ top: slop, bottom: slop, left: theme.spacing.xxs, right: theme.spacing.xxs }}
            onPress={() => onSelect(value)}
            style={({ pressed }) => [
              styles.tab,
              {
                height,
                borderRadius: theme.dimensions.memoryKeyRadius,
                backgroundColor: selected ? theme.colors.textPrimary : theme.colors.memoryKey,
                opacity: pressed ? theme.opacity.pressed : theme.opacity.full,
              },
            ]}
          >
            <Text
              size="micro"
              weight="bold"
              style={{ color: selected ? theme.colors.keyFunction : theme.colors.memoryKeyText }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
