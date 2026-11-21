import { useReducer } from 'react';
import { View } from 'react-native';

import { Display } from '@/components/calculator/Display';
import { Keypad } from '@/components/calculator/Keypad';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { calculatorReducer, getDisplay, initialCalculatorState } from '@/domain/calculator';
import { useTheme } from '@/theme/ThemeProvider';

/** Standard calculator screen (Step 1). Connects the domain engine to the display and keypad. */
export function CalculatorScreen() {
  const theme = useTheme();
  const [state, dispatch] = useReducer(calculatorReducer, initialCalculatorState);
  const display = getDisplay(state);
  const activeOperator = state.status === 'operator' ? state.operator : null;

  return (
    <ScreenContainer>
      <Display primary={display.primary} secondary={display.secondary} isError={display.isError} />
      <View style={{ flex: 1 }} />
      <View style={{ marginTop: theme.layout.sectionGap }}>
        <Keypad activeOperator={activeOperator} onAction={dispatch} />
      </View>
    </ScreenContainer>
  );
}
