import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import {
    defaultAnimateLayoutChanges,
    useSortable,
    type AnimateLayoutChanges,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { useState, type MouseEvent } from 'react';

import { getIssueToneIndex, IssueStatus, type Issue } from '@entities/issue';
import styles from '@shared/ui/game-room-sidebar/game-room-issues.module.css';

type SortableIssueCardProps = {
    issue: Issue;
    canManageIssues: boolean;
    canRevealCards: boolean;
    isSortableEnabled: boolean;
    isFirst: boolean;
    isLast: boolean;
    onEditIssue: (issue: Issue) => void;
    onDeleteIssue?: (issueId: string) => Promise<void>;
    onSetIssueActive?: (issueId: string) => Promise<void>;
    canViewResult?: boolean;
    onViewResult?: (issueId: string) => Promise<void> | void;
    onResetIssueRound?: (issueId: string) => Promise<void>;
    onMoveIssue?: (issueId: string, direction: 'up' | 'down') => Promise<void>;
};

const animateLayoutChanges: AnimateLayoutChanges = (args) => {
    if (args.isDragging || args.wasDragging) {
        return false;
    }

    return defaultAnimateLayoutChanges(args);
};

const isIssueCompleted = (issue: Issue) =>
    issue.status === IssueStatus.Completed || Boolean(issue.finalEstimate);

/**
 * Для UI кнопки важливо дивитися саме на isCurrent.
 * status може бути несинхронним після optimistic update або після partial realtime update.
 */
const isIssueVoting = (issue: Issue) => issue.isCurrent;

const getIssueVoteButtonLabel = (issue: Issue) => {
    if (isIssueVoting(issue)) {
        return 'Зупинити оцінювання';
    }

    if (isIssueCompleted(issue)) {
        return 'Оцінити заново';
    }

    return 'Почати оцінювати';
};

export const SortableIssueCard = ({
    issue,
    canManageIssues,
    canRevealCards,
    isSortableEnabled,
    isFirst,
    isLast,
    onEditIssue,
    onDeleteIssue,
    onSetIssueActive,
    canViewResult = false,
    onViewResult,
    onResetIssueRound,
    onMoveIssue,
}: SortableIssueCardProps) => {
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: issue.id,
        disabled: !isSortableEnabled,
        animateLayoutChanges,
    });

    const style = {
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        transition: isDragging ? 'none' : transition,
    };

    const handleOpenIssue = () => {
        if (canManageIssues) {
            onEditIssue(issue);
        }
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
                onClick={handleOpenIssue}
            >
                <IssueCardContent
                    issue={issue}
                    canManageIssues={canManageIssues}
                    canRevealCards={canRevealCards}
                    showMenuButton={canManageIssues}
                    canViewResult={canViewResult}
                    dragHandleProps={
                        isSortableEnabled
                            ? { ...attributes, ...listeners }
                            : undefined
                    }
                    onOpenMenu={(event) => {
                        event.stopPropagation();
                        setMenuAnchor(event.currentTarget);
                    }}
                    onSetIssueActive={() => {
                        void onSetIssueActive?.(issue.id);
                    }}
                    onViewResult={() => {
                        void onViewResult?.(issue.id);
                    }}
                    onResetIssueRound={() => {
                        void onResetIssueRound?.(issue.id);
                    }}
                />
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
                        void onMoveIssue?.(issue.id, 'up');
                        setMenuAnchor(null);
                    }}
                >
                    <span>Перемістити вгору</span>
                </MenuItem>

                <MenuItem
                    className={styles.issuesMenuItem}
                    disabled={isLast}
                    onClick={() => {
                        void onMoveIssue?.(issue.id, 'down');
                        setMenuAnchor(null);
                    }}
                >
                    <span>Перемістити вниз</span>
                </MenuItem>

                <MenuItem
                    className={[styles.issuesMenuItem, styles.issuesMenuItemDanger].join(' ')}
                    onClick={() => {
                        void onDeleteIssue?.(issue.id);
                        setMenuAnchor(null);
                    }}
                >
                    <span>Видалити</span>
                </MenuItem>
            </Menu>
        </>
    );
};

