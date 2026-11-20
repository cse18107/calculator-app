import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from '../Button';

describe('Button', () => {
  it('exposes the label as an accessible button', async () => {
    await render(<Button label="Apply theme" onPress={() => {}} />);

    expect(screen.getByRole('button', { name: 'Apply theme' })).toBeOnTheScreen();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    await render(<Button label="Apply theme" onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: 'Apply theme' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled and reports the disabled state', async () => {
    const onPress = jest.fn();
    await render(<Button label="Reset" onPress={onPress} disabled />);

    const button = screen.getByRole('button', { name: 'Reset' });
    fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });
});
