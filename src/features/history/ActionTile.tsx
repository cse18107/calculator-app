import { Pressable, StyleSheet, View } from 'react-native';

import { CalculatorIcon, type CalculatorIconName } from '@/components/calculator/CalculatorIcon';
import { Text } from '@/components/ui/Text';
import { touchSlop } from '@/lib/touchTarget';
import type { Theme } from '@/theme/theme';
import { useTheme } from '@/theme/ThemeProvider';

export type ActionTileTone = 'accent' | 'info' | 'digit' | 'danger' | 'neutral' | 'light';

export type ActionTileProps = {
  label: string;
  accessibilityLabel: string;
  icon: CalculatorIconName;
  tone: ActionTileTone;
  /** `tile` is the tall keypad-style button; `bar` is the short button at the bottom. */
  variant: 'tile' | 'bar';
  disabled?: boolean;
  onPress: () => void;
};

/**
 * Action button of the Tape Record screen, drawn like the design: a coloured face with a
 * hard edge (tile) or a flat face (bar). Disabled tiles are dimmed and do not respond.
 */
export function ActionTile({
  label,
  accessibilityLabel,
  icon,
  tone,
  variant,
  disabled = false,
  onPress,
}: ActionTileProps) {
  const theme = useTheme();
  const colors = toneColors(tone, theme);
  const isTile = variant === 'tile';
  const height = isTile ? theme.dimensions.historyActionTileHeight : theme.dimensions.historyBarButtonHeight;
  const slop = touchSlop(height, theme.dimensions.minTouchTarget);
  const shadow = theme.elevation.key;

  return (
    <View style={styles.wrapper}>
      {isTile ? (
        <View
          pointerEvents="none"
          style={[
            styles.edge,
            {
              top: theme.dimensions.keyEdgeOffset,
              bottom: -theme.dimensions.keyEdgeOffset,
              borderRadius: theme.dimensions.keyRadius,
              backgroundColor: colors.edge,
            },
          ]}
        />
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        disabled={disabled}
        hitSlop={{ top: slop, bottom: slop, left: theme.spacing.xs, right: theme.spacing.xs }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.face,
          {
            height,
            flexDirection: isTile ? 'column' : 'row',
            gap: isTile ? theme.spacing.xxs : theme.spacing.sm,
            borderRadius: isTile ? theme.dimensions.keyRadius : theme.radius.sm,
            backgroundColor: colors.background,
            opacity: disabled ? theme.opacity.disabled : pressed ? theme.opacity.pressed : theme.opacity.full,
            shadowColor: shadow.shadowColor,
            shadowOpacity: shadow.shadowOpacity,
            shadowRadius: shadow.shadowRadius,
            shadowOffset: shadow.shadowOffset,
            elevation: shadow.androidElevation,
          },
        ]}
      >
        <CalculatorIcon
          name={icon}
          size={isTile ? theme.iconSize.sm : theme.iconSize.sm - theme.spacing.xs}
          color={colors.text}
        />
        <Text size={isTile ? 'micro' : 'label'} weight="bold" style={{ color: colors.text }}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

function toneColors(tone: ActionTileTone, theme: Theme): { background: string; text: string; edge: string } {
  const c = theme.colors;
  switch (tone) {
    case 'accent':
      return { background: c.keyAccent, text: c.keyAccentText, edge: c.keyAccentEdge };
    case 'info':
      return { background: c.keyMode, text: c.keyModeText, edge: c.keyModeEdge };
    case 'digit':
      return { background: c.keyDigit, text: c.keyDigitText, edge: c.keyDigitEdge };
    case 'danger':
      return { background: c.keyDanger, text: c.keyDangerText, edge: c.keyDangerEdge };
    case 'neutral':
      return { background: c.memoryBar, text: c.textPrimary, edge: c.memoryBarBorder };
    case 'light':
      return { background: c.keyFunction, text: c.keyDanger, edge: c.keyFunctionEdge };
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  edge: {
    ...StyleSheet.absoluteFill,
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
