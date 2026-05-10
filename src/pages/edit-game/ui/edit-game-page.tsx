import { Navigate, useParams } from 'react-router-dom';

import { useSession } from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import { FormPageLayout } from '@shared/ui/form-layout';
import { GameForm } from '@pages/create-game/ui/game-form';

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
    <FormPageLayout>
      <GameForm mode="edit" gameId={gameId} />
    </FormPageLayout>
  );
};