import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { touchSlop } from '@/lib/touchTarget';
import { useTheme } from '@/theme/ThemeProvider';

import { ActionTile } from './ActionTile';

export type SelectionActionBarProps = {
  selectedCount: number;
  /** False when the visible list is empty, so SELECT ALL has nothing to select. */
  canSelectAll: boolean;
  onSelectAll: () => void;
  onPin: () => void;
  onUseInCalc: () => void;
  onShare: () => void;
  onDelete: () => void;
  onBack: () => void;
  onClearAll: () => void;
};

/**
 * The action area at the bottom of the Tape Record screen, laid out as in the design.
 * Actions that need a selection are disabled while nothing is selected.
 * BACK TO CALC and CLEAR ALL are always enabled.
 */
export function SelectionActionBar({
  selectedCount,
  canSelectAll,
  onSelectAll,
  onPin,
  onUseInCalc,
  onShare,
  onDelete,
  onBack,
  onClearAll,
}: SelectionActionBarProps) {
  const theme = useTheme();
  const hasSelection = selectedCount > 0;
  const selectAllSlop = touchSlop(theme.spacing.lg, theme.dimensions.minTouchTarget);

  return (
    <View
      style={[
        styles.bar,
        {
          gap: theme.spacing.compact,
          padding: theme.spacing.md,
          borderRadius: theme.dimensions.keypadRadius,
          borderWidth: theme.dimensions.borderWidth,
          borderColor: theme.colors.keypadBorder,
          backgroundColor: theme.colors.surface,
        },
      ]}
    >
      <View
        style={[
          styles.countRow,
          {
            height: theme.spacing.xxl + theme.spacing.xs,
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.radius.sm,
            borderWidth: theme.dimensions.borderWidth,
            borderColor: theme.colors.memoryBarBorder,
            backgroundColor: theme.colors.border,
          },
        ]}
      >
        <Text size="label" weight="bold" style={{ color: theme.colors.textPrimary }}>
          {hasSelection ? `${selectedCount} items selected` : 'No items selected'}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Select all calculations"
          accessibilityState={{ disabled: !canSelectAll }}
          disabled={!canSelectAll}
          hitSlop={{ top: selectAllSlop, bottom: selectAllSlop, left: theme.spacing.sm, right: theme.spacing.sm }}
          onPress={onSelectAll}
          style={({ pressed }) => ({
            opacity: !canSelectAll ? theme.opacity.disabled : pressed ? theme.opacity.pressed : theme.opacity.full,
          })}
        >
          <Text size="label" weight="bold" style={{ color: theme.colors.keyMode }}>
            SELECT ALL
          </Text>
        </Pressable>
      </View>

      <View style={[styles.row, { gap: theme.spacing.compact }]}>
        <ActionTile
          variant="tile"
          tone="accent"
          icon="pin"
          label="PIN"
          accessibilityLabel="Pin selected calculations"
          disabled={!hasSelection}
          onPress={onPin}
        />
        <ActionTile
          variant="tile"
          tone="info"
          icon="calculator"
          label="USE IN CALC"
          accessibilityLabel="Use selected result in calculator"
          disabled={!hasSelection}
          onPress={onUseInCalc}
        />
        <ActionTile
          variant="tile"
          tone="digit"
          icon="share"
          label="SHARE"
          accessibilityLabel="Share selected calculations"
          disabled={!hasSelection}
          onPress={onShare}
        />
        <ActionTile
          variant="tile"
          tone="danger"
          icon="trash"
          label="DELETE"
          accessibilityLabel="Delete selected calculations"
          disabled={!hasSelection}
          onPress={onDelete}
        />
      </View>

      <View style={[styles.row, { gap: theme.spacing.compact }]}>
        <ActionTile
          variant="bar"
          tone="neutral"
          icon="cornerDownLeft"
          label="BACK TO CALC"
          accessibilityLabel="Back to calculator"
          onPress={onBack}
        />
        <ActionTile
          variant="bar"
          tone="light"
          icon="close"
          label="CLEAR ALL"
          accessibilityLabel="Clear all calculations"
          onPress={onClearAll}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {},
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
