import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import { Box, Tooltip, Typography } from '@mui/material';

import type { Issue } from '@entities/issue';
import styles from './game-room-surface.module.css';

type BoardCenterStateProps = {
    onlineParticipantsCount: number;
    activeIssue: Issue | null;
    votesCastCount: number;
    revealCountdown: number | null;
    isTimerExpiredWithoutAutoReveal: boolean;
    showRevealButton: boolean;
    canRevealVotes: boolean;
    canRestartTimer: boolean;
    isRevealSubmitting: boolean;
    isTimerPending: boolean;
    isRoundRevealed: boolean;
    canOpenResult: boolean;
    canResetCurrentRound: boolean;
    canGoToNextIssue: boolean;
    isResetRoundSubmitting: boolean;
    isNextIssueSubmitting: boolean;
    onRevealVotes: () => Promise<void>;
    onRestartTimer: () => Promise<void>;
    onOpenResult: () => void;
    onResetRound: () => Promise<void>;
    onGoToNextIssue: () => Promise<void>;
};

export const BoardCenterState = ({
    onlineParticipantsCount,
    activeIssue,
    revealCountdown,
    isTimerExpiredWithoutAutoReveal,
    showRevealButton,
    canRevealVotes,
    canRestartTimer,
    isRevealSubmitting,
    isTimerPending,
    isRoundRevealed,
    canOpenResult,
    canResetCurrentRound,
    canGoToNextIssue,
    isResetRoundSubmitting,
    isNextIssueSubmitting,
    onRevealVotes,
    onRestartTimer,
    onOpenResult,
    onResetRound,
    onGoToNextIssue,
}: BoardCenterStateProps) => {
    const isRoundActionDisabled = isResetRoundSubmitting || isNextIssueSubmitting;

    return (
        <Box className={styles.centerState}>
            <Box className={styles.centerPlatform}>
                {revealCountdown !== null ? (
                    <Typography className={styles.centerCountdownValue}>
                        {revealCountdown}
                    </Typography>
                ) : (
                    <>
                        <Typography
                            className={[
                                styles.centerText,
                                isTimerExpiredWithoutAutoReveal ? styles.centerTextWarning : '',
                            ].join(' ').trim()}
                        >
                            {isTimerExpiredWithoutAutoReveal
                                ? 'Час вийшов'
                                : showRevealButton
                                    ? activeIssue
                                        ? 'Очікуємо оцінки гравців...'
                                        : onlineParticipantsCount
                                            ? 'Оберіть активну задачу, щоб почати новий раунд'
                                            : 'Очікуємо підключення гравців...'
                                    : null}
                        </Typography>

                        {isTimerExpiredWithoutAutoReveal ? (
                            <Typography className={styles.centerExpiredBadge}>
                                Відкрийте карти або запустіть таймер знову
                            </Typography>
                        ) : null}
                    </>
                )}

                <Typography className={styles.centerIssue}>
                    {activeIssue
                        ? `${activeIssue.code ? `${activeIssue.code} · ` : ''}${activeIssue.title}`
                        : 'Оберіть активну задачу, щоб почати новий раунд'}
                </Typography>

                {showRevealButton ? (
                    <Box className={styles.centerActions}>
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

                        {isTimerExpiredWithoutAutoReveal && canRestartTimer ? (
                            <button
                                type="button"
                                className={styles.centerSecondaryButton}
                                onClick={() => {
                                    void onRestartTimer();
                                }}
                                disabled={isTimerPending}
                            >
                                Почати знову
                            </button>
                        ) : null}
                    </Box>
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
