import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type MemoryKeyProps = {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
};

/** One memory key (MC, MR, M−, M+). Same size and colours as the design. */
export function MemoryKey({ label, accessibilityLabel, onPress }: MemoryKeyProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.key,
        {
          flex: 1,
          height: theme.dimensions.memoryKeyHeight,
          borderRadius: theme.dimensions.memoryKeyRadius,
          backgroundColor: theme.colors.memoryKey,
          opacity: pressed ? theme.opacity.pressed : theme.opacity.full,
        },
      ]}
    >
      <Text size="micro" weight="bold" style={[styles.label, { color: theme.colors.memoryKeyText }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  key: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
