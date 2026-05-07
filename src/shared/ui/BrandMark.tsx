import { Box, Typography } from '@mui/material';
import styles from './brand-mark.module.css';

export const BrandMark = ({ inverse = false }: { inverse?: boolean }) => (
  <div className={styles.root}>
    <Box className={styles.cards}>
      {[
        { label: '2', positionClass: styles.cardFirst, accent: false },
        { label: '3', positionClass: styles.cardSecond, accent: true },
        { label: '3', positionClass: styles.cardThird, accent: false },
      ].map((card) => (
        <Box
          key={`${card.label}-${card.positionClass}`}
          className={[
            styles.card,
            card.accent ? styles.cardAccent : styles.cardDefault,
            card.positionClass,
          ].join(' ')}
        >
          {card.label}
        </Box>
      ))}
    </Box>

    <Typography
      className={[styles.title, inverse ? styles.titleInverse : styles.titleDefault].join(' ')}
    >
      <Box component="span">Planning </Box>
      <Box component="span" className={styles.accent}>
        Poker
      </Box>
    </Typography>
  </div>
);
