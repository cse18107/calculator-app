import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

import { CalculatorIcon, type CalculatorIconName } from './CalculatorIcon';

export type PlaceholderButtonProps = {
  accessibilityLabel: string;
  label: string;
  /** Icon shown before the label. */
  icon?: CalculatorIconName;
};

/**
 * Visual-only mode button for a feature that is not built yet (Converter, Scientific).
 * It always has `disabled` set and no action. Sizes and colours follow the design.
 */
export function PlaceholderButton({ accessibilityLabel, label, icon }: PlaceholderButtonProps) {
  const theme = useTheme();
  const shadow = theme.elevation.key;

  return (
    <View style={[styles.modeWrapper, { height: theme.dimensions.modeButtonHeight }]}>
      <View
        pointerEvents="none"
        style={[
          styles.modeEdge,
          {
            top: theme.dimensions.modeEdgeOffset,
            bottom: -theme.dimensions.modeEdgeOffset,
            borderRadius: theme.dimensions.modeButtonRadius,
            backgroundColor: theme.colors.keyModeEdge,
          },
        ]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: true }}
        disabled
        style={[
          styles.mode,
          {
            borderRadius: theme.dimensions.modeButtonRadius,
            backgroundColor: theme.colors.keyMode,
            gap: theme.spacing.sm,
            shadowColor: shadow.shadowColor,
            shadowOpacity: shadow.shadowOpacity,
            shadowRadius: shadow.shadowRadius,
            shadowOffset: shadow.shadowOffset,
            elevation: shadow.androidElevation,
          },
        ]}
      >
        {icon ? <CalculatorIcon name={icon} size={theme.iconSize.button} color={theme.colors.keyModeText} /> : null}
        <Text size="label" weight="bold" style={[styles.label, { color: theme.colors.keyModeText }]}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    textAlign: 'center',
  },
  modeWrapper: {
    flex: 1,
  },
  modeEdge: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  mode: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
