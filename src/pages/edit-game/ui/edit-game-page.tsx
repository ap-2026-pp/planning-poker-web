import { Box } from '@mui/material';
import { Navigate, useParams } from 'react-router-dom';

import { useSession } from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import { GameForm } from '@pages/create-game/ui/game-form';
import styles from '@pages/create-game/ui/create-game-page.module.css';

export const EditGamePage = () => {
  const { isAuthenticated } = useSession();
  const { gameId } = useParams<{ gameId: string }>();

  if (!isAuthenticated) {
    return <Navigate to={appRoutes.home} replace />;
  }

  if (!gameId) {
    return <Navigate to={appRoutes.home} replace />;
  }

  return (
    <Box className={styles.root}>
      <Box className={styles.backdrop} />

      <Box className={styles.cardWrap}>
        <Box className={styles.cardColumn}>
          <GameForm mode="edit" gameId={gameId} />
        </Box>
      </Box>
    </Box>
  );
};
