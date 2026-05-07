import { Card, CardContent, Stack, Typography } from '@mui/material';
import styles from './info-stat.module.css';

type InfoStatProps = {
  label: string;
  value: string;
  caption?: string;
};

export const InfoStat = ({ label, value, caption }: InfoStatProps) => (
  <Card className={styles.card}>
    <CardContent className={styles.content}>
      <Stack className={styles.stack}>
        <Typography variant="caption" color="text.secondary" className={styles.label}>
          {label}
        </Typography>
        <Typography variant="h3" className={styles.value}>
          {value}
        </Typography>
        {caption ? (
          <Typography variant="body2" color="text.secondary" className={styles.caption}>
            {caption}
          </Typography>
        ) : null}
      </Stack>
    </CardContent>
  </Card>
);
