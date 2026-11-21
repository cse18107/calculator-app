import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { themes } from '@/theme/theme';

import { ScientificScreen } from '../ScientificScreen';

const light = themes.light.colors;

async function renderScientific(onStandardPress = jest.fn(), onHistoryPress = jest.fn()) {
  await render(<ScientificScreen onStandardPress={onStandardPress} onHistoryPress={onHistoryPress} />);
  return { onStandardPress, onHistoryPress };
}

/** Presses a key by its accessibility name. fireEvent is async in React Native Testing Library v14. */
async function tap(name: string) {
  await fireEvent.press(screen.getByRole('button', { name }));
}

function primaryValue() {
  return screen.getByTestId('scientific-display');
}

describe('ScientificScreen', () => {
  it('AC-2: STAT, BASE-N and MATRIX are disabled and do not change the display', async () => {
    await renderScientific();

    for (const name of ['STAT', 'BASE-N', 'MATRIX']) {
      const tab = screen.getByRole('button', { name });
      expect(tab).toBeDisabled();
      await fireEvent.press(tab);
    }

    expect(primaryValue()).toHaveTextContent('0');
  });

  it('AC-3: the deg key toggles the angle mode and its selected state', async () => {
    await renderScientific();

    const deg = screen.getByRole('button', { name: 'Degree mode' });
    expect(deg).not.toBeSelected();
    await tap('Degree mode');
    expect(screen.getByRole('button', { name: 'Degree mode' })).toBeSelected();
    expect(StyleSheet.flatten(screen.getByText('DEG').props.style).color).toBe(light.displayText);
    expect(StyleSheet.flatten(screen.getByText('RAD').props.style).color).toBe(light.displayInactiveText);

    await tap('Degree mode');
    expect(screen.getByRole('button', { name: 'Degree mode' })).not.toBeSelected();
  });

  it('AC-4: 2nd then sin appends sin⁻¹( and clears the 2nd arm', async () => {
    await renderScientific();

    await tap('Second function');
    expect(screen.getByRole('button', { name: 'Second function' })).toBeSelected();

    await tap('Sine');
    expect(screen.getByTestId('scientific-expression')).toHaveTextContent('sin⁻¹(');
    expect(screen.getByRole('button', { name: 'Second function' })).not.toBeSelected();
  });

  it('AC-17: after an error only CE is accepted, and CE shows 0 with no expression', async () => {
    await renderScientific();

    await tap('Five');
    await tap('Divide');
    await tap('Zero');
    await tap('Equals');
    expect(primaryValue()).toHaveTextContent('Error');

    await tap('Seven');
    expect(primaryValue()).toHaveTextContent('Error');

    await tap('Clear entry');
    expect(primaryValue()).toHaveTextContent('0');
    expect(screen.getByTestId('scientific-expression')).toHaveTextContent('');
  });

  it('AC-20: after = a new operator continues from the result', async () => {
    await renderScientific();

    await tap('Eight');
    await tap('Add');
    await tap('Four');
    await tap('Equals');
    expect(primaryValue()).toHaveTextContent('12');
    expect(screen.getByTestId('scientific-expression')).toHaveTextContent('8 + 4 =');

    await tap('Multiply');
    await tap('Two');
    await tap('Equals');
    expect(primaryValue()).toHaveTextContent('24');
  });

  it('AC-6: keys follow operator precedence on the screen (2 + 3 × 4 = 14)', async () => {
    await renderScientific();

    await tap('Two');
    await tap('Add');
    await tap('Three');
    await tap('Multiply');
    await tap('Four');
    await tap('Equals');

    expect(primaryValue()).toHaveTextContent('14');
  });

  it('AC-26: every key has an accessibility label that names its action', async () => {
    await renderScientific();

    for (const name of [
      'Second function',
      'Degree mode',
      'Sine',
      'Square root',
      'Pi',
      'Clear entry',
      'Backspace',
      'Equals',
    ]) {
      expect(screen.getByRole('button', { name })).toBeTruthy();
    }
    expect(screen.getByRole('button', { name: 'Second function' })).not.toBeSelected();
    expect(screen.getByRole('button', { name: 'Degree mode' })).not.toBeSelected();
    expect(screen.getByLabelText(/^Display\./)).toBeTruthy();
  });

  it('AC-27: every key is at least the minimum touch target', async () => {
    await renderScientific();

    // Mode tabs are not keypad keys; NFR-2 lists them as exceptions.
    // Mode tabs and the header HISTORY button are not keypad keys. NFR-2 lists them as exceptions;
    // HISTORY reaches the touch target through hit slop, as on the standard screen.
    const nonKeys = ['COMP', 'STAT', 'BASE-N', 'MATRIX', 'Open calculation history'];
    const keys = screen.getAllByRole('button').filter((button) => !nonKeys.includes(button.props.accessibilityLabel));
    expect(keys).toHaveLength(35);
    for (const key of keys) {
      const style = StyleSheet.flatten(key.props.style);
      expect(style.minHeight).toBeGreaterThanOrEqual(48);
      expect(style.minWidth).toBeGreaterThanOrEqual(48);
    }
  });

  it('AC-28: the converter key is disabled and do not change the display', async () => {
    await renderScientific();

    for (const name of ['Converter (not available yet)']) {
      const key = screen.getByRole('button', { name });
      expect(key).toBeDisabled();
      await fireEvent.press(key);
    }

    expect(primaryValue()).toHaveTextContent('0');
  });

  it('AC-29: the header and indicator row match the design, and FIX is dim', async () => {
    await renderScientific();

    expect(screen.getByText('FX-990 SCIENTIFIC')).toBeTruthy();
    expect(screen.getByText('10-DIGIT')).toBeTruthy();
    expect(screen.getByText('V.P.A.M.')).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByText('FIX').props.style).color).toBe(light.displayInactiveText);
    expect(StyleSheet.flatten(screen.getByText('SCI').props.style).color).toBe(light.displayText);
  });

  it('the HISTORY button in the header opens the history screen', async () => {
    const { onHistoryPress } = await renderScientific();

    await tap('Open calculation history');

    expect(onHistoryPress).toHaveBeenCalledTimes(1);
  });

  it('AC-30:the S key left of = calls onStandardPress, and the header has no STANDARD control', async () => {
    const { onStandardPress } = await renderScientific();

    expect(screen.queryByText('STANDARD')).toBeNull();
    expect(screen.getByRole('button', { name: 'Standard calculator' })).toHaveTextContent('S');
    await tap('Standard calculator');

    expect(onStandardPress).toHaveBeenCalledTimes(1);
  });
});
