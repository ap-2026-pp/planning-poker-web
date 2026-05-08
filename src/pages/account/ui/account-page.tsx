import { Grid, Stack } from '@mui/material';
import { Navigate } from 'react-router-dom';

import { useSession } from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import { PageSection } from '@shared/ui/PageSection';
import { AccountDisplayNameForm } from './account-display-name-form';
import { AccountPasswordForm } from './account-password-form';
import styles from './account-page.module.css';

export const AccountPage = () => {
  const { isAuthenticated } = useSession();

  if (!isAuthenticated) {
    return <Navigate to={appRoutes.login} replace />;
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 4 }}>
        <PageSection
          eyebrow="Мій акаунт"
          title="Керуйте профілем і безпекою"
          description="Тут можна змінити глобальне імʼя для акаунта та оновити пароль."
        />
      </Grid>

      <Grid size={{ xs: 12, lg: 8 }}>
        <Stack className={styles.formsColumn}>
          <AccountDisplayNameForm />
          <AccountPasswordForm />
        </Stack>
      </Grid>
    </Grid>
  );
};
