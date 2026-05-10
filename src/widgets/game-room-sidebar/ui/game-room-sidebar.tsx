import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded';
import UploadRoundedIcon from '@mui/icons-material/UploadRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';

import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
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

type IssueDraft = {
  title: string;
  code: string;
  description: string;
};

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
  onAddIssue?: (payload: { title: string }) => Promise<void>;
  onUpdateIssue?: (
    issueId: string,
    payload: { title: string; code?: string; description?: string },
  ) => Promise<void>;
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
  onUpdateIssue,
}: GameRoomSidebarProps) => {
  const [issueMode, setIssueMode] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);
  const [issueDraft, setIssueDraft] = useState<IssueDraft>({
    title: '',
    code: '',
    description: '',
  });
  const [issuesMenuAnchor, setIssuesMenuAnchor] = useState<null | HTMLElement>(null);


  const resetIssueDraft = () => {
    setIssueDraft({
      title: '',
      code: '',
      description: '',
    });
  };

  const openCreateIssue = () => {
    resetIssueDraft();
    setSelectedIssueId(null);
    setIssueMode('create');
  };

  const openEditIssue = (issue: Issue) => {
    setSelectedIssueId(issue.id);
    setIssueDraft({
      title: issue.title ?? '',
      code: issue.code ?? '',
      description: issue.description ?? '',
    });
    setIssueMode('edit');
  };

  const closeIssueForm = () => {
    resetIssueDraft();
    setSelectedIssueId(null);
    setIssueMode('list');
  };

  const handleCreateIssue = async () => {
    if (!issueDraft.title.trim() || !onAddIssue) {
      return;
    }

    try {
      setIsSubmittingIssue(true);
      await onAddIssue({
        title: issueDraft.title.trim(),
      });
      closeIssueForm();
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  const handleUpdateIssue = async () => {
    if (!selectedIssueId || !issueDraft.title.trim() || !onUpdateIssue) {
      return;
    }

    try {
      setIsSubmittingIssue(true);
      await onUpdateIssue(selectedIssueId, {
        title: issueDraft.title.trim(),
        code: issueDraft.code.trim() || undefined,
        description: issueDraft.description.trim() || undefined,
      });
      closeIssueForm();
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  return (
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
          <Box className={styles.issuesToolbar}>
            <Box>
              <Typography className={styles.issuesTitle}>Issues</Typography>
              <Typography className={styles.issuesSubtitle}>
                {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
              </Typography>
            </Box>

            {isCurrentParticipantMaster ? (
              <>
                <IconButton
                  className={styles.issuesMenuButton}
                  onClick={(event) => setIssuesMenuAnchor(event.currentTarget)}
                  aria-label="Меню issues"
                >
                  <MoreVertRoundedIcon />
                </IconButton>

                <Menu
                  anchorEl={issuesMenuAnchor}
                  open={Boolean(issuesMenuAnchor)}
                  onClose={() => setIssuesMenuAnchor(null)}
                  PaperProps={{ className: styles.issuesMenuPaper }}
                >
                  <MenuItem
                    className={styles.issuesMenuItem}
                    onClick={() => setIssuesMenuAnchor(null)}
                  >
                    <DownloadRoundedIcon fontSize="small" />
                    <span>Download issues as CSV</span>
                  </MenuItem>

                  <MenuItem
                    className={styles.issuesMenuItem}
                    onClick={() => setIssuesMenuAnchor(null)}
                  >
                    <UploadRoundedIcon fontSize="small" />
                    <span>Import from Plane</span>
                  </MenuItem>

                  <MenuItem
                    className={[styles.issuesMenuItem, styles.issuesMenuItemDanger].join(' ')}
                    onClick={() => setIssuesMenuAnchor(null)}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                    <span>Delete all issues</span>
                  </MenuItem>
                </Menu>
              </>
            ) : null}
          </Box>

          <Box className={styles.issuesScrollArea}>
            {issueMode === 'create' ? (
              <Box className={styles.issueFormCard}>
                <TextField
                  fullWidth
                  placeholder="Enter a title for the issue"
                  value={issueDraft.title}
                  onChange={(event) =>
                    setIssueDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  variant="outlined"
                  className={styles.issueField}
                />

                <Box className={styles.issueFormActions}>
                  <button
                    type="button"
                    className={styles.issueSecondaryButton}
                    onClick={closeIssueForm}
                    disabled={isSubmittingIssue}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className={styles.issuePrimaryButton}
                    onClick={() => void handleCreateIssue()}
                    disabled={!issueDraft.title.trim() || isSubmittingIssue}
                  >
                    Save
                  </button>
                </Box>
              </Box>
            ) : null}

            {issueMode === 'edit' ? (
              <Box className={styles.issueFormCard}>
                <TextField
                  fullWidth
                  placeholder="Issue title"
                  value={issueDraft.title}
                  onChange={(event) =>
                    setIssueDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  variant="outlined"
                  className={styles.issueField}
                />

                <TextField
                  fullWidth
                  placeholder="Issue code / link"
                  value={issueDraft.code}
                  onChange={(event) =>
                    setIssueDraft((current) => ({ ...current, code: event.target.value }))
                  }
                  variant="outlined"
                  className={styles.issueField}
                />

                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  placeholder="Description"
                  value={issueDraft.description}
                  onChange={(event) =>
                    setIssueDraft((current) => ({ ...current, description: event.target.value }))
                  }
                  variant="outlined"
                  className={styles.issueField}
                />

                <Box className={styles.issueFormActions}>
                  <button
                    type="button"
                    className={styles.issueSecondaryButton}
                    onClick={closeIssueForm}
                    disabled={isSubmittingIssue}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className={styles.issuePrimaryButton}
                    onClick={() => void handleUpdateIssue()}
                    disabled={!issueDraft.title.trim() || isSubmittingIssue}
                  >
                    Save
                  </button>
                </Box>
              </Box>
            ) : null}

            {issueMode === 'list' ? (
              <>
                {!issues.length ? (
                  <Box className={styles.issuesEmptyLayout}>
                    <Box className={styles.issuesEmptyTop}>
                      {isCurrentParticipantMaster ? (
                        <Box
                          component="button"
                          type="button"
                          className={styles.addIssueButton}
                          onClick={openCreateIssue}
                        >
                          <AddRoundedIcon />
                          <span>Add issue</span>
                        </Box>
                      ) : null}
                    </Box>

                    <Box className={styles.issuesEmptyCenter}>
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
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Stack className={styles.issueList}>
                      {issues.map((issue, index) => (
                        <Box
                          key={issue.id}
                          className={styles.issueCard}
                          onClick={() => {
                            if (isCurrentParticipantMaster) {
                              openEditIssue(issue);
                            }
                          }}
                        >
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
                      ))}
                    </Stack>

                    {isCurrentParticipantMaster ? (
                      <button
                        type="button"
                        className={styles.addAnotherIssueButton}
                        onClick={openCreateIssue}
                      >
                        <AddRoundedIcon />
                        <span>Add another issue</span>
                      </button>
                    ) : null}
                  </>
                )}
              </>
            ) : null}
          </Box>
        </Box>
      ) : (
        <Box className={styles.sidebarContent}>
          <Box className={styles.playersScrollArea}>
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
                            onClick={() => void onRemoveParticipant(participant.id)}
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
                <Box className={styles.playersEmptyState}>
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
          </Box>
        </Box>
      )}
    </Box>
  );
};