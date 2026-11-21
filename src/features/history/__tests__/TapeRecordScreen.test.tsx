import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Alert, Share, StyleSheet, Text as NativeText } from 'react-native';
import { router } from 'expo-router';

import { AppStateProvider } from '@/features/calculator/AppStateProvider';
import { useAppState } from '@/features/calculator/useAppState';
import { type AppState, initialAppState } from '@/domain/memory';
import { calculatorReducer, initialCalculatorState, type CalculatorAction } from '@/domain/calculator';
import { historyReducer, initialHistoryState, type HistoryAction } from '@/domain/history';

import { TapeRecordScreen } from '../TapeRecordScreen';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn() } }));

/** Exposes calculator and memory values so tests can check what USE and other actions changed. */
function Probe() {
  const { state } = useAppState();
  return (
    <>
      <NativeText testID="probe-entry">{state.calc.entry}</NativeText>
      <NativeText testID="probe-status">{state.calc.status}</NativeText>
      <NativeText testID="probe-operator">{state.calc.operator ?? 'none'}</NativeText>
      <NativeText testID="probe-memory">{String(state.memory)}</NativeText>
    </>
  );
}

/** Builds a starting state with history entries (oldest first) and an optional calculator state. */
function seededState(calculations: readonly [string, string][], calcActions: CalculatorAction[] = []): AppState {
  const actions: HistoryAction[] = calculations.map(([expression, result]) => ({
    type: 'record',
    expression,
    result,
    createdAt: 1_000,
  }));
  return {
    ...initialAppState,
    calc: calcActions.reduce(calculatorReducer, initialCalculatorState),
    history: actions.reduce(historyReducer, initialHistoryState),
  };
}

async function renderTapeRecord(initialState?: AppState) {
  return await render(
    <AppStateProvider initialState={initialState}>
      <TapeRecordScreen />
      <Probe />
    </AppStateProvider>,
  );
}

const TWO_CALCULATIONS: readonly [string, string][] = [
  ['2 × 3 =', '6'],
  ['1,250 + 4,890.5 =', '6140.5'],
];

async function press(name: string) {
  await fireEvent.press(screen.getByRole('button', { name }));
}

async function selectCheckbox(expression: string, result: string) {
  await fireEvent.press(screen.getByRole('checkbox', { name: `Select calculation ${expression} ${result}` }));
}

