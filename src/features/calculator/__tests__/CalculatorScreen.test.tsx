import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { AppStateProvider } from '../AppStateProvider';
import { CalculatorScreen } from '../CalculatorScreen';
import { themes } from '@/theme/theme';

const MEMORY_NAMES = ['Memory clear', 'Memory recall', 'Memory subtract', 'Memory add'] as const;
const MODE_NAMES = ['Converter', 'Scientific'] as const;
const HISTORY_NAME = 'Open calculation history';
/** Buttons that are not part of the 20-key keypad grid. */
const NON_KEYPAD_NAMES: readonly string[] = [...MEMORY_NAMES, ...MODE_NAMES, HISTORY_NAME];

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn() } }));

const light = themes.light.colors;

/** Renders the calculator inside the app state provider it needs. */
function renderCalculator() {
  return render(
    <AppStateProvider>
      <CalculatorScreen />
    </AppStateProvider>,
  );
}

/** Presses a key by its accessibility name. fireEvent is async in React Native Testing Library v14. */
async function tap(name: string) {
  await fireEvent.press(screen.getByRole('button', { name }));
}

describe('CalculatorScreen', () => {
  it('AC-1: shows 0 with no pending operation on first render', async () => {
    await renderCalculator();

    expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');
    expect(screen.getByTestId('calculator-expression')).toHaveTextContent('');
  });

  it('AC-8: 1250 + 4890.5 = shows the result through key presses', async () => {
    await renderCalculator();

    await tap('One');
    await tap('Two');
    await tap('Five');
    await tap('Zero');
    await tap('Add');
    await tap('Four');
    await tap('Eight');
    await tap('Nine');
    await tap('Zero');
    await tap('Decimal point');
    await tap('Five');
    await tap('Equals');

    expect(screen.getByTestId('calculator-display')).toHaveTextContent('6,140.5');
  });

  it('AC-26: shows the pending left operand and marks the operator as selected', async () => {
    await renderCalculator();

    await tap('One');
    await tap('Two');
    await tap('Five');
    await tap('Zero');
    await tap('Add');

    expect(screen.getByTestId('calculator-expression')).toHaveTextContent('1,250 +');
    expect(screen.getByRole('button', { name: 'Add' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Subtract' })).not.toBeSelected();
  });

  it('AC-27: exposes all 20 keypad keys, the 4 memory keys and the 2 mode buttons as named buttons', async () => {
    await renderCalculator();

    // 20 keypad keys, 4 memory keys, 2 mode buttons, and the header HISTORY button.
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(27);
    for (const button of buttons) {
      expect(button.props.accessibilityLabel).toEqual(expect.any(String));
      expect(button.props.accessibilityLabel.length).toBeGreaterThan(0);
    }
  });

  it('AC-28: every keypad key is at least minTouchTarget (48) wide', async () => {
    await renderCalculator();

    const keys = screen
      .getAllByRole('button')
      .filter((button) => !NON_KEYPAD_NAMES.includes(button.props.accessibilityLabel));
    expect(keys).toHaveLength(20);
    for (const button of keys) {
      const style = StyleSheet.flatten(button.props.style);
      expect(style.minWidth).toBeGreaterThanOrEqual(48);
    }
  });

  it('AC-28 (design sizes): memory keys are 26px tall and mode buttons 38px tall, as in the design', async () => {
    await renderCalculator();

    for (const name of MEMORY_NAMES) {
      expect(StyleSheet.flatten(screen.getByRole('button', { name }).props.style).height).toBe(26);
    }
    for (const name of MODE_NAMES) {
      const wrapperHeight = screen.getByRole('button', { name }).parent?.props.style;
      expect(StyleSheet.flatten(wrapperHeight)?.height).toBe(38);
    }
  });

  it('AC-21/AC-22: division by zero shows Error, ignores digits, and CE recovers', async () => {
    await renderCalculator();

    await tap('Five');
    await tap('Divide');
    await tap('Zero');
    await tap('Equals');
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('Error');

    await tap('Seven');
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('Error');

    await tap('Clear entry');
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');
  });

  it('AC-31: the mode buttons are disabled and do not change the display', async () => {
    await renderCalculator();

    for (const name of MODE_NAMES) {
      const button = screen.getByRole('button', { name });
      expect(button).toBeDisabled();
      await fireEvent.press(button);
    }

    expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');
  });

  it('AC-32: memory keys are enabled, and M+ then MR recalls the value through the UI', async () => {
    await renderCalculator();

    for (const name of MEMORY_NAMES) {
      expect(screen.getByRole('button', { name })).toBeEnabled();
    }

    await tap('One');
    await tap('Two');
    await tap('Five');
    await tap('Zero');
    await tap('Memory add');
    await tap('Clear entry');
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');

    await tap('Memory recall');
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('1,250');
  });

  it('AC-33: M− subtracts the displayed value; MC clears memory (through the UI)', async () => {
    await renderCalculator();

    await tap('Five');
    await tap('Memory add');
    await tap('Clear entry');
    await tap('Two');
    await tap('Memory subtract');
    await tap('Clear entry');
    await tap('Memory recall');
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('3');

    await tap('Memory clear');
    await tap('Clear entry');
    await tap('Memory recall');
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');
  });

  it('AC-41: 34 → + → 22 keeps the expression "34 +" while 22 is typed, and = shows 56', async () => {
    await renderCalculator();

    await tap('Three');
    await tap('Four');
    expect(screen.getByTestId('calculator-expression')).toHaveTextContent('');

    await tap('Add');
    expect(screen.getByTestId('calculator-expression')).toHaveTextContent('34 +');

    await tap('Two');
    await tap('Two');
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('22');
    expect(screen.getByTestId('calculator-expression')).toHaveTextContent('34 +');
    expect(screen.getByRole('button', { name: 'Add' })).toBeSelected();

    await tap('Equals');
    expect(screen.getByTestId('calculator-display')).toHaveTextContent('56');
    expect(screen.getByTestId('calculator-expression')).toHaveTextContent('');
  });

  it('AC-34: the MEM indicator is dim when memory is empty and lit when it holds a value', async () => {
    await renderCalculator();

    expect(screen.getByText('MEM')).toHaveStyle({ color: light.displayInactiveText });

    await tap('Five');
    await tap('Memory add');
    expect(screen.getByText('MEM')).toHaveStyle({ color: light.displayText });

    await tap('Memory clear');
    expect(screen.getByText('MEM')).toHaveStyle({ color: light.displayInactiveText });
  });

  it('exposes the current value to screen readers through the display label', async () => {
    await renderCalculator();

    await tap('Seven');

    expect(screen.getByLabelText('7')).toBeOnTheScreen();
  });
});

describe('calculation history on the calculator screen', () => {
  /** Presses 2 × 3 = and returns when the history line should be shown. */
  async function completeTwoTimesThree() {
    await tap('Two');
    await tap('Multiply');
    await tap('Three');
    await tap('Equals');
  }

  it('AC-10: the HISTORY line is hidden until a calculation completes, then shows the latest', async () => {
    await renderCalculator();
    expect(screen.queryByText(/HISTORY:/)).toBeNull();

    await completeTwoTimesThree();

    expect(screen.getByText('HISTORY: 2 × 3 = 6')).toBeOnTheScreen();
  });

  it('AC-11: pressing the HISTORY line opens the history screen', async () => {
    await renderCalculator();
    await completeTwoTimesThree();

    await tap('Open calculation history. Latest: 2 × 3 = 6');

    expect(router.push).toHaveBeenCalledWith('/history');
  });

  it('AC-34: the header HISTORY button opens the history screen, even with no entries', async () => {
    await renderCalculator();

    await tap('Open calculation history');

    expect(router.push).toHaveBeenCalledWith('/history');
  });

  it('AC-35: equals with nothing pending and equals after an error record nothing', async () => {
    await renderCalculator();

    await tap('Equals');
    expect(screen.queryByText(/HISTORY:/)).toBeNull();

    await tap('Five');
    await tap('Divide');
    await tap('Zero');
    await tap('Equals');
    await tap('Equals');
    expect(screen.queryByText(/HISTORY:/)).toBeNull();
  });

  it('AC-31: the header HISTORY button and the history line reach 48pt with hit slop', async () => {
    await renderCalculator();
    await completeTwoTimesThree();

    const header = screen.getByRole('button', { name: 'Open calculation history' });
    expect(header.props.hitSlop.top + header.props.hitSlop.bottom + 26).toBeGreaterThanOrEqual(48);

    const line = screen.getByRole('button', { name: /Open calculation history\. Latest/ });
    expect(line.props.hitSlop.top + line.props.hitSlop.bottom + 17).toBeGreaterThanOrEqual(48);
  });
});
