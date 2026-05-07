import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { useSession } from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import styles from './main-page.module.css';

const CardFan = ({ muted = false }: { muted?: boolean }) => {
  const cards = [
    { label: '0', positionClass: styles.card0, active: false },
    { label: '1', positionClass: styles.card1, active: false },
    { label: '2', positionClass: styles.card2, active: false },
    { label: '3', positionClass: styles.card3, active: false },
    { label: '5', positionClass: styles.card4, active: false },
    { label: '8', positionClass: styles.card5, active: false },
    { label: '?', positionClass: styles.card6, active: true },
  ];

  return (
    <Box className={styles.cardFan}>
      {[styles.sparkle0, styles.sparkle1, styles.sparkle2, styles.sparkle3, styles.sparkle4].map((sparkleClass, index) => (
        <Box
          key={index}
          className={[
            styles.sparkle,
            sparkleClass,
            muted ? styles.sparkleMuted : styles.sparkleActive,
          ].join(' ')}
        />
      ))}

      <Box className={[styles.leftIcon, muted ? styles.mutedIcon : styles.activeIcon].join(' ')}>
        {muted ? (
          <PersonOutlineRoundedIcon className={styles.heroIconLarge} />
        ) : (
          <Groups2RoundedIcon className={styles.heroIconLarge} />
        )}
      </Box>

      <Box className={[styles.rightIcon, muted ? styles.mutedIcon : styles.activeIconSecondary].join(' ')}>
        {muted ? (
          <PersonOutlineRoundedIcon className={styles.heroIconMedium} />
        ) : (
          <ChatBubbleOutlineRoundedIcon className={styles.heroIconMedium} />
        )}
      </Box>

      <Box className={styles.glow} />

      {cards.map((card) => (
        <Box
          key={card.label}
          className={[
            styles.card,
            card.positionClass,
            card.active ? styles.cardActive : styles.cardDefault,
            muted && !card.active ? styles.cardMuted : '',
          ].join(' ')}
        >
          {card.label}
        </Box>
      ))}
    </Box>
  );
};

type ActionCardProps = {
  accent: 'purple' | 'green' | 'blue';
  title: string;
  description: string;
  buttonLabel: string;
  to: string;
  icon: ReactNode;
};

const ActionCard = ({
  accent,
  title,
  description,
  buttonLabel,
  to,
  icon,
}: ActionCardProps) => {
  return (
    <Box className={styles.cardShell}>
      <Box
        className={[
          styles.cardIcon,
          accent === 'purple'
            ? styles.cardIconPurple
            : accent === 'green'
              ? styles.cardIconGreen
              : styles.cardIconBlue,
        ].join(' ')}
      >
        <Box className={styles.cardIconGlyph}>{icon}</Box>
      </Box>

      <Typography className={styles.cardTitle}>
        {title}
      </Typography>

      <Typography className={styles.cardDescription}>
        {description}
      </Typography>

      <Button
        component={RouterLink}
        to={to}
        variant="contained"
        size="large"
        className={[
          styles.cardButton,
          accent === 'purple'
            ? styles.cardButtonPurple
            : accent === 'green'
              ? styles.cardButtonGreen
              : styles.cardButtonBlue,
        ].join(' ')}
      >
        {buttonLabel}
      </Button>
    </Box>
  );
};

export const MainPage = () => {
  const { isAuthenticated } = useSession();

  return (
    <Box className={styles.root}>
      <Box className={styles.backdrop} />

      <Grid container spacing={{ xs: 4, lg: 5 }} alignItems="center" className={styles.grid}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack className={styles.heroColumn}>
            <Box className={styles.headingBlock}>
              <Typography component="h1" className={styles.title}>
                {isAuthenticated ? 'Ласкаво просимо до' : 'Planning Poker'}
              </Typography>

              <Typography component="h2" className={styles.accentTitle}>
                {isAuthenticated ? 'Planning Poker!' : 'для вашої команди'}
              </Typography>
            </Box>

            <Typography className={styles.description}>
              {isAuthenticated
                ? 'Створюйте ігри, запрошуйте команду та оцінюйте user stories разом легко та зручно.'
                : 'Простий інструмент для оцінки задач та спільного планування в команді.'}
            </Typography>

            <CardFan muted={!isAuthenticated} />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Grid container spacing={3} justifyContent={{ xs: 'stretch', lg: isAuthenticated ? 'flex-end' : 'center' }} className={styles.actionsGrid}>
            {isAuthenticated ? (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <ActionCard
                    accent="purple"
                    icon={<AddRoundedIcon fontSize="inherit" />}
                    title="Створити нову гру"
                    description="Створіть нову гру та запросіть учасників для планування."
                    buttonLabel="Створити гру"
                    to={appRoutes.createGame}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <ActionCard
                    accent="green"
                    icon={<ArrowForwardRoundedIcon fontSize="inherit" />}
                    title="Приєднатися до гри"
                    description="Введіть код гри, щоб приєднатися до існуючої сесії."
                    buttonLabel="Приєднатися"
                    to={appRoutes.joinGame}
                  />
                </Grid>
              </>
            ) : (
              <Grid size={{ xs: 12, md: 8, lg: 7 }}>
                <ActionCard
                  accent="blue"
                  icon={<LoginRoundedIcon fontSize="inherit" />}
                  title="Приєднатися до гри"
                  description="Введіть код гри, щоб приєднатися до існуючої сесії."
                  buttonLabel="Приєднатися"
                  to={appRoutes.joinGame}
                />
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
