import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { Box, Button, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { useSession } from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import styles from './main-page.module.css';

type Accent = 'purple' | 'green' | 'blue';

type FeatureWidgetProps = {
  accent: Accent;
  title: string;
  description: string;
  icon: ReactNode;
};

type ActionWidgetProps = {
  accent: Accent;
  title: string;
  description: string;
  buttonLabel: string;
  to: string;
  icon: ReactNode;
  featured?: boolean;
  featuredLabel?: string;
};

const accentStyles: Record<
  Accent,
  {
    icon: string;
    button: string;
  }
> = {
  purple: {
    icon: styles.iconPurple,
    button: styles.widgetButtonPurple,
  },
  green: {
    icon: styles.iconGreen,
    button: styles.widgetButtonGreen,
  },
  blue: {
    icon: styles.iconBlue,
    button: styles.widgetButtonBlue,
  },
};

const featureWidgets: FeatureWidgetProps[] = [
  {
    accent: 'purple',
    icon: <BoltRoundedIcon fontSize="inherit" />,
    title: 'Миттєвий старт',
    description: 'Створюйте кімнату або підключайтеся по коду без довгих налаштувань і зайвих кроків.',
  },
  {
    accent: 'blue',
    icon: <VisibilityRoundedIcon fontSize="inherit" />,
    title: 'Прозоре голосування',
    description: 'Усі оцінки відкриваються одночасно, щоб команда чесно порівнювала думки по задачі.',
  },
  {
    accent: 'green',
    icon: <ChatBubbleOutlineRoundedIcon fontSize="inherit" />,
    title: 'Живе обговорення',
    description: 'Після розкриття карток команда одразу бачить розбіжності та швидко доходить згоди.',
  },
  {
    accent: 'purple',
    icon: <HistoryRoundedIcon fontSize="inherit" />,
    title: 'Історія рішень',
    description: 'Поверніться до попередніх голосувань і тримайте під рукою результати минулих оцінок.',
  },
];

const authenticatedActions: ActionWidgetProps[] = [
  {
    accent: 'purple',
    icon: <AddRoundedIcon fontSize="inherit" />,
    title: 'Створити нову гру',
    description: 'Запустіть нову сесію, запросіть команду та почніть оцінювання за кілька кліків.',
    buttonLabel: 'Створити гру',
    to: appRoutes.createGame,
    featured: true,
    featuredLabel: 'Нова сесія',
  },
  {
    accent: 'blue',
    icon: <ArrowForwardRoundedIcon fontSize="inherit" />,
    title: 'Приєднатися до гри',
    description: 'Введіть код кімнати та швидко поверніться до поточного командного обговорення.',
    buttonLabel: 'Приєднатися',
    to: appRoutes.joinGame,
    featured: true,
    featuredLabel: 'Швидкий вхід',
  },
];

const guestActions: ActionWidgetProps[] = [
  {
    accent: 'blue',
    icon: <ArrowForwardRoundedIcon fontSize="inherit" />,
    title: 'Приєднатися до гри',
    description: 'Отримали код кімнати від команди? Заходьте в активну сесію та долучайтеся до оцінювання.',
    buttonLabel: 'Приєднатися',
    to: appRoutes.joinGame,
    featured: true,
    featuredLabel: 'Швидкий вхід',
  },
];

const FeatureWidget = ({ accent, title, description, icon }: FeatureWidgetProps) => (
  <Box className={styles.featureCard}>
    <Box className={[styles.featureIcon, accentStyles[accent].icon].join(' ')}>
      <Box className={styles.featureIconGlyph}>{icon}</Box>
    </Box>

    <Typography className={styles.featureTitle}>{title}</Typography>
    <Typography className={styles.featureDescription}>{description}</Typography>
  </Box>
);

const ActionWidget = ({
  accent,
  title,
  description,
  buttonLabel,
  to,
  icon,
  featured = false,
  featuredLabel,
}: ActionWidgetProps) => (
  <Box
    className={[
      styles.widgetCard,
      featured ? styles.widgetCardFeatured : '',
    ].join(' ').trim()}
  >
    {featured ? <Box className={styles.featuredBadge}>{featuredLabel}</Box> : null}

    <Box
      className={[
        styles.widgetIcon,
        accentStyles[accent].icon,
        featured ? styles.widgetIconFeatured : '',
      ].join(' ').trim()}
    >
      <Box className={styles.widgetIconGlyph}>{icon}</Box>
    </Box>

    <Typography
      className={[styles.widgetTitle, featured ? styles.widgetTitleFeatured : ''].join(' ').trim()}
    >
      {title}
    </Typography>
    <Typography
      className={[
        styles.widgetDescription,
        featured ? styles.widgetDescriptionFeatured : '',
      ].join(' ').trim()}
    >
      {description}
    </Typography>

    <Button
      component={RouterLink}
      to={to}
      variant="contained"
      className={[
        styles.widgetButton,
        accentStyles[accent].button,
        featured ? styles.widgetButtonFeatured : '',
      ].join(' ').trim()}
    >
      {buttonLabel}
    </Button>
  </Box>
);

export const MainPage = () => {
  const { isAuthenticated } = useSession();
  const actionWidgets = isAuthenticated ? authenticatedActions : guestActions;

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

          <Box className={styles.featureGrid}>
            {featureWidgets.map((feature) => (
              <FeatureWidget key={feature.title} {...feature} />
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
            <ActionWidget key={widget.title} {...widget} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};
