import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import {
    defaultAnimateLayoutChanges,
    useSortable,
    type AnimateLayoutChanges,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { useState, type MouseEvent } from 'react';

import { getIssueToneIndex, type Issue } from '@entities/issue';
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
    isSortableEnabled,
    isFirst,
    isLast,
    onEditIssue,
    onDeleteIssue,
    onSetIssueActive,
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

type IssueCardContentProps = {
    issue: Issue;
    canManageIssues: boolean;
    canRevealCards: boolean;
    showMenuButton?: boolean;
    dragHandleProps?: Record<string, unknown>;
    onOpenMenu?: (event: MouseEvent<HTMLButtonElement>) => void;
    onSetIssueActive?: () => void;
};

const IssueCardContent = ({
    issue,
    canManageIssues,
    canRevealCards,
    showMenuButton = false,
    dragHandleProps,
    onOpenMenu,
    onSetIssueActive,
}: IssueCardContentProps) => {
    const toneIndex = getIssueToneIndex(issue);

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
                                issue.isCurrent ? styles.issueVoteButtonActive : '',
                            ]
                                .join(' ')
                                .trim()}
                            onClick={(event) => {
                                event.stopPropagation();
                                onSetIssueActive?.();
                            }}
                        >
                            {issue.isCurrent ? 'Зупинити оцінювання' : 'Почати оцінювати'}
                        </button>
                    ) : null}

                    {issue.code ? <Box className={styles.issueCodeBadge}>{issue.code}</Box> : null}
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
        </>
    );
};

type IssueDragOverlayCardProps = {
    issue: Issue;
    canRevealCards: boolean;
};

export const IssueDragOverlayCard = ({
    issue,
    canRevealCards,
}: IssueDragOverlayCardProps) => (
    <Box className={[styles.issueCard, styles.issueCardOverlay].join(' ')}>
        <IssueCardContent
            issue={issue}
            canManageIssues={false}
            canRevealCards={canRevealCards}
        />
    </Box>
);
