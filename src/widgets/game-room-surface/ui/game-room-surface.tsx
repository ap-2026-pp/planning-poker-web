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
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type MouseEvent,
} from 'react';

import type { VoteDeckCard } from '@entities/game';
import { getIssueToneIndex, type Issue } from '@entities/issue';
import type { GameParticipant } from '@entities/participant';
import type { EmojiReaction } from '@entities/reaction';
import type { PositionedParticipant } from '@widgets/game-room-surface';
import { BoardCenterState } from './board-center-state';
import { ParticipantCard } from './participant-card';
import { RoundStatusLine } from './round-status-line';
import { SurfaceMetaBar } from './surface-meta-bar';
import { VoteDeck } from './vote-deck';
import styles from './game-room-surface.module.css';

const emojiFlightDurationMs = 760;
const emojiImpactDurationMs = 540;

type EmojiReactionEvent = EmojiReaction & {
  animationId: string;
};

type EmojiFlightAnimation = {
  id: string;
  emoji: string;
  startX: number;
  startY: number;
  midX: number;
  midY: number;
  endX: number;
  endY: number;
};

type EmojiImpactAnimation = {
  id: string;
  emoji: string;
  x: number;
  y: number;
};

type EmojiFlightStyle = CSSProperties & {
  '--emoji-flight-mid-x': string;
  '--emoji-flight-mid-y': string;
  '--emoji-flight-x': string;
  '--emoji-flight-y': string;
};

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
  enableFunFeatures: boolean;
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
  hasPausedTimer: boolean;
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
  onResetTimer: () => Promise<void>;
  onStopTimer: () => Promise<void>;
  onVoteSelect: (voteValue: string | null) => Promise<void>;
  onRevealVotes: () => Promise<void>;
  onOpenResult: () => void;
  onResetRound: () => Promise<void>;
  onGoToNextIssue: () => Promise<void>;
  onParticipantSelect: (participantId: string) => void;
  onRemoveParticipant: (participantId: string) => Promise<void>;
  onTransferMaster: (participantId: string) => Promise<void>;
  onSendEmojiReaction: (participantId: string, emoji: string) => Promise<void>;
  emojiReactionEvents: EmojiReactionEvent[];
  onConsumeEmojiReactionEvent: (animationId: string) => void;
  onOpenGameSettings: () => void;
};

