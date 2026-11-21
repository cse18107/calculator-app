import { View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

import { PlaceholderButton } from './PlaceholderButton';

/** Converter and Scientific buttons at the bottom of the keypad. Visual only until those features are built. */
export function ModeRow() {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: theme.dimensions.keyGap }}>
      <PlaceholderButton label="CONVERTER" accessibilityLabel="Converter" icon="globe" />
      <PlaceholderButton label="SCIENTIFIC" accessibilityLabel="Scientific" icon="atom" />
    </View>
  );
}
