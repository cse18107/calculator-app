import { Pressable, StyleSheet, View } from 'react-native';

import { CalculatorIcon } from '@/components/calculator/CalculatorIcon';
import { Text } from '@/components/ui/Text';
import { formatNumber } from '@/domain/calculator';
import { type HistoryEntry, type HistoryKind, formatTimestamp } from '@/domain/history';
import { touchSlop } from '@/lib/touchTarget';
import { useTheme } from '@/theme/ThemeProvider';

const KIND_LABEL: Record<HistoryKind, string> = {
  basic: 'BASIC',
  scientific: 'SCIENTIFIC',
};

export type HistoryCardProps = {
  entry: HistoryEntry;
  /** Current time, used for the timestamp. */
  now: number;
  selected: boolean;
  onToggleSelect: () => void;
  onUse: () => void;
};

/** One calculation in the Tape Record list, laid out as in the design. */
export function HistoryCard({ entry, now, selected, onToggleSelect, onUse }: HistoryCardProps) {
  const theme = useTheme();
  const resultText = formatNumber(entry.result);
  const checkboxSize = theme.spacing.lg + theme.spacing.xxs;
  const checkboxSlop = touchSlop(checkboxSize, theme.dimensions.minTouchTarget);
  const useHeight = theme.spacing.lg + theme.spacing.xs;
  const useSlop = touchSlop(useHeight, theme.dimensions.minTouchTarget);

  return (
    <View
      style={[
        styles.card,
        {
          gap: theme.spacing.sm,
          padding: theme.spacing.md,
          borderRadius: theme.radius.md,
          borderWidth: selected ? theme.dimensions.borderWidth * 2 : theme.dimensions.borderWidth,
          borderColor: selected ? theme.colors.keyMode : theme.colors.historyCardBorder,
          backgroundColor: theme.colors.historyCard,
        },
      ]}
    >
      <View style={styles.metaRow}>
        <View style={[styles.kindGroup, { gap: theme.spacing.sm }]}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel={`Select calculation ${entry.expression} ${resultText}`}
            accessibilityState={{ checked: selected }}
            hitSlop={{ top: checkboxSlop, bottom: checkboxSlop, left: checkboxSlop, right: checkboxSlop }}
            onPress={onToggleSelect}
            style={[
              styles.checkbox,
              {
                width: checkboxSize,
                height: checkboxSize,
                borderRadius: theme.dimensions.memoryKeyRadius,
                borderWidth: theme.dimensions.borderWidth * 2,
                borderColor: selected ? theme.colors.keyAccent : theme.colors.memoryKey,
                backgroundColor: selected ? theme.colors.keyAccent : theme.colors.displayBackground,
              },
            ]}
          >
            {selected ? (
              <CalculatorIcon
                name="check"
                size={theme.iconSize.sm - theme.spacing.xs}
                color={theme.colors.keyAccentText}
              />
            ) : null}
          </Pressable>
          <Text size="micro" weight="bold" style={{ color: theme.colors.memoryKeyText }}>
            {KIND_LABEL[entry.kind]}
          </Text>
        </View>
        <View style={[styles.kindGroup, { gap: theme.spacing.sm }]}>
          <Text size="micro" style={{ color: theme.colors.memoryBar }}>
            {formatTimestamp(entry.createdAt, now)}
          </Text>
          <View accessible accessibilityLabel={entry.pinned ? 'Pinned' : 'Not pinned'}>
            <CalculatorIcon
              name="pin"
              size={theme.iconSize.sm - theme.spacing.xxs}
              color={entry.pinned ? theme.colors.keyAccent : theme.colors.memoryBar}
            />
          </View>
        </View>
      </View>

      <Text size="sm" style={{ color: theme.colors.displaySecondaryText }}>
        {entry.expression}
      </Text>

      <View style={styles.resultRow}>
        <Text size="keyDigit" weight="bold" style={[styles.result, { color: theme.colors.displayText }]}>
          {resultText}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Use result ${resultText}`}
          hitSlop={{ top: useSlop, bottom: useSlop, left: theme.spacing.xs, right: theme.spacing.xs }}
          onPress={onUse}
          style={({ pressed }) => [
            styles.useButton,
            {
              height: useHeight,
              paddingHorizontal: theme.spacing.sm,
              gap: theme.spacing.xs,
              borderRadius: theme.dimensions.memoryKeyRadius,
              borderColor: theme.colors.historyCardBorder,
              backgroundColor: theme.colors.historyCard,
              opacity: pressed ? theme.opacity.pressed : theme.opacity.full,
            },
          ]}
        >
          <CalculatorIcon
            name="cornerDownLeft"
            size={theme.iconSize.sm - theme.spacing.xs}
            color={theme.colors.displaySecondaryText}
          />
          <Text size="micro" weight="bold" style={{ color: theme.colors.displaySecondaryText }}>
            USE
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {},
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kindGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  result: {
    flexShrink: 1,
  },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
