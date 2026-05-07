import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';

import type { Game, GameInvite } from '@entities/game';
import type { VotingSystem } from '@entities/game';
import type { Issue } from '@entities/issue';
import type { GameParticipant } from '@entities/participant';
import { ParticipantRole } from '@entities/participant';
import {
  getGameInviteRequest,
  getGameRequest,
  getIssuesRequest,
  getParticipantsRequest,
} from '@shared/api';
import { appRoutes } from '@shared/config/routes';
import { getVotingSystemLabel } from '@shared/model/voting';
import { PageSection } from '@shared/ui/PageSection';
import { IssuesPreview } from './issues-preview';
import styles from './game-room-page.module.css';

const roleLabels: Record<ParticipantRole, string> = {
  [ParticipantRole.Master]: 'Модератор',
  [ParticipantRole.Player]: 'Гравець',
  [ParticipantRole.Spectator]: 'Спостерігач',
};

export const GameRoomPage = () => {
  const { gameId = '' } = useParams();
  const [game, setGame] = useState<Game | null>(null);
  const [participants, setParticipants] = useState<GameParticipant[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [invite, setInvite] = useState<GameInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRoom = async () => {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        getGameRequest(gameId),
        getParticipantsRequest(gameId),
        getIssuesRequest(gameId),
        getGameInviteRequest(gameId),
      ]);

      if (!isMounted) {
        return;
      }

      const [gameResult, participantsResult, issuesResult, inviteResult] = results;

      if (gameResult.status === 'fulfilled') {
        setGame(gameResult.value);
      }

      if (participantsResult.status === 'fulfilled') {
        setParticipants(participantsResult.value);
      }

      if (issuesResult.status === 'fulfilled') {
        setIssues(issuesResult.value);
      }

      if (inviteResult.status === 'fulfilled') {
        setInvite(inviteResult.value);
      }

      const firstFailure = results.find((result) => result.status === 'rejected');

      if (firstFailure?.status === 'rejected') {
        setError(firstFailure.reason instanceof Error ? firstFailure.reason.message : 'Не вдалося завантажити кімнату');
      }

      setLoading(false);
    };

    void loadRoom();

    return () => {
      isMounted = false;
    };
  }, [gameId]);

  const onlineParticipants = participants.filter((participant) => participant.isConnected).length;
  const activeIssue = issues.find((issue) => issue.isCurrent);
  const inviteCode = invite?.inviteCode || game?.inviteCode || '—';
  const inviteUrl = invite?.inviteUrl;

  return (
    <Stack className={styles.root}>
      <PageSection
        eyebrow="Кімната сесії"
        title={game?.name || 'Кімната гри'}
        description="Запросіть команду, оберіть активну задачу і переходьте до наступного раунду оцінювання."
        actions={
          <Button component={RouterLink} to={appRoutes.votingHistory(gameId)} variant="contained">
            Історія оцінок
          </Button>
        }
      />

      {loading ? <Alert severity="info">Завантажую кімнату...</Alert> : null}
      {error ? <Alert severity="warning">{error}</Alert> : null}

      <Card className={styles.heroCard}>
        <CardContent className={styles.heroContent}>
          <Grid container spacing={2.5} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack className={styles.heroStack}>
                <Stack direction="row" className={styles.heroChips}>
                  <Chip label={`${participants.length} учасників`} color="primary" variant="outlined" />
                  <Chip label={`${onlineParticipants} онлайн`} color="secondary" variant="outlined" />
                  <Chip label={`${issues.length} задач`} variant="outlined" />
                </Stack>
                <Typography variant="h4">
                  {activeIssue ? activeIssue.title : 'Сесія готова до першої задачі'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {activeIssue
                    ? `Зараз у фокусі ${activeIssue.code ? `${activeIssue.code} · ` : ''}${activeIssue.title}.`
                    : 'Щойно оберете активну задачу, команда зможе перейти до наступного раунду оцінювання.'}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack className={styles.invitePanel}>
                <Typography variant="caption" color="text.secondary" className={styles.inviteLabel}>
                  Код кімнати
                </Typography>
                <Typography variant="h4" className={styles.inviteCode}>
                  {inviteCode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Поділіться кодом з учасниками, щоб вони швидко зайшли в цю сесію.
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <IssuesPreview issues={issues} />
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack className={styles.sidebar}>
            <Card>
              <CardContent>
                <Stack className={styles.settingsStack}>
                  <Typography variant="h5">Налаштування сесії</Typography>
                  <Chip
                    label={getVotingSystemLabel((game?.votingSystem ?? 0) as VotingSystem)}
                    color="primary"
                    variant="outlined"
                    className={styles.votingChip}
                  />
                  <Divider />
                  <Typography variant="body2" color="text.secondary">
                    Автовідкриття: {game?.autoRevealCards ? 'увімкнено' : 'вимкнено'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Середнє значення: {game?.showAverage ? 'показується' : 'приховано'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Відлік перед відкриттям: {game?.showCountdownAnimation ? 'увімкнено' : 'вимкнено'}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack className={styles.inviteStack}>
                  <Typography variant="h5">Запросити команду</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Код: {inviteCode}
                  </Typography>
                  {inviteUrl ? (
                    <Typography variant="body2" color="text.secondary" className={styles.inviteLink}>
                      Посилання: {inviteUrl}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Запросіть учасників за кодом кімнати або через посилання, коли воно буде доступне.
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack className={styles.participantsStack}>
                  <Typography variant="h5">Учасники</Typography>
                  {participants.length ? (
                    <List disablePadding>
                      {participants.map((participant) => (
                        <ListItem key={participant.id} disableGutters>
                          <ListItemText
                            primary={participant.displayName}
                            secondary={`${roleLabels[participant.role]} · ${participant.isConnected ? 'онлайн' : 'офлайн'}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Поки що в кімнаті немає учасників або список ще завантажується.
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};
