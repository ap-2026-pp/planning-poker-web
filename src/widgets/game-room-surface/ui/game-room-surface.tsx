import { Box, Menu, MenuItem } from '@mui/material';
import { useEffect, useState, type MouseEvent } from 'react';

import type { RoomRoundResult, VoteDeckCard } from '@entities/game';
import { getIssueToneIndex, type Issue } from '@entities/issue';
import type { GameParticipant } from '@entities/participant';
import type { PositionedParticipant } from '@widgets/game-room-surface';
import { BoardCenterState } from './board-center-state';
import { ParticipantCard } from './participant-card';
import { RoundStatusLine } from './round-status-line';
import { SurfaceMetaBar } from './surface-meta-bar';
import { VoteDeck } from './vote-deck';
import styles from './game-room-surface.module.css';

type GameRoomSurfaceProps = {
  onlineParticipantsCount: number;
  currentParticipantId: string | null;
  isCurrentParticipantMaster: boolean;
  selectedParticipantId: string | null;
  pendingParticipantActionId: string | null;
  roundLabel: string;
  activeIssue: Issue | null;
  positionedParticipants: PositionedParticipant[];
  overflowParticipants: GameParticipant[];
  deckValues: readonly VoteDeckCard[];
  canRevealCurrentRound: boolean;
  canVoteInRound: boolean;
  currentVoteValue: string | null;
  votesCastCount: number;
  roundResult: RoomRoundResult | null;
  isRoundRevealed: boolean;
  showAverage: boolean;
  isVoteSubmitting: boolean;
  isRevealSubmitting: boolean;
  onVoteSelect: (voteValue: string | null) => Promise<void>;
  onRevealVotes: () => Promise<void>;
  onParticipantSelect: (participantId: string) => void;
  onRemoveParticipant: (participantId: string) => Promise<void>;
  onTransferMaster: (participantId: string) => Promise<void>;
  onOpenGameSettings: () => void;
};

export const GameRoomSurface = ({
  onlineParticipantsCount,
  currentParticipantId,
  isCurrentParticipantMaster,
  selectedParticipantId,
  pendingParticipantActionId,
  roundLabel,
  activeIssue,
  positionedParticipants,
  overflowParticipants,
  deckValues,
  canRevealCurrentRound,
  canVoteInRound,
  currentVoteValue,
  votesCastCount,
  roundResult,
  isRoundRevealed,
  showAverage,
  isVoteSubmitting,
  isRevealSubmitting,
  onVoteSelect,
  onRevealVotes,
  onParticipantSelect,
  onRemoveParticipant,
  onTransferMaster,
  onOpenGameSettings,
}: GameRoomSurfaceProps) => {
  const [timerAnchorEl, setTimerAnchorEl] = useState<HTMLElement | null>(null);
  const [timerEndsAt, setTimerEndsAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    setTimerEndsAt(null);
    setRemainingSeconds(null);
  }, [activeIssue?.id]);

  useEffect(() => {
    if (!timerEndsAt) {
      setRemainingSeconds(null);
      return undefined;
    }

    const updateTimer = () => {
      const nextRemaining = Math.max(0, Math.ceil((timerEndsAt - Date.now()) / 1000));

      if (nextRemaining <= 0) {
        setTimerEndsAt(null);
        setRemainingSeconds(null);
        return;
      }

      setRemainingSeconds(nextRemaining);
    };

    updateTimer();

    const intervalId = window.setInterval(updateTimer, 250);

    return () => window.clearInterval(intervalId);
  }, [timerEndsAt]);

  const showRevealButton = canRevealCurrentRound && Boolean(activeIssue) && !isRoundRevealed;
  const canRevealVotes = showRevealButton && votesCastCount > 0;

  const handleOpenTimerMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setTimerAnchorEl(event.currentTarget);
  };

  const handleCloseTimerMenu = () => {
    setTimerAnchorEl(null);
  };

  const handleStartTimer = (seconds: number) => {
    setTimerEndsAt(Date.now() + seconds * 1000);
    handleCloseTimerMenu();
  };

  const handleStopTimer = () => {
    setTimerEndsAt(null);
    setRemainingSeconds(null);
    handleCloseTimerMenu();
  };

  const timerLabel = remainingSeconds !== null
    ? `${Math.floor(remainingSeconds / 60)
        .toString()
        .padStart(2, '0')}:${(remainingSeconds % 60).toString().padStart(2, '0')}`
    : 'Таймер';

  return (
    <Box className={styles.tableSurface}>
      <SurfaceMetaBar
        onlineParticipantsCount={onlineParticipantsCount}
        showSettings={isCurrentParticipantMaster}
        showTimerControl={isCurrentParticipantMaster}
        timerLabel={timerLabel}
        isTimerActive={remainingSeconds !== null}
        onOpenTimerMenu={handleOpenTimerMenu}
        onOpenGameSettings={onOpenGameSettings}
      />

      <RoundStatusLine
        roundLabel={roundLabel}
        issueToneIndex={activeIssue ? getIssueToneIndex(activeIssue) : null}
      />

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
          votesCastCount={votesCastCount}
          showRevealButton={showRevealButton}
          canRevealVotes={canRevealVotes}
          isRevealSubmitting={isRevealSubmitting}
          isRoundRevealed={isRoundRevealed}
          roundResult={roundResult}
          showAverage={showAverage}
          onRevealVotes={onRevealVotes}
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

      <VoteDeck
        deckValues={deckValues}
        selectedValue={currentVoteValue}
        canVote={canVoteInRound}
        hasActiveIssue={Boolean(activeIssue)}
        isSubmitting={isVoteSubmitting}
        onSelectVote={onVoteSelect}
      />

      <Menu
        anchorEl={timerAnchorEl}
        open={Boolean(timerAnchorEl)}
        onClose={handleCloseTimerMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 188,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            backgroundImage: 'none',
          },
        }}
      >
        {[30, 60, 120, 300].map((seconds) => (
          <MenuItem key={seconds} onClick={() => handleStartTimer(seconds)}>
            {seconds < 60 ? `${seconds} с` : `${seconds / 60} хв`}
          </MenuItem>
        ))}

        {remainingSeconds !== null ? (
          <MenuItem onClick={handleStopTimer}>Зупинити таймер</MenuItem>
        ) : null}
      </Menu>
    </Box>
  );
};
