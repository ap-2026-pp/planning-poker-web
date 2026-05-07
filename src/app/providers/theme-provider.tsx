import type { PropsWithChildren } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import { appTheme } from '@shared/theme/theme';

export const ThemeProviderRoot = ({ children }: PropsWithChildren) => (
  <ThemeProvider theme={appTheme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);
