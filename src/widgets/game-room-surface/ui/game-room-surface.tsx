import {
  Box,
  Button,
  Divider,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState, type ChangeEvent, type MouseEvent } from 'react';

import type { VoteDeckCard } from '@entities/game';
import { getIssueToneIndex, type Issue } from '@entities/issue';
import type { GameParticipant } from '@entities/participant';
import type { PositionedParticipant } from '@widgets/game-room-surface';
import { BoardCenterState } from './board-center-state';
import { ParticipantCard } from './participant-card';
import { RoundStatusLine } from './round-status-line';
import { SurfaceMetaBar } from './surface-meta-bar';
import { VoteDeck } from './vote-deck';
import styles from './game-room-surface.module.css';

const formatTimerOptionLabel = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds} с`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainderSeconds = seconds % 60;

  return remainderSeconds > 0
    ? `${minutes} хв ${remainderSeconds} с`
    : `${minutes} хв`;
};

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
  timerOptions: readonly number[];
  selectedTimerSeconds: number;
  timerLabel: string;
  isTimerActive: boolean;
  hasTimerState: boolean;
  isTimerExpiredWithoutAutoReveal: boolean;
  isTimerPending: boolean;
  revealCountdown: number | null;
  canRevealCurrentRound: boolean;
  canVoteInRound: boolean;
  currentVoteValue: string | null;
  votesCastCount: number;
  isRoundRevealed: boolean;
  isVoteSubmitting: boolean;
  isRevealSubmitting: boolean;
  canOpenResult: boolean;
  canResetCurrentRound: boolean;
  canGoToNextIssue: boolean;
  isResetRoundSubmitting: boolean;
  isNextIssueSubmitting: boolean;
  onTimerDurationChange: (seconds: number) => void;
  onStartTimer: (seconds: number) => Promise<void>;
  onRestartTimer: () => Promise<void>;
  onStopTimer: () => Promise<void>;
  onVoteSelect: (voteValue: string | null) => Promise<void>;
  onRevealVotes: () => Promise<void>;
  onOpenResult: () => void;
  onResetRound: () => Promise<void>;
  onGoToNextIssue: () => Promise<void>;
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
  timerOptions,
  selectedTimerSeconds,
  timerLabel,
  isTimerActive,
  hasTimerState,
  isTimerExpiredWithoutAutoReveal,
  isTimerPending,
  revealCountdown,
  canRevealCurrentRound,
  canVoteInRound,
  currentVoteValue,
  votesCastCount,
  isRoundRevealed,
  isVoteSubmitting,
  isRevealSubmitting,
  canOpenResult,
  canResetCurrentRound,
  canGoToNextIssue,
  isResetRoundSubmitting,
  isNextIssueSubmitting,
  onTimerDurationChange,
  onStartTimer,
  onRestartTimer,
  onStopTimer,
  onVoteSelect,
  onRevealVotes,
  onOpenResult,
  onResetRound,
  onGoToNextIssue,
  onParticipantSelect,
  onRemoveParticipant,
  onTransferMaster,
  onOpenGameSettings,
}: GameRoomSurfaceProps) => {
  const [timerAnchorEl, setTimerAnchorEl] = useState<HTMLElement | null>(null);
  const [manualTimerInput, setManualTimerInput] = useState(() => String(selectedTimerSeconds));

  const showRevealButton = canRevealCurrentRound && Boolean(activeIssue) && !isRoundRevealed;
  const canRevealVotes = showRevealButton && votesCastCount > 0;
  const manualTimerSeconds = Number.parseInt(manualTimerInput, 10);
  const isManualTimerValid = Number.isFinite(manualTimerSeconds)
    && manualTimerSeconds >= 1
    && manualTimerSeconds <= 3600;

  useEffect(() => {
    setManualTimerInput(String(selectedTimerSeconds));
  }, [selectedTimerSeconds]);

  const handleOpenTimerMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setTimerAnchorEl(event.currentTarget);
  };

  const handleCloseTimerMenu = () => {
    setTimerAnchorEl(null);
    setManualTimerInput(String(selectedTimerSeconds));
  };

  const handleStartTimer = (seconds: number) => {
    void onStartTimer(seconds);
    handleCloseTimerMenu();
  };

  const handleManualTimerChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const normalizedValue = event.target.value.replace(/[^\d]/g, '');

    setManualTimerInput(normalizedValue);

    if (!normalizedValue) {
      return;
    }

    const nextSeconds = Number.parseInt(normalizedValue, 10);

    if (Number.isFinite(nextSeconds) && nextSeconds >= 1 && nextSeconds <= 3600) {
      onTimerDurationChange(nextSeconds);
    }
  };

  const handleRestartTimer = () => {
    void onRestartTimer();
    handleCloseTimerMenu();
  };

  const handleStartManualTimer = () => {
    if (!isManualTimerValid) {
      return;
    }

    onTimerDurationChange(manualTimerSeconds);
    void onStartTimer(manualTimerSeconds);
    handleCloseTimerMenu();
  };

  const handleStopTimer = () => {
    void onStopTimer();
    handleCloseTimerMenu();
  };

  return (
    <Box className={styles.tableSurface}>
      <SurfaceMetaBar
        onlineParticipantsCount={onlineParticipantsCount}
        showSettings={isCurrentParticipantMaster}
        canManageTimer={isCurrentParticipantMaster}
        timerLabel={timerLabel}
        isTimerActive={isTimerActive}
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
          revealCountdown={revealCountdown}
          isTimerExpiredWithoutAutoReveal={isTimerExpiredWithoutAutoReveal}
          showRevealButton={showRevealButton}
          canRevealVotes={canRevealVotes}
          canRestartTimer={isCurrentParticipantMaster && Boolean(activeIssue) && !isRoundRevealed}
          isRevealSubmitting={isRevealSubmitting}
          isTimerPending={isTimerPending}
          isRoundRevealed={isRoundRevealed}
          canOpenResult={canOpenResult}
          canResetCurrentRound={canResetCurrentRound}
          canGoToNextIssue={canGoToNextIssue}
          isResetRoundSubmitting={isResetRoundSubmitting}
          isNextIssueSubmitting={isNextIssueSubmitting}
          onRevealVotes={onRevealVotes}
          onRestartTimer={onRestartTimer}
          onOpenResult={onOpenResult}
          onResetRound={onResetRound}
          onGoToNextIssue={onGoToNextIssue}
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
        {timerOptions.map((seconds) => (
          <MenuItem
            key={seconds}
            selected={seconds === selectedTimerSeconds}
            onClick={() => handleStartTimer(seconds)}
            disabled={!activeIssue || isRoundRevealed || isTimerPending}
          >
            {formatTimerOptionLabel(seconds)}
          </MenuItem>
        ))}

        <Divider />

        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'grid',
            gap: 1.25,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            Власний час у секундах
          </Typography>

          <TextField
            size="small"
            type="number"
            value={manualTimerInput}
            onChange={handleManualTimerChange}
            placeholder="60"
            inputProps={{
              min: 1,
              max: 3600,
              step: 1,
            }}
            error={manualTimerInput.length > 0 && !isManualTimerValid}
            helperText={manualTimerInput.length > 0 && !isManualTimerValid ? 'Введіть від 1 до 3600 секунд' : ' '}
          />

          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleStartManualTimer}
              disabled={!activeIssue || isRoundRevealed || isTimerPending || !isManualTimerValid}
            >
              {isTimerActive || isTimerExpiredWithoutAutoReveal ? 'Перезапустити' : 'Запустити'}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleStopTimer}
              disabled={!hasTimerState || isTimerPending}
            >
              Скинути час
            </Button>
          </Stack>

          <Button
            variant="text"
            onClick={handleRestartTimer}
            disabled={!activeIssue || isRoundRevealed || isTimerPending}
          >
            Рестарт за поточним значенням
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};
