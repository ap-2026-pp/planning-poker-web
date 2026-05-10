import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { UserGamesScope, type UserGame } from '@entities/game';
import { ParticipantRole } from '@entities/participant';
import {
  deleteGameRequest,
  getUserGamesRequest,
  reconnectToGameRequest,
} from '@shared/api';
import {
  clearGuestAccessToken,
  setCurrentRoomParticipantSession,
  setGuestAccessToken,
  useSession,
} from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import { formatDateTime } from '@shared/utils/time';
import { useUserGamesRealtime } from '../model/use-user-games-realtime';
import styles from './my-games-page.module.css';

const scopeOptions = [
  { value: UserGamesScope.Created, label: 'Створені' },
  { value: UserGamesScope.Participated, label: 'Участь' },
  { value: UserGamesScope.All, label: 'Усі' },
] as const;

const roleLabels: Record<ParticipantRole, string> = {
  [ParticipantRole.Master]: 'Ведучий',
  [ParticipantRole.Player]: 'Гравець',
  [ParticipantRole.Spectator]: 'Спостерігач',
};

export const MyGamesPage = () => {
  const { isAuthenticated } = useSession();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [scope, setScope] = useState<UserGamesScope>(UserGamesScope.Created);
  const [games, setGames] = useState<UserGame[]>([]);
  const [ownedGameIds, setOwnedGameIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserGame | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [joiningGameId, setJoiningGameId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadGames = async () => {
      setLoading(true);
      setError(null);

      try {
        const [response, createdGames] = await Promise.all([
          getUserGamesRequest(scope),
          getUserGamesRequest(UserGamesScope.Created),
        ]);

        if (!isMounted) {
          return;
        }

        setGames(response);
        setOwnedGameIds(new Set(createdGames.map((game) => game.id)));
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Не вдалося завантажити ігри');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadGames();

    return () => {
      isMounted = false;
    };
  }, [scope]);

  if (!isAuthenticated) {
    return <Navigate to={appRoutes.home} replace />;
  }

  const handleJoinGame = async (game: UserGame) => {
    setJoiningGameId(game.id);
    setError(null);

    try {
      const response = await reconnectToGameRequest(game.id);

      if (response.guestAccessToken) {
        setGuestAccessToken(response.guestAccessToken);
      } else {
        clearGuestAccessToken();
      }

      setCurrentRoomParticipantSession(response.game.id, response.currentParticipantId);
      await navigate(appRoutes.gameRoom(response.game.id), {
        state: { from: pathname + search },
      });
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : 'Не вдалося приєднатися до гри');
    } finally {
      setJoiningGameId(null);
    }
  };

  const handleGameUpdated = useCallback(
    (updatedGame: UserGame | { id: string; isDeleted?: boolean } | string) => {
      if (typeof updatedGame === 'string') {
        setGames((current) => current.filter((game) => game.id !== updatedGame));
        setOwnedGameIds((current) => {
          const next = new Set(current);
          next.delete(updatedGame);
          return next;
        });
        return;
      }

      if ('isDeleted' in updatedGame && updatedGame.isDeleted) {
        setGames((current) => current.filter((game) => game.id !== updatedGame.id));
        setOwnedGameIds((current) => {
          const next = new Set(current);
          next.delete(updatedGame.id);
          return next;
        });
        return;
      }

      if ('name' in updatedGame) {
        setGames((current) => {
          const existingIndex = current.findIndex((game) => game.id === updatedGame.id);
          if (existingIndex >= 0) {
            const next = [...current];
            next[existingIndex] = updatedGame;
            return next;
          } else {
            return [...current, updatedGame];
          }
        });

        if (updatedGame.sessionRole === ParticipantRole.Master) {
          setOwnedGameIds((current) => new Set([...current, updatedGame.id]));
        }
      }
    },
    [],
  );

  useUserGamesRealtime({
    onGameUpdated: handleGameUpdated,
  });

  const handleDelete = async () => {
    if (!deleteTarget || !ownedGameIds.has(deleteTarget.id)) {
      setDeleteTarget(null);
      return;
    }

    setDeleting(true);

    try {
      await deleteGameRequest(deleteTarget.id);
      setDeleteTarget(null);

      const [response, createdGames] = await Promise.all([
        getUserGamesRequest(scope),
        getUserGamesRequest(UserGamesScope.Created),
      ]);

      setGames(response);
      setOwnedGameIds(new Set(createdGames.map((game) => game.id)));

      if (
        pathname === appRoutes.gameRoom(deleteTarget.id) ||
        pathname === appRoutes.editGame(deleteTarget.id)
      ) {
        await navigate(appRoutes.home);
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Не вдалося видалити гру');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Box className={styles.layout}>
        <Box className={styles.leftColumn}>
          <Stack className={styles.heroColumn}>
            <Box className={styles.pageHeader}>
              <Box>
                <Box className={styles.headingBlock}>
                  <Typography component="h1" className={styles.title}>
                    Мої
                    <Typography component="h2" className={styles.accentTitle}>
                      ігри
                    </Typography>
                  </Typography>

                  <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    className={styles.createButton}
                    onClick={() =>
                      navigate(appRoutes.createGame, {
                        state: { from: pathname + search },
                      })
                    }
                  >
                    Створити гру
                  </Button>
                </Box>

                <Typography className={styles.description}>
                  Переглядай свої planning poker сесії, швидко повертайся в активні кімнати, редагуй власні ігри та прибирай ті, які більше не потрібні.
                </Typography>
              </Box>


            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap className={styles.filters}>
              {scopeOptions.map((option) => (
                <Button
                  key={option.value}
                  size="small"
                  variant={scope === option.value ? 'contained' : 'text'}
                  onClick={() => setScope(option.value)}
                  className={
                    scope === option.value ? styles.scopeButtonActive : styles.scopeButton
                  }
                >
                  {option.label}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Box>

        <Box className={styles.rightColumn}>
          <Box className={styles.listCard}>
            {error ? (
              <Alert severity="error" className={styles.alert}>
                {error}
              </Alert>
            ) : null}

            {loading ? (
              <Stack className={styles.state} alignItems="center" justifyContent="center">
                <CircularProgress color="secondary" />
                <Typography className={styles.stateText}>Завантажуємо ігри…</Typography>
              </Stack>
            ) : null}

            {!loading && !games.length ? (
              <Stack className={styles.state} alignItems="center" justifyContent="center">
                <Typography className={styles.stateText}>
                  Для цього фільтра ігор поки немає.
                </Typography>
              </Stack>
            ) : null}

            {!loading ? (
              <Stack className={styles.gamesList}>
                {games.map((game) => {
                  const isOwner = ownedGameIds.has(game.id);
                  const canOpenGame = game.isActive || game.sessionRole === ParticipantRole.Master;
                  const isJoining = joiningGameId === game.id;

                  return (
                    <Box key={game.id} className={styles.gameCard}>
                      <Button
                        variant="text"
                        className={styles.gamePrimary}
                        disabled={!canOpenGame || Boolean(joiningGameId)}
                        onClick={() => void handleJoinGame(game)}
                      >
                        <Stack className={styles.gameCopy}>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                            <Typography className={styles.gameName}>{game.name}</Typography>
                            <span className={game.isActive ? styles.badgeActive : styles.badgeInactive}>
                              {game.isActive ? 'Активна' : 'Неактивна'}
                            </span>
                            {isOwner ? <span className={styles.badgeOwner}>Моя гра</span> : null}
                          </Stack>

                          <Typography className={styles.gameMeta}>
                            {roleLabels[game.sessionRole]} · {formatDateTime(game.joinedAt)}
                          </Typography>

                          <Typography className={styles.gameHint}>
                            {isJoining
                              ? 'Приєднуємо до кімнати...'
                              : game.isActive
                                ? 'Відкрити кімнату'
                                : game.sessionRole === ParticipantRole.Master
                                  ? 'Відкрити кімнату й активувати гру'
                                  : 'Неактивна гра недоступна для учасників'}
                          </Typography>
                        </Stack>
                      </Button>

                      {isOwner ? (
                        <Stack direction="row" spacing={1} className={styles.gameActions}>
                          <IconButton
                            size="small"
                            className={styles.iconButton}
                            onClick={async () =>
                              navigate(appRoutes.editGame(game.id), {
                                state: { from: pathname + search },
                              })
                            }
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>

                          <IconButton
                            size="small"
                            className={styles.iconButtonDanger}
                            onClick={() => setDeleteTarget(game)}
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ) : null}
                    </Box>
                  );
                })}
              </Stack>
            ) : null}
          </Box>
        </Box>
      </Box>

      <Dialog open={Boolean(deleteTarget)} onClose={() => (deleting ? undefined : setDeleteTarget(null))}>
        <DialogTitle>Видалити гру?</DialogTitle>
        <DialogContent>
          <Typography>{deleteTarget ? `Гру "${deleteTarget.name}" буде видалено.` : ''}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Скасувати
          </Button>
          <Button color="error" onClick={() => void handleDelete()} disabled={deleting}>
            {deleting ? 'Видаляємо...' : 'Видалити'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
