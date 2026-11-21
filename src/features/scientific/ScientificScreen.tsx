import { useReducer } from 'react';
import { ScrollView, View } from 'react-native';

import { ModeSelectorBar } from '@/components/calculator/ModeSelectorBar';
import { ScientificBrandBadge } from '@/components/calculator/ScientificBrandBadge';
import { ScientificDisplay } from '@/components/calculator/ScientificDisplay';
import { ScientificKeypad } from '@/components/calculator/ScientificKeypad';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import {
  getPendingOperator,
  getScientificDisplay,
  initialScientificState,
  scientificReducer,
} from '@/domain/scientific';
import { useTheme } from '@/theme/ThemeProvider';

export type ScientificScreenProps = {
  /** Returns to the standard calculator. The scientific state is discarded (FR-1, FR-18). */
  onStandardPress: () => void;
  /** Opens the calculation history screen. */
  onHistoryPress: () => void;
};

/**
 * Scientific calculator screen. Holds the scientific engine state in its own reducer, so
 * leaving the screen and coming back starts a fresh expression in RAD. The standard
 * calculator's state is kept in the app state and is not touched here.
 */
export function ScientificScreen({ onStandardPress, onHistoryPress }: ScientificScreenProps) {
  const theme = useTheme();
  const [state, dispatch] = useReducer(scientificReducer, initialScientificState);
  const display = getScientificDisplay(state);

  return (
    <ScreenContainer>
      <ScrollView bounces={false} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <ScientificBrandBadge onHistoryPress={onHistoryPress} />
        <View style={{ flex: 1, minHeight: theme.dimensions.displayMinHeight, marginTop: theme.spacing.xl }}>
          <ScientificDisplay
            primary={display.primary}
            expression={display.expression}
            isError={display.isError}
            angle={state.angle}
          />
        </View>
        <View style={{ marginTop: theme.spacing.compact }}>
          <ModeSelectorBar />
        </View>
        <ScientificKeypad
          onAction={dispatch}
          onStandardPress={onStandardPress}
          angle={state.angle}
          secondArmed={state.secondArmed}
          activeOperator={getPendingOperator(state)}
          style={{ marginTop: theme.spacing.xxl }}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
