import { Navigate } from 'react-router-dom';

import { AccountForm } from '@features/account-settings';
import { useSession } from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import { FormPageLayout } from '@shared/ui/form-layout';

export const AccountPage = () => {
  const { isAuthenticated } = useSession();

  if (!isAuthenticated) {
    return <Navigate to={appRoutes.login} replace />;
  }

  return (
    <FormPageLayout>
      <AccountForm />
    </FormPageLayout>
  );
};
