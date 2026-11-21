import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui/Text';
import { touchSlop } from '@/lib/touchTarget';
import { useTheme } from '@/theme/ThemeProvider';

export type HistoryButtonProps = {
  onPress: () => void;
};

/**
 * Opens the Tape Record (calculation history) screen. The drawn pill is smaller than
 * the touch target, so hit slop makes up the difference.
 */
export function HistoryButton({ onPress }: HistoryButtonProps) {
  const theme = useTheme();
  const height = theme.dimensions.historyButtonHeight;
  const slop = touchSlop(height, theme.dimensions.minTouchTarget);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open calculation history"
      hitSlop={{ top: slop, bottom: slop, left: theme.spacing.sm, right: theme.spacing.sm }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          height,
          borderRadius: theme.radius.sm,
          paddingHorizontal: theme.spacing.md,
          backgroundColor: theme.colors.keyMode,
          opacity: pressed ? theme.opacity.pressed : theme.opacity.full,
        },
      ]}
    >
      <Text size="micro" weight="bold" style={{ color: theme.colors.keyModeText }}>
        HISTORY
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
