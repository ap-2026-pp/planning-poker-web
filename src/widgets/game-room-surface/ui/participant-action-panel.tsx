import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { Box, CircularProgress, Menu } from '@mui/material';
import { useState } from 'react';

import { ParticipantRole, roleLabels, type GameParticipant } from '@entities/participant';
import { ConfirmActionDialog } from '@shared/ui/confirm-action-dialog/confirm-action-dialog';
import styles from './game-room-surface.module.css';

const quickEmojiOptions = ['🔥', '👏', '🎉', '💥', '🚀'] as const;
const allEmojiOptions = [...quickEmojiOptions, '😂', '🤯', '⭐', '💯', '☕', '👀', '🦄'] as const;

type ParticipantActionPanelProps = {
    participant: GameParticipant;
    currentParticipantId: string | null;
    isCurrentParticipantMaster: boolean;
    canSendEmoji: boolean;
    isPending: boolean;
    onRemoveParticipant: (participantId: string) => Promise<void>;
    onTransferMaster: (participantId: string) => Promise<void>;
    onSendEmoji: (participantId: string, emoji: string) => Promise<void>;
};

type ConfirmAction = 'remove' | 'transfer' | null;

export const ParticipantActionPanel = ({
    participant,
    currentParticipantId,
    isCurrentParticipantMaster,
    canSendEmoji,
    isPending,
    onRemoveParticipant,
    onTransferMaster,
    onSendEmoji,
}: ParticipantActionPanelProps) => {
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
    const [emojiMenuAnchorEl, setEmojiMenuAnchorEl] = useState<HTMLElement | null>(null);
    const [pendingEmoji, setPendingEmoji] = useState<string | null>(null);

    const isSelf = participant.id === currentParticipantId;
    const canManageParticipant = isCurrentParticipantMaster && !isSelf;
    const canTransferMaster =
        canManageParticipant && participant.role !== ParticipantRole.Spectator;
    const isBusy = isPending || pendingEmoji !== null;

    const handleCloseDialog = () => {
        if (isBusy) {
            return;
        }

        setConfirmAction(null);
    };

    const handleCloseEmojiMenu = () => {
        if (pendingEmoji !== null) {
            return;
        }

        setEmojiMenuAnchorEl(null);
    };

    const handleSendEmoji = async (emoji: string) => {
        setPendingEmoji(emoji);

        try {
            await onSendEmoji(participant.id, emoji);
            setEmojiMenuAnchorEl(null);
        } catch {
            // The page-level model already surfaces the error to the user.
        } finally {
            setPendingEmoji(null);
        }
    };

    const handleConfirm = async () => {
        if (confirmAction === 'remove') {
            await onRemoveParticipant(participant.id);
            setConfirmAction(null);
            return;
        }

        if (confirmAction === 'transfer') {
            await onTransferMaster(participant.id);
            setConfirmAction(null);
        }
    };

    if (!canManageParticipant && !canSendEmoji) {
        return (
            <>
                <Box className={styles.participantPopoverStack}>
                    <Box className={styles.participantHintPanel}>
                        {isSelf ? 'Ви' : roleLabels[participant.role]}
                    </Box>
                </Box>
            </>
        );
    }

    const dialogTitle =
        confirmAction === 'remove'
            ? 'Видалити учасника?'
            : 'Передати права master?';

    const dialogDescription =
        confirmAction === 'remove'
            ? `Ви впевнені, що хочете видалити ${participant.displayName} з кімнати?`
            : `Ви впевнені, що хочете передати права master учаснику ${participant.displayName}?`;

    const confirmLabel =
        isPending
            ? confirmAction === 'remove'
                ? 'Видаляємо...'
                : 'Передаємо...'
            : confirmAction === 'remove'
                ? 'Видалити'
                : 'Передати';

    return (
        <>
            <Box className={styles.participantPopoverStack}>
                {canSendEmoji ? (
                    <Box className={styles.emojiPickerPanel}>
                        <Box className={styles.emojiQuickList}>
                            {quickEmojiOptions.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    className={[
                                        styles.emojiReactionButton,
                                        pendingEmoji === emoji ? styles.emojiReactionButtonActive : '',
                                    ].join(' ').trim()}
                                    disabled={isBusy}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        void handleSendEmoji(emoji);
                                    }}
                                    aria-label={`Кинути ${emoji} у ${participant.displayName}`}
                                >
                                    <span>{emoji}</span>
                                </button>
                            ))}

                            <button
                                type="button"
                                className={[styles.emojiReactionButton, styles.emojiReactionMoreButton].join(' ')}
                                disabled={isBusy}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setEmojiMenuAnchorEl(event.currentTarget);
                                }}
                                aria-label={`Відкрити більше emoji для ${participant.displayName}`}
                            >
                                <AddRoundedIcon />
                            </button>
                        </Box>
                    </Box>
                ) : null}

                {canManageParticipant ? (
                    <Box className={styles.participantActionPanel}>
                        {canTransferMaster ? (
                            <button
                                type="button"
                                className={styles.participantActionButton}
                                disabled={isBusy}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setConfirmAction('transfer');
                                }}
                            >
                                {isPending ? (
                                    <CircularProgress size={14} color="inherit" />
                                ) : (
                                    <ShieldRoundedIcon />
                                )}
                                <span>Передати master</span>
                            </button>
                        ) : null}

                        <button
                            type="button"
                            className={[styles.participantActionButton, styles.participantActionDanger].join(' ')}
                            disabled={isBusy}
                            onClick={(event) => {
                                event.stopPropagation();
                                setConfirmAction('remove');
                            }}
                        >
                            {isPending ? (
                                <CircularProgress size={14} color="inherit" />
                            ) : (
                                <PersonRemoveRoundedIcon />
                            )}
                            <span>Видалити</span>
                        </button>
                    </Box>
                ) : null}
            </Box>

            <Menu
                anchorEl={emojiMenuAnchorEl}
                open={Boolean(emojiMenuAnchorEl)}
                onClose={handleCloseEmojiMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                MenuListProps={{ disablePadding: true, className: styles.emojiMenuList }}
                PaperProps={{ className: styles.emojiMenuPaper }}
            >
                <Box className={styles.emojiMenuGrid} onClick={(event) => event.stopPropagation()}>
                    {allEmojiOptions.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            className={[
                                styles.emojiReactionButton,
                                styles.emojiReactionButtonLarge,
                                pendingEmoji === emoji ? styles.emojiReactionButtonActive : '',
                            ].join(' ').trim()}
                            disabled={isBusy}
                            onClick={() => {
                                void handleSendEmoji(emoji);
                            }}
                            aria-label={`Кинути ${emoji} у ${participant.displayName}`}
                        >
                            <span>{emoji}</span>
                        </button>
                    ))}
                </Box>
            </Menu>

            <ConfirmActionDialog
                open={Boolean(confirmAction)}
                title={dialogTitle}
                description={dialogDescription}
                confirmLabel={confirmLabel}
                cancelLabel="Скасувати"
                onClose={handleCloseDialog}
                onConfirm={() => void handleConfirm()}
            />
        </>
    );
};
