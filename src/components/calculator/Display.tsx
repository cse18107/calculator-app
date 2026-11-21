import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type DisplayProps = {
  primary: string;
  secondary: string | null;
  isError: boolean;
};

/** LCD-style result panel. The main value shrinks to fit so long numbers stay on one line. */
export function Display({ primary, secondary, isError }: DisplayProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: theme.colors.displayBackground,
          borderRadius: theme.radius.lg,
          minHeight: theme.dimensions.displayMinHeight,
          padding: theme.spacing.lg,
        },
      ]}
    >
      <Text
        variant="body"
        testID="calculator-expression"
        numberOfLines={1}
        style={[styles.text, { color: theme.colors.displaySecondaryText }]}
      >
        {secondary ?? ''}
      </Text>
      <Text
        variant="display"
        testID="calculator-display"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={theme.dimensions.displayMinFontScale}
        accessibilityLabel={isError ? 'Error' : primary}
        accessibilityLiveRegion="polite"
        style={[styles.text, { color: theme.colors.displayText }]}
      >
        {primary}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    justifyContent: 'flex-end',
  },
  text: {
    textAlign: 'right',
  },
});
