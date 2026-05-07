import { Grid } from '@mui/material';

import { PageSection } from '@shared/ui/PageSection';
import { RegisterForm } from './register-form';

export const RegisterPage = () => (
  <Grid container spacing={3}>
    <Grid size={{ xs: 12, lg: 5 }}>
      <PageSection
        eyebrow="New account"
        title="Створіть акаунт і запускайте першу сесію"
        description="Після реєстрації можна одразу створювати кімнати, запрошувати учасників і вести оцінювання в одному просторі."
      />
    </Grid>
    <Grid size={{ xs: 12, lg: 7 }}>
      <RegisterForm />
    </Grid>
  </Grid>
);
