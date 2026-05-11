import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import {
    defaultAnimateLayoutChanges,
    useSortable,
    type AnimateLayoutChanges,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import type { Issue } from '@entities/issue';
import { getIssueToneIndex } from '../model/get-issue-tone-index';
import styles from '@widgets/game-room-sidebar/ui/game-room-sidebar.module.css';

type SortableIssueCardProps = {
    issue: Issue;
    index: number;
    canManageIssues: boolean;
    canRevealCards: boolean;
    isFirst: boolean;
    isLast: boolean;
    onEditIssue: (issue: Issue) => void;
    onDeleteIssue?: (issueId: string) => Promise<void>;
    onSetIssueActive?: (issueId: string) => Promise<void>;
    onMoveIssue?: (issueId: string, direction: 'up' | 'down') => Promise<void>;
};

const animateLayoutChanges: AnimateLayoutChanges = (args) => {
    if (args.isDragging || args.wasDragging) {
        return false;
    }

    return defaultAnimateLayoutChanges(args);
};

export const SortableIssueCard = ({
    issue,
    canManageIssues,
    canRevealCards,
    isFirst,
    isLast,
    onEditIssue,
    onDeleteIssue,
    onSetIssueActive,
    onMoveIssue,
}: SortableIssueCardProps) => {
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

    const toneIndex = useMemo(
        () => getIssueToneIndex(issue),
        [issue.id, issue.code, issue.title],
    );

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: issue.id,
        disabled: !canManageIssues,
        animateLayoutChanges,
    });

    const style = {
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        transition: isDragging ? 'none' : transition,
        zIndex: isDragging ? 20 : undefined,
    };

    return (
        <>
            <Box
                ref={setNodeRef}
                style={style}
                className={[
                    styles.issueCard,
                    isDragging ? styles.issueCardDragging : '',
                ]
                    .join(' ')
                    .trim()}
                onClick={() => {
                    if (canManageIssues) {
                        onEditIssue(issue);
                    }
                }}
            >
                <Stack direction="row" className={styles.issueHeader}>
                    <span
                        className={[
                            styles.issueDot,
                            styles[`issueTone${toneIndex}`],
                        ]
                            .join(' ')
                            .trim()}
                    />

                    <Stack
                        className={styles.issueText}
                        {...(canManageIssues ? attributes : {})}
                        {...(canManageIssues ? listeners : {})}
                    >
                        <Typography className={styles.issueTitle}>{issue.title}</Typography>

                        <Typography className={styles.issueDescription}>
                            {issue.description || 'Опис ще не додано'}
                        </Typography>
                    </Stack>

                    {canManageIssues ? (
                        <IconButton
                            className={styles.issueCardMenuButton}
                            onClick={(event) => {
                                event.stopPropagation();
                                setMenuAnchor(event.currentTarget);
                            }}
                            aria-label={`Дії для ${issue.title}`}
                        >
                            <MoreVertRoundedIcon fontSize="small" />
                        </IconButton>
                    ) : null}
                </Stack>

                <Box className={styles.issueFooter}>
                    <Box className={styles.issueFooterActions}>
                        {canRevealCards ? (
                            <button
                                type="button"
                                className={[
                                    styles.issueVoteButton,
                                    issue.isCurrent ? styles.issueVoteButtonActive : '',
                                ]
                                    .join(' ')
                                    .trim()}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    void onSetIssueActive?.(issue.id);
                                }}
                            >
                                {issue.isCurrent ? 'Зупинити оцінювання' : 'Почати оцінювати'}
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

            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                PaperProps={{ className: styles.issuesMenuPaper }}
            >
                <MenuItem
                    className={styles.issuesMenuItem}
                    onClick={() => {
                        onEditIssue(issue);
                        setMenuAnchor(null);
                    }}
                >
                    <span>Відкрити</span>
                </MenuItem>

                <MenuItem
                    className={styles.issuesMenuItem}
                    disabled={isFirst}
                    onClick={() => {
                        if (onMoveIssue) {
                            void onMoveIssue(issue.id, 'up');
                        }

                        setMenuAnchor(null);
                    }}
                >
                    <span>Перемістити вгору</span>
                </MenuItem>

                <MenuItem
                    className={styles.issuesMenuItem}
                    disabled={isLast}
                    onClick={() => {
                        if (onMoveIssue) {
                            void onMoveIssue(issue.id, 'down');
                        }

                        setMenuAnchor(null);
                    }}
                >
                    <span>Перемістити вниз</span>
                </MenuItem>

                <MenuItem
                    className={[styles.issuesMenuItem, styles.issuesMenuItemDanger].join(' ')}
                    onClick={() => {
                        if (onDeleteIssue) {
                            void onDeleteIssue(issue.id);
                        }

                        setMenuAnchor(null);
                    }}
                >
                    <span>Видалити</span>
                </MenuItem>
            </Menu>
        </>
    );
};