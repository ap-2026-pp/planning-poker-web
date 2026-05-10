import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import type { Issue } from '@entities/issue';
import {
  getParticipantInitials,
  isParticipantOnline,
  roleLabels,
  type GameParticipant,
} from '@entities/participant';
import styles from './game-room-sidebar.module.css';

export type SidebarView = 'players' | 'issues';

type GameRoomSidebarProps = {
  sidebarView: SidebarView;
  issues: Issue[];
  participants: GameParticipant[];
  currentParticipantId: string | null;
  isCurrentParticipantMaster: boolean;
  pendingParticipantActionId: string | null;
  onSidebarViewChange: (value: SidebarView) => void;
  onClose: () => void;
  onRemoveParticipant: (participantId: string) => Promise<void>;
  onAddIssue?: () => void;
};

export const GameRoomSidebar = ({
  sidebarView,
  issues,
  participants,
  currentParticipantId,
  isCurrentParticipantMaster,
  pendingParticipantActionId,
  onSidebarViewChange,
  onClose,
  onRemoveParticipant,
  onAddIssue,
}: GameRoomSidebarProps) => {
  const [participantToRemove, setParticipantToRemove] = useState<GameParticipant | null>(null);

  const handleAskRemoveParticipant = (participant: GameParticipant) => {
    setParticipantToRemove(participant);
  };

  const handleCloseRemoveDialog = () => {
    if (participantToRemove && pendingParticipantActionId === participantToRemove.id) {
      return;
    }

    setParticipantToRemove(null);
  };

  const handleConfirmRemoveParticipant = async () => {
    if (!participantToRemove) {
      return;
    }

    try {
      await onRemoveParticipant(participantToRemove.id);
      setParticipantToRemove(null);
    } catch {
      // помилка вже обробляється вище, просто не закриваємо примусово раніше часу
    }
  };

  return (
    <>
      <Box className={styles.sidebarPanel}>
        <Box className={styles.sidebarHeader}>
          <Typography className={styles.sidebarHeaderTitle}>
            Панель кімнати
          </Typography>

          <IconButton
            className={styles.sidebarCloseButton}
            onClick={onClose}
            aria-label="Закрити панель кімнати"
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Box className={styles.sidebarTabs}>
          <button
            type="button"
            onClick={() => onSidebarViewChange('players')}
            className={[
              styles.sidebarTab,
              sidebarView === 'players' ? styles.sidebarTabActive : '',
            ].join(' ').trim()}
          >
            <Groups2RoundedIcon className={styles.sidebarTabIcon} />
            <span>Гравці</span>
          </button>

          <button
            type="button"
            onClick={() => onSidebarViewChange('issues')}
            className={[
              styles.sidebarTab,
              sidebarView === 'issues' ? styles.sidebarTabActive : '',
            ].join(' ').trim()}
          >
            <ViewKanbanRoundedIcon className={styles.sidebarTabIcon} />
            <span>Issues</span>
          </button>
        </Box>

        {sidebarView === 'issues' ? (
          <Box className={styles.sidebarContent}>
            {isCurrentParticipantMaster ? (
              <Box
                component="button"
                type="button"
                className={styles.addIssueButton}
                onClick={onAddIssue}
              >
                <AddRoundedIcon />
                <span>Додати issue</span>
              </Box>
            ) : null}

            <Stack className={styles.issueList}>
              {issues.length ? (
                issues.map((issue, index) => (
                  <Box key={issue.id} className={styles.issueCard}>
                    <Stack direction="row" className={styles.issueHeader}>
                      <span
                        className={[
                          styles.issueDot,
                          styles[`issueTone${index % 4}`],
                        ].join(' ').trim()}
                      />

                      <Stack className={styles.issueText}>
                        <Typography className={styles.issueTitle}>
                          {issue.title}
                        </Typography>
                        <Typography className={styles.issueDescription}>
                          {issue.description || 'Опис ще не додано'}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Box className={styles.issueFooter}>
                      <Typography className={styles.issueMeta}>
                        {issue.isCurrent
                          ? 'Активний зараз'
                          : issue.finalEstimate
                            ? `Фінальна оцінка: ${issue.finalEstimate}`
                            : 'Готово до наступного раунду'}
                      </Typography>

                      {issue.code ? (
                        <Box className={styles.issueCodeBadge}>{issue.code}</Box>
                      ) : null}
                    </Box>
                  </Box>
                ))
              ) : (
                <Box className={styles.issueEmptyState}>
                  <Box className={styles.footerIconWrap}>
                    <PlaylistAddCheckRoundedIcon className={styles.footerIcon} />
                  </Box>

                  <Typography className={styles.footerTitle}>
                    Ще немає issues
                  </Typography>

                  <Typography className={styles.footerDescription}>
                    {isCurrentParticipantMaster
                      ? 'Додайте першу задачу, щоб відкрити раунд оцінювання.'
                      : 'Master ще не додав задачі для оцінювання.'}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        ) : (
          <Stack className={styles.playerList}>
            {participants.length ? (
              participants.map((participant) => {
                const isOnline = isParticipantOnline(participant);
                const isSelf = participant.id === currentParticipantId;
                const canRemoveParticipant = isCurrentParticipantMaster && !isSelf;
                const isPending = pendingParticipantActionId === participant.id;

                return (
                  <Box
                    key={participant.id}
                    className={[
                      styles.playerListItem,
                      !isOnline ? styles.playerListItemOffline : '',
                    ].join(' ').trim()}
                  >
                    <Stack direction="row" className={styles.playerListRow}>
                      <Stack direction="row" className={styles.playerIdentity}>
                        <Box className={styles.playerPresenceWrap}>
                          <span
                            className={[
                              styles.playerPresence,
                              isOnline
                                ? styles.playerPresenceOnline
                                : styles.playerPresenceOffline,
                            ].join(' ').trim()}
                          />

                          <Box className={styles.playerListAvatar}>
                            {getParticipantInitials(participant.displayName)}
                          </Box>
                        </Box>

                        <Stack className={styles.playerListText}>
                          <Typography className={styles.playerListName}>
                            {participant.displayName}
                            {isSelf ? ' · Ви' : ''}
                          </Typography>

                          <Typography className={styles.playerListRole}>
                            {roleLabels[participant.role]} · {isOnline ? 'онлайн' : 'офлайн'}
                          </Typography>
                        </Stack>
                      </Stack>

                      {canRemoveParticipant ? (
                        <IconButton
                          className={styles.playerRemoveButton}
                          disabled={isPending}
                          onClick={() => handleAskRemoveParticipant(participant)}
                          aria-label={`Видалити ${participant.displayName}`}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      ) : null}
                    </Stack>
                  </Box>
                );
              })
            ) : (
              <Box className={styles.issueEmptyState}>
                <Box className={styles.footerIconWrap}>
                  <Groups2RoundedIcon className={styles.footerIcon} />
                </Box>

                <Typography className={styles.footerTitle}>
                  Немає учасників
                </Typography>

                <Typography className={styles.footerDescription}>
                  Після приєднання команди гравці з’являться в цій панелі.
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </Box>

      <Dialog
        open={Boolean(participantToRemove)}
        onClose={handleCloseRemoveDialog}
      >
        <DialogTitle>Видалити учасника?</DialogTitle>

        <DialogContent>
          <Typography>
            Ви впевнені, що хочете видалити{' '}
            <strong>{participantToRemove?.displayName}</strong> з кімнати?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleCloseRemoveDialog}
            disabled={
              Boolean(participantToRemove) &&
              pendingParticipantActionId === participantToRemove?.id
            }
          >
            Скасувати
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={() => void handleConfirmRemoveParticipant()}
            disabled={
              Boolean(participantToRemove) &&
              pendingParticipantActionId === participantToRemove?.id
            }
          >
            {pendingParticipantActionId === participantToRemove?.id
              ? 'Видаляємо...'
              : 'Видалити'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};