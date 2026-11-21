import { View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

import { PlaceholderButton } from './PlaceholderButton';

export type ModeRowProps = {
  /** Opens scientific mode. The Converter button stays disabled until Step 4. */
  onScientificPress?: () => void;
};

/** Converter and Scientific buttons at the bottom of the keypad. */
export function ModeRow({ onScientificPress }: ModeRowProps) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: theme.dimensions.keyGap }}>
      <PlaceholderButton label="CONVERTER" accessibilityLabel="Converter" icon="globe" />
      <PlaceholderButton label="SCIENTIFIC" accessibilityLabel="Scientific" icon="atom" onPress={onScientificPress} />
    </View>
  );
}
