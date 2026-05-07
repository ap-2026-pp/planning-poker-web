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
  return (
    <Box className={styles.cardFan}>
      {[styles.sparkle0, styles.sparkle1, styles.sparkle2, styles.sparkle3, styles.sparkle4].map(
        (sparkleClass, index) => (
          <Box
            key={index}
            className={[
              styles.sparkle,
              sparkleClass,
              muted ? styles.sparkleMuted : styles.sparkleActive,
            ].join(' ')}
          />
        ),
      )}

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

      <Box
        component="svg"
        viewBox="0 0 520 240"
        className={[styles.cardFanSvg, muted ? styles.cardFanSvgMuted : ''].join(' ')}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="cardGradientDefault" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.98)" />
            <stop offset="100%" stopColor="rgba(231,223,255,0.94)" />
          </linearGradient>

          <linearGradient id="cardGradientActive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c18eff" />
            <stop offset="100%" stopColor="#8e61ff" />
          </linearGradient>
        </defs>

        <g transform="translate(70,42)">
          <g transform="translate(0,18) rotate(-20 42 88)">
            <rect x="0" y="0" rx="16" ry="16" width="84" height="136" className={styles.svgCardDefault} />
            <text x="42" y="76" textAnchor="middle" className={styles.svgCardText}>0</text>
          </g>

          <g transform="translate(48,10) rotate(-13 42 88)">
            <rect x="0" y="0" rx="16" ry="16" width="84" height="136" className={styles.svgCardDefault} />
            <text x="42" y="76" textAnchor="middle" className={styles.svgCardText}>1</text>
          </g>

          <g transform="translate(98,4) rotate(-7 42 88)">
            <rect x="0" y="0" rx="16" ry="16" width="84" height="136" className={styles.svgCardDefault} />
            <text x="42" y="76" textAnchor="middle" className={styles.svgCardText}>2</text>
          </g>

          <g transform="translate(148,0) rotate(-1 42 88)">
            <rect x="0" y="0" rx="16" ry="16" width="84" height="136" className={styles.svgCardDefault} />
            <text x="42" y="76" textAnchor="middle" className={styles.svgCardText}>3</text>
          </g>

          <g transform="translate(198,2) rotate(6 42 88)">
            <rect x="0" y="0" rx="16" ry="16" width="84" height="136" className={styles.svgCardDefault} />
            <text x="42" y="76" textAnchor="middle" className={styles.svgCardText}>5</text>
          </g>

          <g transform="translate(248,8) rotate(13 42 88)">
            <rect x="0" y="0" rx="16" ry="16" width="84" height="136" className={styles.svgCardDefault} />
            <text x="42" y="76" textAnchor="middle" className={styles.svgCardText}>8</text>
          </g>

          <g transform="translate(298,16) rotate(20 42 88)">
            <rect x="0" y="0" rx="16" ry="16" width="84" height="136" className={styles.svgCardActive} />
            <text x="42" y="76" textAnchor="middle" className={styles.svgCardTextActive}>?</text>
          </g>
        </g>
      </Box>
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

      <Typography className={styles.cardTitle}>{title}</Typography>

      <Typography className={styles.cardDescription}>{description}</Typography>

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
    <Box className={styles.layout}>
      <Box className={styles.leftColumn}>
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
      </Box>

      <Box className={styles.rightColumn}>
        <Grid container spacing={3} className={styles.actionsGrid}>
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
            <Grid size={{ xs: 12 }} className={styles.singleActionWrap}>
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
      </Box>
    </Box>
  );
};
