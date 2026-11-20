import { render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/index';
import { ThemeProvider } from '@/theme/ThemeProvider';

describe('HomeScreen placeholder', () => {
  it('renders the app title and foundation status inside the theme provider', async () => {
    await render(
      <ThemeProvider>
        <HomeScreen />
      </ThemeProvider>,
    );

    expect(screen.getByText('Calculator')).toBeOnTheScreen();
    expect(screen.getByText(/Foundation ready/)).toBeOnTheScreen();
  });
});
