import {
  Alert,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { VotingHistoryList } from '@entities/history';
import { getVotingHistoryRequest } from '@shared/api';
import { InfoStat } from '@shared/ui/InfoStat';
import { PageSection } from '@shared/ui/PageSection';
import { formatDateTime, formatDuration } from '@shared/utils/time';
import styles from './voting-history-page.module.css';

export const VotingHistoryPage = () => {
  const { gameId = '' } = useParams();
  const [history, setHistory] = useState<VotingHistoryList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getVotingHistoryRequest(gameId);

        if (isMounted) {
          setHistory(result);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Не вдалося отримати історію голосувань'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, [gameId]);

  const rounds = history?.items ?? [];
  const latestRound = rounds[0];
  const averageAgreement = rounds.length
    ? `${Math.round(rounds.reduce((sum, item) => sum + item.agreementPercent, 0) / rounds.length)}%`
    : '—';

  return (
    <Stack className={styles.root}>
      <PageSection
        eyebrow="Session history"
        title="Історія раундів і фінальних оцінок"
        description="Поверніться до попередніх результатів, перегляньте домовленості команди й швидко згадайте, як завершився кожен раунд."
      />

      {loading ? <Alert severity="info">Завантажую історію...</Alert> : null}
      {error ? <Alert severity="warning">{error}</Alert> : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoStat
            label="Раундів"
            value={String(history?.totalCount ?? 0)}
            caption="Скільки завершених оцінювань уже є в цій сесії"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoStat
            label="Середня згода"
            value={averageAgreement}
            caption="Наскільки близькими були оцінки між учасниками"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <InfoStat
            label="Останній результат"
            value={latestRound?.result || '—'}
            caption={latestRound ? latestRound.issueName : 'Ще немає завершених раундів'}
          />
        </Grid>
      </Grid>

      <Stack className={styles.historyList}>
        {history?.items.length ? (
          history.items.map((item) => (
            <Card key={item.id}>
              <CardContent>
                <Stack className={styles.itemStack}>
                  <Stack className={styles.itemHeader}>
                    <Typography variant="h5">{item.issueName}</Typography>
                    <Chip
                      label={`${item.agreementPercent}% згоди`}
                      color={item.agreementPercent >= 70 ? 'primary' : 'secondary'}
                      variant="outlined"
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Результат: {item.result || 'ще не зафіксовано'} · Середнє: {item.average ?? '—'} · Найчастіша картка:{' '}
                    {item.mostVotedCard || '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Завершено: {formatDateTime(item.completedAt)} · Тривалість: {formatDuration(item.duration)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Проголосували: {item.votedCount}/{item.totalPlayers}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))
        ) : (
          <Alert severity="info">
            Історія ще порожня. Після першого завершеного раунду результати з’являться тут.
          </Alert>
        )}
      </Stack>
    </Stack>
  );
};
