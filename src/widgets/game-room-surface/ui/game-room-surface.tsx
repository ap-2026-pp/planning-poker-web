import { Box } from '@mui/material';

import type { Issue } from '@entities/issue';
import type { GameParticipant } from '@entities/participant';
import type { VoteDeckCard } from '@shared/model/voting';
import type { PositionedParticipant } from '@widgets/game-room-surface';
import { BoardCenterState } from './board-center-state';
import { ParticipantCard } from './participant-card';
import { RoundStatusLine } from './round-status-line';
import { SurfaceMetaBar } from './surface-meta-bar';
import { VoteDeck } from './vote-deck';
import styles from './game-room-surface.module.css';

type GameRoomSurfaceProps = {
  inviteCode: string;
  copiedItem: 'code' | 'invite-link' | null;
  onlineParticipantsCount: number;
  currentParticipantId: string | null;
  isCurrentParticipantMaster: boolean;
  selectedParticipantId: string | null;
  pendingParticipantActionId: string | null;
  votingSystemLabel: string;
  roundLabel: string;
  activeIssue: Issue | null;
  positionedParticipants: PositionedParticipant[];
  overflowParticipants: GameParticipant[];
  deckValues: readonly VoteDeckCard[];
  onCopyCode: () => Promise<void>;
  onParticipantSelect: (participantId: string) => void;
  onRemoveParticipant: (participantId: string) => Promise<void>;
  onTransferMaster: (participantId: string) => Promise<void>;
};

export const GameRoomSurface = ({
  inviteCode,
  copiedItem,
  onlineParticipantsCount,
  currentParticipantId,
  isCurrentParticipantMaster,
  selectedParticipantId,
  pendingParticipantActionId,
  votingSystemLabel,
  roundLabel,
  activeIssue,
  positionedParticipants,
  overflowParticipants,
  deckValues,
  onCopyCode,
  onParticipantSelect,
  onRemoveParticipant,
  onTransferMaster,
}: GameRoomSurfaceProps) => (
  <Box className={styles.tableSurface}>
    <SurfaceMetaBar
      inviteCode={inviteCode}
      copiedItem={copiedItem}
      onlineParticipantsCount={onlineParticipantsCount}
      votingSystemLabel={votingSystemLabel}
      onCopyCode={onCopyCode}
    />

    <RoundStatusLine roundLabel={roundLabel} />

    <Box className={styles.boardArena}>
      {positionedParticipants.map(({ participant, left, top }) => (
        <ParticipantCard
          key={participant.id}
          participant={participant}
          currentParticipantId={currentParticipantId}
          isCurrentParticipantMaster={isCurrentParticipantMaster}
          isSelected={selectedParticipantId === participant.id}
          isPending={pendingParticipantActionId === participant.id}
          left={left}
          top={top}
          onParticipantSelect={onParticipantSelect}
          onRemoveParticipant={onRemoveParticipant}
          onTransferMaster={onTransferMaster}
        />
      ))}

      <BoardCenterState
        onlineParticipantsCount={onlineParticipantsCount}
        activeIssue={activeIssue}
      />
    </Box>

    {overflowParticipants.length ? (
      <Box className={styles.overflowGrid}>
        {overflowParticipants.map((participant) => (
          <ParticipantCard
            key={participant.id}
            participant={participant}
            currentParticipantId={currentParticipantId}
            isCurrentParticipantMaster={isCurrentParticipantMaster}
            isSelected={selectedParticipantId === participant.id}
            isPending={pendingParticipantActionId === participant.id}
            compact
            onParticipantSelect={onParticipantSelect}
            onRemoveParticipant={onRemoveParticipant}
            onTransferMaster={onTransferMaster}
          />
        ))}
      </Box>
    ) : null}

    <VoteDeck deckValues={deckValues} />
  </Box>
);