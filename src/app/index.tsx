import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@app/styles/global.css';
import { AppProvider } from '@app/providers/app-provider';
import { AppRoutes } from '@app/routes/routes';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  </StrictMode>
);
