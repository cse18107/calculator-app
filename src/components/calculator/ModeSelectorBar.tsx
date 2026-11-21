import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

/** Mode tabs of the scientific calculator. Only COMP is built; the others are placeholders. */
const TABS = ['COMP', 'STAT', 'BASE-N', 'MATRIX'] as const;
const ACTIVE_TAB = 'COMP';

/** Mode selector row above the scientific keypad (COMP selected, the others disabled). */
export function ModeSelectorBar() {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.bar,
        {
          height: theme.dimensions.modeSelectorHeight,
          borderRadius: theme.radius.sm,
          borderWidth: theme.dimensions.borderWidth,
          borderColor: theme.colors.memoryBarBorder,
          backgroundColor: theme.colors.memoryBar,
          paddingHorizontal: theme.dimensions.memoryBarInset,
          paddingVertical: theme.spacing.xxs,
          gap: theme.dimensions.modeSelectorTabGap,
        },
      ]}
    >
      {TABS.map((name) => {
        const selected = name === ACTIVE_TAB;
        return (
          <Pressable
            key={name}
            accessibilityRole="button"
            accessibilityLabel={name}
            accessibilityState={{ selected, disabled: !selected }}
            disabled={!selected}
            style={[
              styles.tab,
              {
                borderRadius: theme.dimensions.memoryKeyRadius,
                backgroundColor: selected ? theme.colors.modeTabSelected : theme.colors.memoryKey,
              },
            ]}
          >
            <Text
              size="micro"
              weight="bold"
              style={{ color: selected ? theme.colors.modeTabSelectedText : theme.colors.modeTabText }}
            >
              {name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
