import { StyleSheet, View } from 'react-native';

import type { MemoryAction } from '@/domain/memory';
import { useTheme } from '@/theme/ThemeProvider';

import { MemoryKey } from './MemoryKey';

const MEMORY_KEYS: readonly { label: string; accessibilityLabel: string; action: MemoryAction }[] = [
  { label: 'MC', accessibilityLabel: 'Memory clear', action: { type: 'memoryClear' } },
  { label: 'MR', accessibilityLabel: 'Memory recall', action: { type: 'memoryRecall' } },
  { label: 'M−', accessibilityLabel: 'Memory subtract', action: { type: 'memorySubtract' } },
  { label: 'M+', accessibilityLabel: 'Memory add', action: { type: 'memoryAdd' } },
];

export type MemoryRowProps = {
  onAction: (action: MemoryAction) => void;
};

/** Memory key bar between the display and the keypad. */
export function MemoryRow({ onAction }: MemoryRowProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.bar,
        {
          height: theme.dimensions.memoryBarHeight,
          borderRadius: theme.radius.sm,
          borderWidth: theme.dimensions.borderWidth,
          borderColor: theme.colors.memoryBarBorder,
          backgroundColor: theme.colors.memoryBar,
          paddingHorizontal: theme.dimensions.memoryBarInset,
          gap: theme.spacing.xs,
        },
      ]}
    >
      {MEMORY_KEYS.map((key) => (
        <MemoryKey
          key={key.accessibilityLabel}
          label={key.label}
          accessibilityLabel={key.accessibilityLabel}
          onPress={() => onAction(key.action)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