export const GameRoomSurface = ({
  onlineParticipantsCount,
  currentParticipantId,
  isCurrentParticipantMaster,
  enableFunFeatures,
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
  hasPausedTimer,
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
  onResetTimer,
  onStopTimer,
  onVoteSelect,
  onRevealVotes,
  onOpenResult,
  onResetRound,
  onGoToNextIssue,
  onParticipantSelect,
  onRemoveParticipant,
  onTransferMaster,
  onSendEmojiReaction,
  emojiReactionEvents,
  onConsumeEmojiReactionEvent,
  onOpenGameSettings,
}: GameRoomSurfaceProps) => {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const participantCardElementsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const processedEmojiReactionIdsRef = useRef<Set<string>>(new Set());
  const emojiAnimationTimeoutIdsRef = useRef<number[]>([]);
  const [timerAnchorEl, setTimerAnchorEl] = useState<HTMLElement | null>(null);
  const [manualTimerInput, setManualTimerInput] = useState(() => String(selectedTimerSeconds));
  const [emojiFlights, setEmojiFlights] = useState<EmojiFlightAnimation[]>([]);
  const [emojiImpacts, setEmojiImpacts] = useState<EmojiImpactAnimation[]>([]);

  const showRevealButton = canRevealCurrentRound && Boolean(activeIssue) && !isRoundRevealed;
  const canRevealVotes = showRevealButton && votesCastCount > 0;
  const manualTimerSeconds = Number.parseInt(manualTimerInput, 10);
  const isManualTimerValid = Number.isFinite(manualTimerSeconds)
    && manualTimerSeconds >= 1
    && manualTimerSeconds <= 3600;

  useEffect(() => {
    setManualTimerInput(String(selectedTimerSeconds));
  }, [selectedTimerSeconds]);

  useEffect(
    () => () => {
      emojiAnimationTimeoutIdsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    },
    [],
  );

  const registerParticipantCardElement = useCallback(
    (participantId: string, element: HTMLButtonElement | null) => {
      if (element) {
        participantCardElementsRef.current.set(participantId, element);
        return;
      }

      participantCardElementsRef.current.delete(participantId);
    },
    [],
  );

  const scheduleEmojiAnimationTimeout = useCallback((callback: () => void, delayMs: number) => {
    const timeoutId = window.setTimeout(callback, delayMs);

    emojiAnimationTimeoutIdsRef.current.push(timeoutId);
  }, []);

  const triggerEmojiReactionAnimation = useCallback(
    (reaction: EmojiReactionEvent) => {
      const surfaceElement = surfaceRef.current;

      if (!surfaceElement) {
        return;
      }

      const surfaceRect = surfaceElement.getBoundingClientRect();
      const fromRect = participantCardElementsRef.current
        .get(reaction.fromParticipantId)
        ?.getBoundingClientRect();
      const toRect = participantCardElementsRef.current
        .get(reaction.toParticipantId)
        ?.getBoundingClientRect();

      const startX = fromRect
        ? fromRect.left - surfaceRect.left + fromRect.width / 2
        : surfaceRect.width * 0.5;
      const startY = fromRect
        ? fromRect.top - surfaceRect.top + fromRect.height / 2
        : surfaceRect.height * 0.7;
      const endX = toRect
        ? toRect.left - surfaceRect.left + toRect.width / 2
        : surfaceRect.width * 0.5;
      const endY = toRect
        ? toRect.top - surfaceRect.top + toRect.height / 2
        : surfaceRect.height * 0.38;

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const travelDistance = Math.hypot(deltaX, deltaY);
      const liftHeight = Math.min(160, Math.max(56, travelDistance * 0.24));

      setEmojiFlights((current) => [
        ...current,
        {
          id: reaction.animationId,
          emoji: reaction.emoji,
          startX,
          startY,
          midX: deltaX * 0.56,
          midY: deltaY * 0.42 - liftHeight,
          endX: deltaX,
          endY: deltaY,
        },
      ]);

      scheduleEmojiAnimationTimeout(() => {
        setEmojiFlights((current) => current.filter((item) => item.id !== reaction.animationId));
        setEmojiImpacts((current) => [
          ...current,
          {
            id: reaction.animationId,
            emoji: reaction.emoji,
            x: endX,
            y: endY,
          },
        ]);
      }, emojiFlightDurationMs);

      scheduleEmojiAnimationTimeout(() => {
        setEmojiImpacts((current) => current.filter((item) => item.id !== reaction.animationId));
      }, emojiFlightDurationMs + emojiImpactDurationMs);
    },
    [scheduleEmojiAnimationTimeout],
  );

  useEffect(() => {
    emojiReactionEvents.forEach((reaction) => {
      if (processedEmojiReactionIdsRef.current.has(reaction.animationId)) {
        return;
      }

      processedEmojiReactionIdsRef.current.add(reaction.animationId);
      triggerEmojiReactionAnimation(reaction);
      onConsumeEmojiReactionEvent(reaction.animationId);
    });
  }, [emojiReactionEvents, onConsumeEmojiReactionEvent, triggerEmojiReactionAnimation]);

  const handleOpenTimerMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setTimerAnchorEl(event.currentTarget);
  };

  const handleCloseTimerMenu = () => {
    setTimerAnchorEl(null);
    setManualTimerInput(String(selectedTimerSeconds));
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

  const handleSelectTimerPreset = (seconds: number) => {
    onTimerDurationChange(seconds);
    setManualTimerInput(String(seconds));
  };

  const handleStartSelectedTimer = () => {
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

  const handleResetTimer = () => {
    void onResetTimer();
    handleCloseTimerMenu();
  };

  return (
    <Box ref={surfaceRef} className={styles.tableSurface}>
      <Box className={styles.emojiReactionLayer} aria-hidden="true">
        {emojiFlights.map((flight) => {
          const flightStyle: EmojiFlightStyle = {
            left: `${flight.startX}px`,
            top: `${flight.startY}px`,
            '--emoji-flight-mid-x': `${flight.midX}px`,
            '--emoji-flight-mid-y': `${flight.midY}px`,
            '--emoji-flight-x': `${flight.endX}px`,
            '--emoji-flight-y': `${flight.endY}px`,
          };

          return (
            <Box key={flight.id} className={styles.emojiFlight} style={flightStyle}>
              <span className={styles.emojiFlightGlyph}>{flight.emoji}</span>
            </Box>
          );
        })}

        {emojiImpacts.map((impact) => (
          <Box
            key={impact.id}
            className={styles.emojiImpact}
            style={{
              left: `${impact.x}px`,
              top: `${impact.y}px`,
            }}
          >
            <span className={styles.emojiImpactCore}>{impact.emoji}</span>
            <span className={styles.emojiImpactRing} />
            <span className={[styles.emojiImpactShard, styles.emojiImpactShardOne].join(' ')}>
              {impact.emoji}
            </span>
            <span className={[styles.emojiImpactShard, styles.emojiImpactShardTwo].join(' ')}>
              {impact.emoji}
            </span>
            <span className={[styles.emojiImpactShard, styles.emojiImpactShardThree].join(' ')}>
              {impact.emoji}
            </span>
            <span className={[styles.emojiImpactShard, styles.emojiImpactShardFour].join(' ')}>
              {impact.emoji}
            </span>
          </Box>
        ))}
      </Box>

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
            enableFunFeatures={enableFunFeatures}
            isSelected={selectedParticipantId === participant.id}
            isPending={pendingParticipantActionId === participant.id}
            left={left}
            top={top}
            onRegisterCardElement={registerParticipantCardElement}
            onParticipantSelect={onParticipantSelect}
            onRemoveParticipant={onRemoveParticipant}
            onTransferMaster={onTransferMaster}
            onSendEmojiReaction={onSendEmojiReaction}
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
              enableFunFeatures={enableFunFeatures}
              isSelected={selectedParticipantId === participant.id}
              isPending={pendingParticipantActionId === participant.id}
              compact
              onRegisterCardElement={registerParticipantCardElement}
              onParticipantSelect={onParticipantSelect}
              onRemoveParticipant={onRemoveParticipant}
              onTransferMaster={onTransferMaster}
              onSendEmojiReaction={onSendEmojiReaction}
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
        MenuListProps={{ disablePadding: true, className: styles.timerMenuList }}
        PaperProps={{ className: styles.timerMenuPaper }}
      >
        {timerOptions.map((seconds) => (
          <MenuItem
            key={seconds}
            selected={seconds === selectedTimerSeconds}
            onClick={() => handleSelectTimerPreset(seconds)}
            disabled={isTimerPending}
            className={styles.timerMenuItem}
          >
            {formatTimerOptionLabel(seconds)}
          </MenuItem>
        ))}

        <Divider className={styles.timerMenuDivider} />

        <Box className={styles.timerMenuContent} onClick={(event) => event.stopPropagation()}>
          <Typography className={styles.timerMenuLabel}>
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
            className={styles.timerMenuField}
          />

          <Stack className={styles.timerMenuActionRow} direction="row" spacing={1}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleStartSelectedTimer}
              disabled={!activeIssue || isRoundRevealed || isTimerPending || !isManualTimerValid}
              className={styles.timerMenuPrimaryButton}
            >
              Запустити
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleStopTimer}
              disabled={!isTimerActive || isTimerPending}
              className={styles.timerMenuSecondaryButton}
            >
              Пауза
            </Button>
          </Stack>

          <Button
            variant="text"
            onClick={handleResetTimer}
            disabled={(!hasTimerState && !hasPausedTimer) || isTimerPending}
            className={styles.timerMenuRestartButton}
          >
            Скинути
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};
