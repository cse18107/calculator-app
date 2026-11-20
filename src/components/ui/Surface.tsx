import { type PropsWithChildren } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type SurfaceProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  /** Shadow level from the elevation tokens. */
  elevation?: 'none' | 'raised' | 'floating';
  /** Which surface color to use from the palette. */
  tone?: 'background' | 'surface';
}>;

/** A bordered, rounded container for grouping content on the design tokens. */
export function Surface({ children, style, elevation = 'none', tone = 'surface' }: SurfaceProps) {
  const theme = useTheme();
  const shadow = theme.elevation[elevation];

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors[tone],
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radius.lg,
          shadowColor: '#000000',
          shadowOpacity: shadow.shadowOpacity,
          shadowRadius: shadow.shadowRadius,
          shadowOffset: shadow.shadowOffset,
          elevation: shadow.androidElevation,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
