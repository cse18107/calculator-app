import { fireEvent, render, screen } from '@testing-library/react-native';

import IndexRoute from '@/app/index';
import { ThemeProvider } from '@/theme/ThemeProvider';

describe('Home route', () => {
  it('renders the calculator with a 0 display inside the theme provider', async () => {
    await render(
      <ThemeProvider>
        <IndexRoute />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('calculator-display')).toHaveTextContent('0');
    expect(screen.getByRole('button', { name: 'Equals' })).toBeOnTheScreen();
  });

  it('accepts key presses from the home route', async () => {
    await render(
      <ThemeProvider>
        <IndexRoute />
      </ThemeProvider>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Nine' }));

    expect(screen.getByTestId('calculator-display')).toHaveTextContent('9');
  });
});
