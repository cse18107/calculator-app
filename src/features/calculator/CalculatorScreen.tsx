import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { BrandBadge } from '@/components/calculator/BrandBadge';
import { Display } from '@/components/calculator/Display';
import { HistoryButton } from '@/components/calculator/HistoryButton';
import { Keypad } from '@/components/calculator/Keypad';
import { MemoryRow } from '@/components/calculator/MemoryRow';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { getDisplay, getPendingOperator } from '@/domain/calculator';
import { historyLine } from '@/domain/history';
import { hasMemoryValue } from '@/domain/memory';
import { useTheme } from '@/theme/ThemeProvider';

import { useAppState } from './useAppState';

/**
 * Standard calculator screen. Stacks the brand badge (with the HISTORY button), display,
 * memory bar and keypad. The display and keypad share the spare height in the design's
 * proportion, so the layout fills tall and short phones alike. Each has a minimum
 * height, and the content scrolls on very short screens instead of clipping.
 * Reads the shared app state and opens the history screen.
 */
export function CalculatorScreen() {
  const theme = useTheme();
  const { state, dispatch } = useAppState();
  const display = getDisplay(state.calc);
  const activeOperator = getPendingOperator(state.calc);

  const openHistory = () => router.push('/history');

  return (
    <ScreenContainer>
      <ScrollView bounces={false} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <BrandBadge trailing={<HistoryButton onPress={openHistory} />} />
        <View style={{ flex: 1, minHeight: theme.dimensions.displayMinHeight, marginTop: theme.spacing.xl }}>
          <Display
            primary={display.primary}
            secondary={display.secondary}
            isError={display.isError}
            memoryActive={hasMemoryValue(state)}
            historyLine={historyLine(state.history.entries)}
            onHistoryPress={openHistory}
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
