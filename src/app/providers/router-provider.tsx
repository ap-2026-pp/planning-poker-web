import type { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';

export const RouterProvider = ({ children }: PropsWithChildren) => (
  <BrowserRouter>{children}</BrowserRouter>
);
