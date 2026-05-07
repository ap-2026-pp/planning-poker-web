import { useContext } from 'react';

import { SessionContext } from './session-context';

export const useSession = () => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used inside SessionProvider');
  }

  return context;
};
