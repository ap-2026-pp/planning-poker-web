import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';
import { Box, IconButton, Stack, Typography } from '@mui/material';

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
  onSidebarViewChange: (value: SidebarView) => void;
  onClose: () => void;
};

export const GameRoomSidebar = ({
  sidebarView,
  issues,
  participants,
  onSidebarViewChange,
  onClose,
}: GameRoomSidebarProps) => (
  <Box className={styles.sidebarPanel}>
    <Box className={styles.sidebarHeader}>
      <Typography className={styles.sidebarHeaderTitle}>
        Панель кімнати
      </Typography>

      <IconButton
        className={styles.sidebarCloseButton}
        onClick={onClose}
        aria-label="Close room sidebar"
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
        <Box component="button" type="button" className={styles.addIssueButton}>
          <AddRoundedIcon />
          <span>Додати issue</span>
        </Box>

        <Stack className={styles.issueList}>
          {issues.length ? (
            issues.map((issue, index) => (
              <Box key={issue.id} className={styles.issueCard}>
                <Stack direction="row" className={styles.issueHeader}>
                  <span
                    className={[styles.issueDot, styles[`issueTone${index % 4}`]].join(' ').trim()}
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

                  {issue.code ? <Box className={styles.issueCodeBadge}>{issue.code}</Box> : null}
                </Box>
              </Box>
            ))
          ) : (
            <Box className={styles.issueEmptyState}>
              <Box className={styles.footerIconWrap}>
                <PlaylistAddCheckRoundedIcon className={styles.footerIcon} />
              </Box>
              <Typography className={styles.footerTitle}>Ще немає issues</Typography>
              <Typography className={styles.footerDescription}>
                Додайте першу задачу, щоб відкрити раунд оцінювання.
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

            return (
              <Box key={participant.id} className={styles.playerListItem}>
                <Stack direction="row" className={styles.playerIdentity}>
                  <Box className={styles.playerPresenceWrap}>
                    <span
                      className={[
                        styles.playerPresence,
                        isOnline ? styles.playerPresenceOnline : styles.playerPresenceOffline,
                      ].join(' ').trim()}
                    />

                    <Box className={styles.playerListAvatar}>
                      {getParticipantInitials(participant.displayName)}
                    </Box>
                  </Box>

                  <Stack className={styles.playerListText}>
                    <Typography className={styles.playerListName}>
                      {participant.displayName}
                    </Typography>
                    <Typography className={styles.playerListRole}>
                      {roleLabels[participant.role]} · {isOnline ? 'онлайн' : 'офлайн'}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            );
          })
        ) : (
          <Box className={styles.issueEmptyState}>
            <Box className={styles.footerIconWrap}>
              <Groups2RoundedIcon className={styles.footerIcon} />
            </Box>
            <Typography className={styles.footerTitle}>Немає учасників</Typography>
            <Typography className={styles.footerDescription}>
              Після приєднання команди активні гравці з’являться в цій панелі.
            </Typography>
          </Box>
        )}
      </Stack>
    )}
  </Box>
);