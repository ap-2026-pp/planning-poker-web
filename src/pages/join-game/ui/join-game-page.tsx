import { Grid } from '@mui/material';

import { PageSection } from '@shared/ui/PageSection';
import { JoinGameForm } from './join-game-form';

export const JoinGamePage = () => (
  <Grid container spacing={3}>
    <Grid size={{ xs: 12, lg: 5 }}>
      <PageSection
        eyebrow="Вхід у кімнату"
        title="Уведіть код і заходьте в кімнату"
        description="Швидкий спосіб потрапити в сесію без зайвих кроків. Вкажіть код і, за бажанням, своє ім’я в кімнаті."
      />
    </Grid>
    <Grid size={{ xs: 12, lg: 7 }}>
      <JoinGameForm />
    </Grid>
  </Grid>
);
