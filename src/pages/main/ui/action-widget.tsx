import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Box, Button, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import type { Accent, MainPageAction, MainPageIcon } from '../model/main-page-content';
import styles from './action-widget.module.css';

const iconByName: Record<MainPageIcon, ReactElement> = {
  'instant-start': <ArrowForwardRoundedIcon fontSize="inherit" />,
  'transparent-voting': <ArrowForwardRoundedIcon fontSize="inherit" />,
  'live-discussion': <ArrowForwardRoundedIcon fontSize="inherit" />,
  'decision-history': <ArrowForwardRoundedIcon fontSize="inherit" />,
  'create-game': <AddRoundedIcon fontSize="inherit" />,
  'join-game': <ArrowForwardRoundedIcon fontSize="inherit" />,
};

const iconAccentStyles: Record<Accent, string> = {
  purple: styles.iconPurple,
  green: styles.iconGreen,
  blue: styles.iconBlue,
};

const buttonAccentStyles: Record<Accent, string> = {
  purple: styles.widgetButtonPurple,
  green: styles.widgetButtonGreen,
  blue: styles.widgetButtonBlue,
};

type ActionWidgetProps = {
  action: MainPageAction;
};

export const ActionWidget = ({ action }: ActionWidgetProps) => {
  const { pathname, search } = useLocation();
  const currentPath = `${pathname}${search}`;

  return (
    <Box
      className={[
        styles.widgetCard,
        action.featured ? styles.widgetCardFeatured : '',
      ]
        .join(' ')
        .trim()}
    >
      {action.featured ? <Box className={styles.featuredBadge}>{action.featuredLabel}</Box> : null}

      <Box
        className={[
          styles.widgetIcon,
          iconAccentStyles[action.accent],
          action.featured ? styles.widgetIconFeatured : '',
        ]
          .join(' ')
          .trim()}
      >
        <Box className={styles.widgetIconGlyph}>{iconByName[action.icon]}</Box>
      </Box>

      <Typography
        className={[
          styles.widgetTitle,
          action.featured ? styles.widgetTitleFeatured : '',
        ]
          .join(' ')
          .trim()}
      >
        {action.title}
      </Typography>

      <Typography
        className={[
          styles.widgetDescription,
          action.featured ? styles.widgetDescriptionFeatured : '',
        ]
          .join(' ')
          .trim()}
      >
        {action.description}
      </Typography>

      <Button
        component={RouterLink}
        to={action.to}
        state={{ from: currentPath }}
        variant="contained"
        className={[
          styles.widgetButton,
          buttonAccentStyles[action.accent],
          action.featured ? styles.widgetButtonFeatured : '',
        ]
          .join(' ')
          .trim()}
      >
        {action.buttonLabel}
      </Button>
    </Box>
  );
};