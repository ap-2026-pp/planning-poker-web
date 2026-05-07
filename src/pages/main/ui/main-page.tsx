import { Box, Stack, Typography } from '@mui/material';

import { useSession } from '@shared/auth';
import {
  featureWidgets,
  getMainPageActions,
  getMainPageHeroContent,
} from '../model/main-page-content';
import { ActionWidget } from './action-widget';
import { FeatureWidget } from './feature-widget';
import styles from './main-page.module.css';

export const MainPage = () => {
  const { isAuthenticated } = useSession();
  const heroContent = getMainPageHeroContent(isAuthenticated);
  const actionWidgets = getMainPageActions(isAuthenticated);

  return (
    <Box className={styles.layout}>
      <Box className={styles.leftColumn}>
        <Stack className={styles.heroColumn}>
          <Box className={styles.headingBlock}>
            <Typography component="h1" className={styles.title}>
              {heroContent.title}
            </Typography>

            <Typography component="h2" className={styles.accentTitle}>
              {heroContent.accentTitle}
            </Typography>
          </Box>

          <Typography className={styles.description}>{heroContent.description}</Typography>

          <Box className={styles.featureGrid}>
            {featureWidgets.map((feature) => (
              <FeatureWidget key={feature.title} feature={feature} />
            ))}
          </Box>
        </Stack>
      </Box>

      <Box className={styles.rightColumn}>
        <Box
          className={[
            styles.widgetsGrid,
            isAuthenticated ? styles.widgetsGridAuthenticated : styles.widgetsGridGuest,
          ].join(' ')}
        >
          {actionWidgets.map((widget) => (
            <ActionWidget key={widget.title} action={widget} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};
