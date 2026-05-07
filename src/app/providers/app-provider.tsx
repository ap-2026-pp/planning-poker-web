import type { ReactNode } from 'react';

import { RouterProvider } from './router-provider';
import { SessionProvider } from './session-provider';
import { ThemeProviderRoot } from './theme-provider';

type AppProviderProps = {
  children: ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <ThemeProviderRoot>
      <RouterProvider>
        <SessionProvider>{children}</SessionProvider>
      </RouterProvider>
    </ThemeProviderRoot>
  );
};
