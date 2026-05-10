import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';
import { useState } from 'react';

import { ParticipantRole, roleLabels, type GameParticipant } from '@entities/participant';
import styles from './game-room-surface.module.css';

type ParticipantActionPanelProps = {
    participant: GameParticipant;
    currentParticipantId: string | null;
    isCurrentParticipantMaster: boolean;
    isPending: boolean;
    onRemoveParticipant: (participantId: string) => Promise<void>;
    onTransferMaster: (participantId: string) => Promise<void>;
};

type ConfirmAction = 'remove' | 'transfer' | null;

export const ParticipantActionPanel = ({
    participant,
    currentParticipantId,
    isCurrentParticipantMaster,
    isPending,
    onRemoveParticipant,
    onTransferMaster,
}: ParticipantActionPanelProps) => {
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

    const isSelf = participant.id === currentParticipantId;
    const canManageParticipant = isCurrentParticipantMaster && !isSelf;
    const canTransferMaster = canManageParticipant && participant.role !== ParticipantRole.Spectator;

    const handleCloseDialog = () => {
        if (isPending) {
            return;
        }

        setConfirmAction(null);
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

    if (canManageParticipant) {
        return (
            <>
                <Box className={styles.participantActionPanel}>
                    {canTransferMaster ? (
                        <button
                            type="button"
                            className={styles.participantActionButton}
                            disabled={isPending}
                            onClick={(event) => {
                                event.stopPropagation();
                                setConfirmAction('transfer');
                            }}
                        >
                            {isPending ? <CircularProgress size={14} color="inherit" /> : <ShieldRoundedIcon />}
                            <span>Передати master</span>
                        </button>
                    ) : null}

                    <button
                        type="button"
                        className={[styles.participantActionButton, styles.participantActionDanger].join(' ')}
                        disabled={isPending}
                        onClick={(event) => {
                            event.stopPropagation();
                            setConfirmAction('remove');
                        }}
                    >
                        {isPending ? <CircularProgress size={14} color="inherit" /> : <PersonRemoveRoundedIcon />}
                        <span>Видалити</span>
                    </button>
                </Box>

                <Dialog open={Boolean(confirmAction)} onClose={handleCloseDialog}>
                    <DialogTitle>
                        {confirmAction === 'remove'
                            ? 'Видалити учасника?'
                            : 'Передати права master?'}
                    </DialogTitle>

                    <DialogContent>
                        <Typography>
                            {confirmAction === 'remove'
                                ? (
                                    <>
                                        Ви впевнені, що хочете видалити <strong>{participant.displayName}</strong> з кімнати?
                                    </>
                                )
                                : (
                                    <>
                                        Ви впевнені, що хочете передати права master учаснику{' '}
                                        <strong>{participant.displayName}</strong>?
                                    </>
                                )}
                        </Typography>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleCloseDialog} disabled={isPending}>
                            Скасувати
                        </Button>

                        <Button
                            onClick={() => void handleConfirm()}
                            disabled={isPending}
                            color={confirmAction === 'remove' ? 'error' : 'primary'}
                            variant="contained"
                        >
                            {isPending
                                ? confirmAction === 'remove'
                                    ? 'Видаляємо...'
                                    : 'Передаємо...'
                                : confirmAction === 'remove'
                                    ? 'Видалити'
                                    : 'Передати'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }

    return (
        <Box className={styles.participantHintPanel}>
            {isSelf ? 'Ви' : roleLabels[participant.role]}
        </Box>
    );
};