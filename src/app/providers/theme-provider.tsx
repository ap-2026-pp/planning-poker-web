import { useMemo, type PropsWithChildren } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import {
  ThemeSettingsProvider,
  createAppTheme,
  useThemeSettings,
} from '@shared/config/theme';

const MuiThemeProvider = ({ children }: PropsWithChildren) => {
  const { accentColor, resolvedTheme } = useThemeSettings();
  const theme = useMemo(
    () => createAppTheme({ mode: resolvedTheme, accentColor }),
    [accentColor, resolvedTheme],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
};

export const ThemeProviderRoot = ({ children }: PropsWithChildren) => (
  <ThemeSettingsProvider>
    <MuiThemeProvider>{children}</MuiThemeProvider>
  </ThemeSettingsProvider>
);
