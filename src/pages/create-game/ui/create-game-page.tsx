import { Navigate } from 'react-router-dom';

import { useSession } from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import { FormPageLayout } from '@shared/ui/form-layout';
import { CreateGameForm } from './create-game-form';

export const CreateGamePage = () => {
  const { isAuthenticated } = useSession();

  if (!isAuthenticated) {
    return <Navigate to={appRoutes.home} replace />;
  }

  return (
    <FormPageLayout>
      <CreateGameForm />
    </FormPageLayout>
  );
};