import { type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';

/**
 * Root layout for a screen: safe-area aware, themed background, and a
 * constrained content width so layouts stay readable on tablets.
 */
export function ScreenContainer({ children }: PropsWithChildren) {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[
          styles.content,
          {
            paddingHorizontal: theme.layout.screenPaddingHorizontal,
            paddingVertical: theme.layout.screenPaddingVertical,
            maxWidth: theme.dimensions.maxContentWidth,
          },
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
  },
});
