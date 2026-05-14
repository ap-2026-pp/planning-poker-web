import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import { Box, Tooltip, Typography } from '@mui/material';

import type { Issue } from '@entities/issue';
import styles from './game-room-surface.module.css';

type BoardCenterStateProps = {
    onlineParticipantsCount: number;
    activeIssue: Issue | null;
    votesCastCount: number;
    showRevealButton: boolean;
    canRevealVotes: boolean;
    isRevealSubmitting: boolean;
    isRoundRevealed: boolean;
    canOpenResult: boolean;
    canResetCurrentRound: boolean;
    canGoToNextIssue: boolean;
    isResetRoundSubmitting: boolean;
    isNextIssueSubmitting: boolean;
    onRevealVotes: () => Promise<void>;
    onOpenResult: () => void;
    onResetRound: () => Promise<void>;
    onGoToNextIssue: () => Promise<void>;
};

export const BoardCenterState = ({
    onlineParticipantsCount,
    activeIssue,
    showRevealButton,
    canRevealVotes,
    isRevealSubmitting,
    isRoundRevealed,
    canOpenResult,
    canResetCurrentRound,
    canGoToNextIssue,
    isResetRoundSubmitting,
    isNextIssueSubmitting,
    onRevealVotes,
    onOpenResult,
    onResetRound,
    onGoToNextIssue,
}: BoardCenterStateProps) => {
    const isRoundActionDisabled = isResetRoundSubmitting || isNextIssueSubmitting;

    return (
        <Box className={styles.centerState}>
            <Box className={styles.centerPlatform}>
                <Typography className={styles.centerText}>
                    {showRevealButton
                        ? activeIssue
                            ? 'Очікуємо оцінки гравців...'
                            : onlineParticipantsCount
                                ? 'Оберіть активну задачу, щоб почати новий раунд'
                                : 'Очікуємо підключення гравців...'
                        : null}
                </Typography>

                <Typography className={styles.centerIssue}>
                    {activeIssue
                        ? `${activeIssue.code ? `${activeIssue.code} · ` : ''}${activeIssue.title}`
                        : 'Оберіть активну задачу, щоб почати новий раунд'}
                </Typography>

                {showRevealButton ? (
                    <button
                        type="button"
                        className={styles.revealVotesButton}
                        onClick={() => {
                            void onRevealVotes();
                        }}
                        disabled={!canRevealVotes || isRevealSubmitting}
                    >
                        {isRevealSubmitting ? 'Відкриваємо...' : 'Відкрити карти'}
                    </button>
                ) : null}

                {isRoundRevealed && (canOpenResult || canResetCurrentRound || canGoToNextIssue) ? (
                    <Box className={styles.centerActions}>
                        {canResetCurrentRound ? (
                            <Tooltip
                                title={isResetRoundSubmitting ? 'Скидаємо раунд...' : 'Оцінити заново'}
                                arrow
                                placement="top"
                            >
                                <span className={styles.centerTooltipWrap}>
                                    <button
                                        type="button"
                                        className={styles.centerIconButton}
                                        onClick={() => {
                                            void onResetRound();
                                        }}
                                        disabled={isRoundActionDisabled}
                                        aria-label="Оцінити заново"
                                    >
                                        <ReplayRoundedIcon className={styles.centerActionIcon} />
                                    </button>
                                </span>
                            </Tooltip>
                        ) : null}

                        {canOpenResult ? (
                            <button
                                type="button"
                                className={styles.centerSecondaryButton}
                                onClick={onOpenResult}
                                disabled={isRoundActionDisabled}
                            >
                                Результат
                            </button>
                        ) : null}

                        {canGoToNextIssue ? (
                            <Tooltip
                                title={isNextIssueSubmitting ? 'Переходимо до наступної issue...' : 'Наступна issue'}
                                arrow
                                placement="top"
                            >
                                <span className={styles.centerTooltipWrap}>
                                    <button
                                        type="button"
                                        className={[styles.centerIconButton, styles.centerIconButtonPrimary].join(' ')}
                                        onClick={() => {
                                            void onGoToNextIssue();
                                        }}
                                        disabled={isRoundActionDisabled}
                                        aria-label="Наступна issue"
                                    >
                                        <SkipNextRoundedIcon className={styles.centerActionIcon} />
                                    </button>
                                </span>
                            </Tooltip>
                        ) : null}
                    </Box>
                ) : null}
            </Box>
        </Box>
    );
};