import { Grid } from '@mui/material';

import { PageSection } from '@shared/ui/PageSection';
import { LoginForm } from './login-form';

export const LoginPage = () => (
  <Grid container spacing={3}>
    <Grid size={{ xs: 12, lg: 5 }}>
      <PageSection
        eyebrow="Welcome back"
        title="Поверніться до своєї команди за кілька секунд"
        description="Увійдіть, щоб створювати нові сесії, заходити в кімнати по коду та продовжувати оцінювання там, де зупинилися."
      />
    </Grid>
    <Grid size={{ xs: 12, lg: 7 }}>
      <LoginForm />
    </Grid>
  </Grid>
);
