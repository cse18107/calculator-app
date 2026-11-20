import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { type Theme, themes } from './theme';

const ThemeContext = createContext<Theme>(themes.light);

/**
 * Supplies the design-system theme to the tree. The mode follows the system
 * color scheme until a user-selected theme is specified.
 */
export function ThemeProvider({ children }: PropsWithChildren) {
  const scheme = useColorScheme();
  const theme = useMemo(() => (scheme === 'dark' ? themes.dark : themes.light), [scheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
