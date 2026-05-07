import { Grid } from '@mui/material';
import { Navigate } from 'react-router-dom';

import { useSession } from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import { PageSection } from '@shared/ui/PageSection';
import { CreateGameForm } from './create-game-form';

export const CreateGamePage = () => {
  const { isAuthenticated } = useSession();

  if (!isAuthenticated) {
    return <Navigate to={appRoutes.home} replace />;
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 5 }}>
        <PageSection
          eyebrow="Нова сесія"
          title="Налаштуйте нову сесію для команди"
          description="Дайте назву кімнаті, оберіть формат карт і задайте кілька простих правил для наступного раунду."
        />
      </Grid>
      <Grid size={{ xs: 12, lg: 7 }}>
        <CreateGameForm />
      </Grid>
    </Grid>
  );
};