describe('Tape Record screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('AC-12: shows the header, the ALL tab selected, and each card with its expression, result, checkbox and USE', async () => {
    await renderTapeRecord(seededState(TWO_CALCULATIONS));

    expect(screen.getByText('TAPE RECORD')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Filter: all' })).toBeSelected();
    expect(screen.getByText('1,250 + 4,890.5 =')).toBeOnTheScreen();
    expect(screen.getByText('6,140.5')).toBeOnTheScreen();
    expect(screen.getByRole('checkbox', { name: 'Select calculation 1,250 + 4,890.5 = 6,140.5' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Use result 6,140.5' })).toBeOnTheScreen();
  });

  it('AC-13: with no selection the action area says so, and selection actions are disabled', async () => {
    await renderTapeRecord(seededState(TWO_CALCULATIONS));

    expect(screen.getByText('No items selected')).toBeOnTheScreen();
    for (const name of [
      'Pin selected calculations',
      'Use selected result in calculator',
      'Share selected calculations',
      'Delete selected calculations',
    ]) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    }
    expect(screen.getByRole('button', { name: 'Back to calculator' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Clear all calculations' })).toBeEnabled();
  });

  it('AC-14: the BASIC, PINNED and SCIENTIFIC tabs show matching entries or their empty message', async () => {
    await renderTapeRecord(seededState(TWO_CALCULATIONS));

    await fireEvent.press(screen.getByRole('tab', { name: 'Filter: basic' }));
    expect(screen.getByText('6,140.5')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('tab', { name: 'Filter: pinned' }));
    expect(screen.getByText('No pinned calculations yet')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('tab', { name: 'Filter: scientific' }));
    expect(screen.getByText('No scientific calculations yet')).toBeOnTheScreen();
  });

  it('AC-15: changing the filter clears the selection', async () => {
    await renderTapeRecord(seededState(TWO_CALCULATIONS));
    await selectCheckbox('2 × 3 =', '6');
    expect(screen.getByText('1 items selected')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('tab', { name: 'Filter: basic' }));

    expect(screen.getByText('No items selected')).toBeOnTheScreen();
  });

  it('AC-16: SELECT ALL selects every visible entry', async () => {
    await renderTapeRecord(seededState(TWO_CALCULATIONS));

    await press('Select all calculations');

    expect(screen.getByText('2 items selected')).toBeOnTheScreen();
    expect(screen.getByRole('checkbox', { name: 'Select calculation 2 × 3 = 6' })).toBeChecked();
  });

  it('AC-17: PIN pins the selection, and a second PIN unpins it', async () => {
    await renderTapeRecord(seededState(TWO_CALCULATIONS));
    await selectCheckbox('2 × 3 =', '6');

    await press('Pin selected calculations');
    expect(screen.getByLabelText('Pinned')).toBeOnTheScreen();

    await press('Pin selected calculations');
    expect(screen.queryByLabelText('Pinned')).toBeNull();
  });

  it('AC-19: USE IN CALC places the result in the calculator and returns to it', async () => {
    await renderTapeRecord(seededState([['2 × 3 =', '6140.5']]));
    await selectCheckbox('2 × 3 =', '6,140.5');

    await press('Use selected result in calculator');

    expect(screen.getByTestId('probe-entry')).toHaveTextContent('6140.5');
    expect(screen.getByTestId('probe-status')).toHaveTextContent('entry');
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('AC-20: USE on a card while an operator is pending makes the result the right operand', async () => {
    const state = seededState(
      [['4 + 4 =', '5']],
      [
        { type: 'digit', digit: '1' },
        { type: 'operator', operator: 'add' },
      ],
    );
    await renderTapeRecord(state);

    await press('Use result 5');

    expect(screen.getByTestId('probe-entry')).toHaveTextContent('5');
    expect(screen.getByTestId('probe-operator')).toHaveTextContent('add');
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('AC-21: USE IN CALC with several selected uses the first selected entry in list order', async () => {
    await renderTapeRecord(seededState(TWO_CALCULATIONS));
    await press('Select all calculations');

    await press('Use selected result in calculator');

    expect(screen.getByTestId('probe-entry')).toHaveTextContent('6140.5');
  });

  it('AC-22: SHARE opens the share sheet with one "<expression> <result>" line per entry', async () => {
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction, activityType: undefined });
    await renderTapeRecord(seededState(TWO_CALCULATIONS));
    await press('Select all calculations');

    await press('Share selected calculations');

    expect(share).toHaveBeenCalledWith({ message: '1,250 + 4,890.5 = 6,140.5\n2 × 3 = 6' });
    share.mockRestore();
  });

  it('AC-23: the FILTER button is disabled and does nothing', async () => {
    await renderTapeRecord(seededState(TWO_CALCULATIONS));

    expect(screen.getByRole('button', { name: 'Filter (not available yet)' })).toBeDisabled();
  });

  it('AC-24: DELETE asks first; cancel keeps the entries and confirm removes the selection', async () => {
    const alert = jest.spyOn(Alert, 'alert');
    await renderTapeRecord(seededState(TWO_CALCULATIONS));
    await selectCheckbox('2 × 3 =', '6');

    await press('Delete selected calculations');
    const [, , buttons] = alert.mock.calls[0] ?? [];
    expect(buttons?.[0]?.style).toBe('cancel');
    expect(screen.getByText('2 × 3 =')).toBeOnTheScreen();

    await act(async () => {
      buttons?.[1]?.onPress?.();
    });
    expect(screen.queryByText('2 × 3 =')).toBeNull();
    expect(screen.getByText('1,250 + 4,890.5 =')).toBeOnTheScreen();
    alert.mockRestore();
  });

  it('AC-25: CLEAR ALL removes every entry, pinned included, after confirmation', async () => {
    const alert = jest.spyOn(Alert, 'alert');
    await renderTapeRecord(seededState(TWO_CALCULATIONS));
    await selectCheckbox('2 × 3 =', '6');
    await press('Pin selected calculations');

    await press('Clear all calculations');
    const [, , buttons] = alert.mock.calls[0] ?? [];
    await act(async () => {
      buttons?.[1]?.onPress?.();
    });

    expect(screen.getByText('No calculations yet')).toBeOnTheScreen();
    alert.mockRestore();
  });

  it('AC-26: BACK TO CALC returns to the calculator and clears the selection', async () => {
    await renderTapeRecord(seededState(TWO_CALCULATIONS));
    await selectCheckbox('2 × 3 =', '6');

    await press('Back to calculator');

    expect(router.back).toHaveBeenCalledTimes(1);
    expect(screen.getByText('No items selected')).toBeOnTheScreen();
  });

  it('AC-27: selecting, pinning and filtering leave the calculator and memory unchanged', async () => {
    await renderTapeRecord(seededState(TWO_CALCULATIONS, [{ type: 'digit', digit: '7' }]));

    await selectCheckbox('2 × 3 =', '6');
    await press('Pin selected calculations');
    await fireEvent.press(screen.getByRole('tab', { name: 'Filter: pinned' }));

    expect(screen.getByTestId('probe-entry')).toHaveTextContent('7');
    expect(screen.getByTestId('probe-memory')).toHaveTextContent('0');
  });

  it('AC-28: a fresh app state starts with an empty history', async () => {
    await renderTapeRecord();

    expect(screen.getByText('No calculations yet')).toBeOnTheScreen();
  });

  it('AC-29: an empty list shows the empty state', async () => {
    await renderTapeRecord();

    expect(screen.getByText('No calculations yet')).toBeOnTheScreen();
  });

  it('AC-30: each checkbox exposes its checked state, and controls have accessibility labels', async () => {
    await renderTapeRecord(seededState(TWO_CALCULATIONS));
    const checkbox = screen.getByRole('checkbox', { name: 'Select calculation 2 × 3 = 6' });
    expect(checkbox).not.toBeChecked();

    await selectCheckbox('2 × 3 =', '6');

    expect(checkbox).toBeChecked();
    expect(screen.getByRole('button', { name: 'Share selected calculations' })).toBeOnTheScreen();
  });

  it('AC-31: tabs, checkboxes and the bottom bar reach a 48pt touch target with hit slop', async () => {
    await renderTapeRecord(seededState(TWO_CALCULATIONS));

    const tab = screen.getByRole('tab', { name: 'Filter: all' });
    const tabHeight = StyleSheet.flatten(tab.props.style).height;
    expect(tabHeight + tab.props.hitSlop.top + tab.props.hitSlop.bottom).toBeGreaterThanOrEqual(48);

    const checkbox = screen.getByRole('checkbox', { name: 'Select calculation 2 × 3 = 6' });
    expect(18 + checkbox.props.hitSlop.top + checkbox.props.hitSlop.bottom).toBeGreaterThanOrEqual(48);

    const back = screen.getByRole('button', { name: 'Back to calculator' });
    expect(32 + back.props.hitSlop.top + back.props.hitSlop.bottom).toBeGreaterThanOrEqual(48);
  });
});
