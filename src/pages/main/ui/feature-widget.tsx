import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { Box, Typography } from '@mui/material';
import type { ReactElement } from 'react';

import type { Accent, MainPageFeature, MainPageIcon } from '../model/main-page-content';
import styles from './feature-widget.module.css';

const iconByName: Record<MainPageIcon, ReactElement> = {
  'instant-start': <BoltRoundedIcon fontSize="inherit" />,
  'transparent-voting': <VisibilityRoundedIcon fontSize="inherit" />,
  'live-discussion': <ChatBubbleOutlineRoundedIcon fontSize="inherit" />,
  'decision-history': <HistoryRoundedIcon fontSize="inherit" />,
  'create-game': <BoltRoundedIcon fontSize="inherit" />,
  'join-game': <BoltRoundedIcon fontSize="inherit" />,
};

const iconAccentStyles: Record<Accent, string> = {
  purple: styles.iconPurple,
  green: styles.iconGreen,
  blue: styles.iconBlue,
};

type FeatureWidgetProps = {
  feature: MainPageFeature;
};

export const FeatureWidget = ({ feature }: FeatureWidgetProps) => (
  <Box className={styles.featureCard}>
    <Box className={[styles.featureIcon, iconAccentStyles[feature.accent]].join(' ')}>
      <Box className={styles.featureIconGlyph}>{iconByName[feature.icon]}</Box>
    </Box>

    <Typography className={styles.featureTitle}>{feature.title}</Typography>
    <Typography className={styles.featureDescription}>{feature.description}</Typography>
  </Box>
);
