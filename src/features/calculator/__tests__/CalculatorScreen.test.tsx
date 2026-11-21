import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { CalculatorScreen } from '../CalculatorScreen';

/** Presses a key by its accessibility name. fireEvent is async in React Native Testing Library v14. */
async function tap(name: string) {
  await fireEvent.press(screen.getByRole('button', { name }));
}

describe('CalculatorScreen', () => {
  it('AC-1: shows 0 with no pending operation on first render', async () => {
    await render(<CalculatorScreen />);

    expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');
    expect(screen.getByTestId('calculator-expression')).toHaveTextContent('');
  });

  it('AC-8: 1250 + 4890.5 = shows the result through key presses', async () => {
    await render(<CalculatorScreen />);

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
    await render(<CalculatorScreen />);

    await tap('One');
    await tap('Two');
    await tap('Five');
    await tap('Zero');
    await tap('Add');

    expect(screen.getByTestId('calculator-expression')).toHaveTextContent('1,250 +');
    expect(screen.getByRole('button', { name: 'Add' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Subtract' })).not.toBeSelected();
  });

  it('AC-27: exposes all 20 keys as named buttons', async () => {
    await render(<CalculatorScreen />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(20);
    for (const button of buttons) {
      expect(button.props.accessibilityLabel).toEqual(expect.any(String));
      expect(button.props.accessibilityLabel.length).toBeGreaterThan(0);
    }
  });

  it('AC-28: every key has a minimum touch target of minTouchTarget (48)', async () => {
    await render(<CalculatorScreen />);

    for (const button of screen.getAllByRole('button')) {
      const style = StyleSheet.flatten(button.props.style);
      expect(style.minHeight).toBeGreaterThanOrEqual(48);
      expect(style.minWidth).toBeGreaterThanOrEqual(48);
    }
  });

  it('AC-21/AC-22: division by zero shows Error, ignores digits, and CE recovers', async () => {
    await render(<CalculatorScreen />);

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

  it('exposes the current value to screen readers through the display label', async () => {
    await render(<CalculatorScreen />);

    await tap('Seven');

    expect(screen.getByLabelText('7')).toBeOnTheScreen();
  });
});
