import { Box } from '@mui/material';
import { Navigate } from 'react-router-dom';

import { useSession } from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import { CreateGameForm } from './create-game-form';
import styles from './create-game-page.module.css';

export const CreateGamePage = () => {
  const { isAuthenticated } = useSession();

  if (!isAuthenticated) {
    return <Navigate to={appRoutes.home} replace />;
  }

  return (
    <Box className={styles.root}>
      <Box className={styles.backdrop} />

      <Box className={styles.cardWrap}>
        <Box className={styles.cardColumn}>
          <CreateGameForm />
        </Box>
      </Box>
    </Box>
  );
};
