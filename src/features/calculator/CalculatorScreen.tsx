import { useReducer } from 'react';
import { ScrollView, View } from 'react-native';

import { BrandBadge } from '@/components/calculator/BrandBadge';
import { Display } from '@/components/calculator/Display';
import { Keypad } from '@/components/calculator/Keypad';
import { MemoryRow } from '@/components/calculator/MemoryRow';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { getDisplay, getPendingOperator } from '@/domain/calculator';
import { appReducer, hasMemoryValue, initialAppState } from '@/domain/memory';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Standard calculator screen (Step 1). Stacks the brand badge, display, memory bar
 * and keypad. The display and keypad share the spare height in the design's
 * proportion, so the layout fills tall and short phones alike. Each has a minimum
 * height, and the content scrolls on very short screens instead of clipping.
 * Connects the domain engine and memory to the display and keypad.
 */
export function CalculatorScreen() {
  const theme = useTheme();
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  const display = getDisplay(state.calc);
  const activeOperator = getPendingOperator(state.calc);

  return (
    <ScreenContainer>
      <ScrollView bounces={false} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <BrandBadge />
        <View style={{ flex: 1, minHeight: theme.dimensions.displayMinHeight, marginTop: theme.spacing.xl }}>
          <Display
            primary={display.primary}
            secondary={display.secondary}
            isError={display.isError}
            memoryActive={hasMemoryValue(state)}
          />
        </View>
        <View style={{ marginTop: theme.spacing.compact }}>
          <MemoryRow onAction={dispatch} />
        </View>
        <Keypad
          activeOperator={activeOperator}
          onAction={dispatch}
          style={{ flex: theme.layout.keypadFlex, marginTop: theme.spacing.xxl }}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