type IssueCardContentProps = {
    issue: Issue;
    canManageIssues: boolean;
    canRevealCards: boolean;
    showMenuButton?: boolean;
    canViewResult?: boolean;
    dragHandleProps?: Record<string, unknown>;
    onOpenMenu?: (event: MouseEvent<HTMLButtonElement>) => void;
    onSetIssueActive?: () => void;
    onViewResult?: () => void;
    onResetIssueRound?: () => void;
};

const IssueCardContent = ({
    issue,
    canManageIssues,
    canRevealCards,
    showMenuButton = false,
    canViewResult = false,
    dragHandleProps,
    onOpenMenu,
    onSetIssueActive,
    onViewResult,
    onResetIssueRound,
}: IssueCardContentProps) => {
    const toneIndex = getIssueToneIndex(issue);
    const isVoting = isIssueVoting(issue);
    const isCompleted = isIssueCompleted(issue);
    const voteButtonLabel = getIssueVoteButtonLabel(issue);

    const handleVoteButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();

        if (isVoting) {
            onSetIssueActive?.();
            return;
        }

        if (isCompleted) {
            onResetIssueRound?.();
            return;
        }

        onSetIssueActive?.();
    };

    return (
        <>
            <Stack direction="row" className={styles.issueHeader}>
                <span
                    className={[
                        styles.issueDot,
                        styles[`issueTone${toneIndex}`],
                    ]
                        .join(' ')
                        .trim()}
                />

                <Stack className={styles.issueText} {...(dragHandleProps ?? {})}>
                    <Typography className={styles.issueTitle}>{issue.title}</Typography>
                </Stack>

                {showMenuButton && canManageIssues ? (
                    <IconButton
                        className={styles.issueCardMenuButton}
                        onClick={onOpenMenu}
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
                                isVoting ? styles.issueVoteButtonActive : '',
                                !isVoting && isCompleted ? styles.issueVoteButtonCompleted : '',
                            ]
                                .join(' ')
                                .trim()}
                            onClick={handleVoteButtonClick}
                        >
                            {voteButtonLabel}
                        </button>
                    ) : null}

                    {canViewResult ? (
                        <IconButton
                            className={styles.issueResultButton}
                            onClick={(event) => {
                                event.stopPropagation();
                                onViewResult?.();
                            }}
                            aria-label={`Переглянути результат ${issue.title}`}
                        >
                            <VisibilityRoundedIcon fontSize="small" />
                        </IconButton>
                    ) : null}

                    {issue.code ? <Box className={styles.issueCodeBadge}>{issue.code}</Box> : null}
                </Box>
            </Box>

            {isVoting || isCompleted ? (
                <Box className={styles.issueEstimatePanel}>
                    <Typography className={styles.issueEstimateLabel}>
                        {isVoting ? 'Поточна оцінка' : 'Фінальна оцінка'}
                    </Typography>

                    <Typography className={styles.issueEstimateValue}>
                        {issue.finalEstimate ?? '—'}
                    </Typography>
                </Box>
            ) : null}
        </>
    );
};

type IssueDragOverlayCardProps = {
    issue: Issue;
    canRevealCards: boolean;
    canViewResult?: boolean;
    onViewResult?: (issueId: string) => Promise<void> | void;
};

export const IssueDragOverlayCard = ({
    issue,
    canRevealCards,
    canViewResult = false,
    onViewResult,
}: IssueDragOverlayCardProps) => (
    <Box className={[styles.issueCard, styles.issueCardOverlay].join(' ')}>
        <IssueCardContent
            issue={issue}
            canManageIssues={false}
            canRevealCards={canRevealCards}
            canViewResult={canViewResult}
            onViewResult={() => {
                void onViewResult?.(issue.id);
            }}
        />
    </Box>
);