import { Box, Typography } from '@mui/material';

import { ParticipantRole, type GameParticipant } from '@entities/participant';
import { ParticipantActionPanel } from './participant-action-panel';
import { PlayerVotePreview } from './player-vote-preview';
import styles from './game-room-surface.module.css';

type ParticipantCardProps = {
    participant: GameParticipant;
    currentParticipantId: string | null;
    isCurrentParticipantMaster: boolean;
    isSelected: boolean;
    isPending: boolean;
    areVotesRevealed?: boolean;
    left?: string;
    top?: string;
    compact?: boolean;
    onParticipantSelect: (participantId: string) => void;
    onRemoveParticipant: (participantId: string) => Promise<void>;
    onTransferMaster: (participantId: string) => Promise<void>;
};

export const ParticipantCard = ({
    participant,
    currentParticipantId,
    isCurrentParticipantMaster,
    isSelected,
    isPending,
    areVotesRevealed = false,
    left,
    top,
    compact = false,
    onParticipantSelect,
    onRemoveParticipant,
    onTransferMaster,
}: ParticipantCardProps) => {

    // Temporary logic to show vote preview for current participant until backend starts sending vote values only for revealed votes
    
    //   const originalVoteValue = (
    //     participant as GameParticipant & {
    //         voteValue?: string | number | null;
    //     }
    // ).voteValue;

    // const voteValue =
    //     participant.id === currentParticipantId ? '5' : originalVoteValue;

    // const votePreviewState = voteValue ? 'hidden' : 'empty';

    // const votePreviewState = participant.id === currentParticipantId ? 'revealed' : 'empty';
    // const voteValue = participant.id === currentParticipantId ? '5' : null;

    const voteValue = (
        participant as GameParticipant & {
            voteValue?: string | number | null;
        }
    ).voteValue;

    const votePreviewState = voteValue ? (areVotesRevealed ? 'revealed' : 'hidden') : 'empty';

    return (
        <Box
            className={[
                compact ? styles.overflowParticipantCard : styles.participantCard,
                isSelected ? styles.participantCardSelected : '',
            ]
                .join(' ')
                .trim()}
            sx={compact ? undefined : { left, top }}
        >
            {isSelected ? (
                <ParticipantActionPanel
                    participant={participant}
                    currentParticipantId={currentParticipantId}
                    isCurrentParticipantMaster={isCurrentParticipantMaster}
                    isPending={isPending}
                    onRemoveParticipant={onRemoveParticipant}
                    onTransferMaster={onTransferMaster}
                />
            ) : null}

            <button
                type="button"
                className={styles.participantCardButton}
                onClick={() => onParticipantSelect(participant.id)}
            >
                <PlayerVotePreview state={votePreviewState} value={voteValue} />

                <Typography className={styles.participantName}>
                    {participant.displayName}
                </Typography>

                <Typography className={styles.participantRole}>
                    {participant.role === ParticipantRole.Master
                        ? 'Master'
                        : participant.role === ParticipantRole.Player
                            ? 'Player'
                            : 'Spectator'}
                </Typography>
            </button>
        </Box>
    );
};
