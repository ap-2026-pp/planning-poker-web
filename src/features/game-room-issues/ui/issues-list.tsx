import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { Box, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import type { Issue } from '@entities/issue';
import styles from '@widgets/game-room-sidebar/ui/game-room-sidebar.module.css';

type IssuesListProps = {
    issues: Issue[];
    isCurrentParticipantMaster: boolean;
    onEditIssue: (issue: Issue) => void;
    onAddAnotherIssue: () => void;
    onDeleteIssue?: (issueId: string) => Promise<void>;
    onSetIssueActive?: (issueId: string) => Promise<void>;
    onMoveIssue?: (issueId: string, direction: 'up' | 'down') => Promise<void>;
};

export const IssuesList = ({
    issues,
    isCurrentParticipantMaster,
    onEditIssue,
    onAddAnotherIssue,
    onDeleteIssue,
    onSetIssueActive,
    onMoveIssue,
}: IssuesListProps) => {
    const [issueMenuAnchor, setIssueMenuAnchor] = useState<HTMLElement | null>(null);
    const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

    const selectedIssue = useMemo(
        () => issues.find((issue) => issue.id === selectedIssueId) ?? null,
        [issues, selectedIssueId],
    );

    const selectedIssueIndex = useMemo(
        () => issues.findIndex((issue) => issue.id === selectedIssueId),
        [issues, selectedIssueId],
    );

    const canMoveUp = selectedIssueIndex > 0;
    const canMoveDown =
        selectedIssueIndex >= 0 && selectedIssueIndex < issues.length - 1;

    const handleOpenMenu = (
        event: React.MouseEvent<HTMLElement>,
        issueId: string,
    ) => {
        event.stopPropagation();
        setIssueMenuAnchor(event.currentTarget);
        setSelectedIssueId(issueId);
    };

    const handleCloseMenu = () => {
        setIssueMenuAnchor(null);
        setSelectedIssueId(null);
    };

    return (
        <>
            <Stack className={styles.issueList}>
                {issues.map((issue, index) => (
                    <Box
                        key={issue.id}
                        className={styles.issueCard}
                        onClick={() => {
                            if (isCurrentParticipantMaster) {
                                onEditIssue(issue);
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
                                <Typography className={styles.issueTitle}>{issue.title}</Typography>

                                <Typography className={styles.issueDescription}>
                                    {issue.description || 'Опис ще не додано'}
                                </Typography>
                            </Stack>

                            {isCurrentParticipantMaster ? (
                                <IconButton
                                    className={styles.issueCardMenuButton}
                                    onClick={(event) => handleOpenMenu(event, issue.id)}
                                    aria-label={`Дії для ${issue.title}`}
                                >
                                    <MoreVertRoundedIcon fontSize="small" />
                                </IconButton>
                            ) : null}
                        </Stack>

                        <Box className={styles.issueFooter}>
                            <Box className={styles.issueFooterActions}>
                                {isCurrentParticipantMaster ? (
                                    <button
                                        type="button"
                                        className={styles.issueVoteButton}
                                        disabled={issue.isCurrent}
                                        onClick={(event) => {
                                            event.stopPropagation();

                                            if (!issue.isCurrent && onSetIssueActive) {
                                                void onSetIssueActive(issue.id);
                                            }
                                        }}
                                    >
                                        {issue.isCurrent ? 'Оцінюється' : 'Почати оцінювати'}
                                    </button>
                                ) : null}

                                {issue.code ? (
                                    <Box className={styles.issueCodeBadge}>{issue.code}</Box>
                                ) : null}
                            </Box>
                        </Box>

                        {(issue.isCurrent || issue.finalEstimate) && (
                            <Box className={styles.issueEstimatePanel}>
                                <Typography className={styles.issueEstimateLabel}>
                                    {issue.isCurrent ? 'Поточна оцінка' : 'Фінальна оцінка'}
                                </Typography>

                                <Typography className={styles.issueEstimateValue}>
                                    {issue.finalEstimate ?? '—'}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                ))}
            </Stack>

            {isCurrentParticipantMaster ? (
                <button
                    type="button"
                    className={styles.addAnotherIssueButton}
                    onClick={onAddAnotherIssue}
                >
                    <AddRoundedIcon />
                    <span>Add another issue</span>
                </button>
            ) : null}

            <Menu
                anchorEl={issueMenuAnchor}
                open={Boolean(issueMenuAnchor && selectedIssue)}
                onClose={handleCloseMenu}
                PaperProps={{ className: styles.issuesMenuPaper }}
            >
                <MenuItem
                    className={styles.issuesMenuItem}
                    onClick={() => {
                        if (selectedIssue) {
                            onEditIssue(selectedIssue);
                        }
                        handleCloseMenu();
                    }}
                >
                    <span>Відкрити</span>
                </MenuItem>

                <MenuItem
                    className={styles.issuesMenuItem}
                    disabled={!canMoveUp}
                    onClick={() => {
                        if (selectedIssueId && onMoveIssue) {
                            void onMoveIssue(selectedIssueId, 'up');
                        }
                        handleCloseMenu();
                    }}
                >
                    <span>Перемістити вгору</span>
                </MenuItem>

                <MenuItem
                    className={styles.issuesMenuItem}
                    disabled={!canMoveDown}
                    onClick={() => {
                        if (selectedIssueId && onMoveIssue) {
                            void onMoveIssue(selectedIssueId, 'down');
                        }
                        handleCloseMenu();
                    }}
                >
                    <span>Перемістити вниз</span>
                </MenuItem>

                <MenuItem
                    className={[styles.issuesMenuItem, styles.issuesMenuItemDanger].join(' ')}
                    onClick={() => {
                        if (selectedIssueId && onDeleteIssue) {
                            void onDeleteIssue(selectedIssueId);
                        }
                        handleCloseMenu();
                    }}
                >
                    <span>Видалити</span>
                </MenuItem>
            </Menu>
        </>
    );
};