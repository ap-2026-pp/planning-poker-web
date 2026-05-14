import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useGameRoomRealtime } from './use-game-room-realtime';

import { IssuesPolicy, RevealPolicy, type Game, type GameInvite, type RoomState } from '@entities/game';
import type { VoteResult, VotingHistoryItem } from '@entities/history';
import { IssueStatus, type ImportPlaneIssuesPayload, type Issue } from '@entities/issue';
import { ParticipantRole, type GameParticipant } from '@entities/participant';
import {
  createVoteRequest,
  createIssueRequest,
  deleteVoteRequest,
  deleteGameParticipantRequest,
  deleteIssueRequest,
  exportIssuesToCsvRequest,
  getGameInviteRequest,
  getGameRequest,
  getIssuesRequest,
  getParticipantsRequest,
  getRoomStateRequest,
  getVotingHistoryRequest,
  importPlaneIssuesRequest,
  leaveGameRequest,
  revealCardsRequest,
  resetRoundRequest,
  reorderIssuesRequest,
  startTimerRequest,
  setIssueActiveRequest,
  setSpectatorModeRequest,
  stopTimerRequest,
  transferMasterRequest,
  updateDisplayNameRequest,
  updateIssueRequest,
} from '@shared/api';
import {
  clearCurrentRoomParticipantSession,
  clearGuestAccessToken,
  getCurrentRoomParticipantSession,
  setCurrentRoomParticipantSession,
  useSession,
} from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import { useGameRoomShell } from '@shared/lib';
import {
  getGameRoomDeck,
  getGameRoomVotingLabel,
  getRoundLabel,
  isParticipantOnline,
  sortParticipants,
  sortSidebarParticipants,
  type CopiedItem,
  type SidebarView,
} from './game-room';
import {
  applyGameRoomParticipantUpdate,
  removeGameRoomParticipant,
  upsertGameRoomParticipant,
} from './game-room-realtime';
import {
  getParticipantPositions,
  getParticipantVisibilityLimit,
} from './participant-layout';

type RoomNotification = {
  message: string;
  tone: 'info' | 'success' | 'warning';
};

type ResultDialogData = {
  issueId: string;
  issueName: string;
  issueCode?: string | null;
  roundResult: NonNullable<RoomState['result']>;
  playerResults: VoteResult[];
};

type ResultDialogState = {
  open: boolean;
  loading: boolean;
  error: string | null;
  data: ResultDialogData | null;
};

type PendingRevealState = {
  roomState: RoomState;
  participants?: GameParticipant[];
};

const applyRoomStateToParticipants = (
  currentParticipants: GameParticipant[],
  roomState: RoomState | null,
) => {
  if (!roomState) {
    return currentParticipants.map((participant) => ({
      ...participant,
      hasVoted: false,
      voteValue: null,
    }));
  }

  const voteStatusByParticipantId = new Map(
    roomState.participants.map((participant) => [participant.participantId, participant]),
  );

  return currentParticipants.map((participant) => {
    const voteStatus = voteStatusByParticipantId.get(participant.id);

    return {
      ...participant,
      hasVoted: voteStatus?.hasVoted ?? false,
      voteValue: voteStatus?.voteValue ?? null,
    };
  });
};

const applyRoomStateToIssues = (
  currentIssues: Issue[],
  roomState: RoomState | null,
) => {
  if (!roomState) {
    return currentIssues;
  }

  const activeIssue = roomState.activeIssue;

  return currentIssues.map((issue) => {
    const isCurrent = activeIssue ? issue.id === activeIssue.id : false;
    const previousFinalEstimate = issue.finalEstimate ?? null;
    const nextFinalEstimate = isCurrent
      ? roomState.result?.finalEstimate ?? activeIssue?.finalEstimate ?? previousFinalEstimate
      : previousFinalEstimate;

    const isCompleted = Boolean(nextFinalEstimate);

    if (!isCurrent) {
      return {
        ...issue,
        isCurrent: false,
        finalEstimate: nextFinalEstimate,
        status: isCompleted ? IssueStatus.Completed : IssueStatus.Pending,
      };
    }

    return {
      ...issue,
      ...activeIssue,
      isCurrent: true,
      finalEstimate: nextFinalEstimate,
      status: isCompleted ? IssueStatus.Completed : IssueStatus.Voting,
    };
  });
};

const applyOptimisticIssueActivation = (
  currentIssues: Issue[],
  issueId: string,
  shouldActivate: boolean,
) => {
  return currentIssues.map((issue) => {
    const isTargetIssue = issue.id === issueId;
    const isCompleted = Boolean(issue.finalEstimate);

    if (isTargetIssue) {
      return {
        ...issue,
        isCurrent: shouldActivate,
        status: shouldActivate
          ? IssueStatus.Voting
          : isCompleted
            ? IssueStatus.Completed
            : IssueStatus.Pending,
      };
    }

    return {
      ...issue,
      isCurrent: false,
      status: isCompleted ? IssueStatus.Completed : IssueStatus.Pending,
    };
  });
};

const buildCurrentRoundResultData = (
  issue: Issue,
  roomState: RoomState,
): ResultDialogData | null => {
  if (!roomState.result) {
    return null;
  }

  const playerResults = roomState.participants
    .filter((participant) => Boolean(participant.voteValue))
    .map((participant) => ({
      participantId: participant.participantId,
      displayName: participant.displayName,
      voteValue: participant.voteValue ?? '',
    }));

  return {
    issueId: issue.id,
    issueName: issue.title,
    issueCode: issue.code,
    roundResult: roomState.result,
    playerResults,
  };
};

const buildHistoryResultData = (
  issue: Issue,
  historyItem: VotingHistoryItem,
): ResultDialogData => ({
  issueId: issue.id,
  issueName: issue.title,
  issueCode: issue.code,
  roundResult: {
    finalEstimate: historyItem.result ?? issue.finalEstimate ?? '—',
    average: historyItem.average ?? null,
    agreement: historyItem.agreementPercent,
  },
  playerResults: historyItem.votingResults ?? [],
});

const formatTimerLabel = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const remainingSeconds = (safeSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${remainingSeconds}`;
};

const minTimerSeconds = 1;
const maxTimerSeconds = 3600;
const timerDurationPresets = [30, 60, 120, 300] as const;

const clampTimerSeconds = (seconds: number) =>
  Math.min(maxTimerSeconds, Math.max(minTimerSeconds, Math.round(seconds)));

export const useGameRoomPage = () => {
  const { gameId = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSession();

  const from = (location.state as { from?: string } | null)?.from;

  const {
    setRoomTitle,
    setRoomParticipant,
    isSidebarOpen,
    closeSidebar,
    isInviteDialogOpen,
    closeInviteDialog,
    setLeaveRoom,
    setRenameRoomParticipant,
    setToggleRoomParticipantSpectatorMode,
  } = useGameRoomShell();

  const [game, setGame] = useState<Game | null>(null);
  const [participants, setParticipants] = useState<GameParticipant[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [invite, setInvite] = useState<GameInvite | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarView, setSidebarView] = useState<SidebarView>('issues');
  const [isQrDialogOpen, setQrDialogOpen] = useState(false);
  const [copiedItem, setCopiedItem] = useState<CopiedItem>(null);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [pendingParticipantActionId, setPendingParticipantActionId] = useState<string | null>(null);
  const [notification, setNotification] = useState<RoomNotification | null>(null);
  const [voteSubmitting, setVoteSubmitting] = useState(false);
  const [revealSubmitting, setRevealSubmitting] = useState(false);
  const [timerSubmitting, setTimerSubmitting] = useState(false);
  const [resetRoundSubmitting, setResetRoundSubmitting] = useState(false);
  const [nextIssueSubmitting, setNextIssueSubmitting] = useState(false);
  const [voteOverride, setVoteOverride] = useState<string | null | undefined>(undefined);
  const [selectedTimerSeconds, setSelectedTimerSeconds] = useState<number | null>(null);
  const [revealCountdown, setRevealCountdown] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [historyResults, setHistoryResults] = useState<VotingHistoryItem[] | null>(null);
  const [cachedIssueResults, setCachedIssueResults] = useState<Record<string, ResultDialogData>>({});
  const [resultDialog, setResultDialog] = useState<ResultDialogState>({
    open: false,
    loading: false,
    error: null,
    data: null,
  });

  const resetCopiedTimeoutRef = useRef<number | null>(null);
  const currentParticipantIdRef = useRef<string | null>(null);
  const participantsRef = useRef<GameParticipant[]>([]);
  const issuesRef = useRef<Issue[]>([]);
  const roomStateRef = useRef<RoomState | null>(null);
  const gameRef = useRef<Game | null>(null);
  const pendingRevealStateRef = useRef<PendingRevealState | null>(null);
  const previousRevealedIssueIdRef = useRef<string | null>(null);
  const roundStateReloadPromiseRef = useRef<Promise<RoomState> | null>(null);
  const autoRevealTriggerRef = useRef<string | null>(null);
  const suppressResultDialogRef = useRef(false);
  const timerExpiredAnnouncementRef = useRef<string | null>(null);

  const storedParticipantSession = getCurrentRoomParticipantSession();

  const commitRoundState = useCallback(
    (nextRoomState: RoomState | null, nextParticipants?: GameParticipant[]) => {
      roomStateRef.current = nextRoomState;
      setRoomState(nextRoomState);

      setIssues((current) => applyRoomStateToIssues(current, nextRoomState));

      if (nextParticipants) {
        setParticipants(applyRoomStateToParticipants(nextParticipants, nextRoomState));
        return;
      }

      setParticipants((current) => applyRoomStateToParticipants(current, nextRoomState));
    },
    [],
  );

  const clearPendingReveal = useCallback(() => {
    pendingRevealStateRef.current = null;
    setRevealCountdown(null);
  }, []);

  const finalizePendingReveal = useCallback(() => {
    const pendingReveal = pendingRevealStateRef.current;

    pendingRevealStateRef.current = null;
    setRevealCountdown(null);

    if (!pendingReveal) {
      return;
    }

    commitRoundState(pendingReveal.roomState, pendingReveal.participants);
  }, [commitRoundState]);

  const applyRoundState = useCallback(
    (nextRoomState: RoomState | null, nextParticipants?: GameParticipant[]) => {
      if (!nextRoomState) {
        clearPendingReveal();
        commitRoundState(null, nextParticipants);
        return;
      }

      const currentVisibleRoomState = roomStateRef.current;
      const shouldAnimateReveal = Boolean(
        gameRef.current?.showCountdownAnimation &&
        nextRoomState.isRevealed &&
        nextRoomState.result &&
        nextRoomState.activeIssue?.id &&
        currentVisibleRoomState?.activeIssue?.id === nextRoomState.activeIssue.id &&
        !currentVisibleRoomState?.isRevealed,
      );

      if (shouldAnimateReveal) {
        pendingRevealStateRef.current = {
          roomState: nextRoomState,
          participants: nextParticipants,
        };
        setRevealCountdown((current) => current ?? 3);
        return;
      }

      clearPendingReveal();
      commitRoundState(nextRoomState, nextParticipants);
    },
    [clearPendingReveal, commitRoundState],
  );

  const reloadRoundState = useCallback(async () => {
    const nextRoomState = await getRoomStateRequest(gameId);

    applyRoundState(nextRoomState);

    return nextRoomState;
  }, [applyRoundState, gameId]);

  const syncRoundState = useCallback(async () => {
    if (roundStateReloadPromiseRef.current) {
      return roundStateReloadPromiseRef.current;
    }

    const nextPromise = reloadRoundState().finally(() => {
      roundStateReloadPromiseRef.current = null;
    });

    roundStateReloadPromiseRef.current = nextPromise;

    return nextPromise;
  }, [reloadRoundState]);

  const reloadRoom = useCallback(async () => {
    setLoading(true);
    setError(null);

    const results = await Promise.allSettled([
      getGameRequest(gameId),
      getParticipantsRequest(gameId),
      getIssuesRequest(gameId),
      getGameInviteRequest(gameId),
      getRoomStateRequest(gameId),
    ]);

    const [gameResult, participantsResult, issuesResult, inviteResult, roomStateResult] = results;

    if (gameResult.status === 'fulfilled') {
      gameRef.current = gameResult.value;
      setGame(gameResult.value);
    }

    if (participantsResult.status === 'fulfilled') {
      applyRoundState(
        roomStateResult.status === 'fulfilled' ? roomStateResult.value : null,
        participantsResult.value,
      );
    } else if (roomStateResult.status === 'fulfilled') {
      applyRoundState(roomStateResult.value);
    }

    if (issuesResult.status === 'fulfilled') {
      setIssues(
        applyRoomStateToIssues(
          issuesResult.value,
          roomStateResult.status === 'fulfilled' ? roomStateResult.value : null,
        ),
      );
    }

    if (inviteResult.status === 'fulfilled') {
      setInvite(inviteResult.value);
    }

    const firstFailure = results.find((result) => result.status === 'rejected');

    if (firstFailure?.status === 'rejected') {
      setError(
        firstFailure.reason instanceof Error
          ? firstFailure.reason.message
          : 'Не вдалося завантажити кімнату',
      );
    }

    setLoading(false);
  }, [applyRoundState, gameId]);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    const syncLayout = () => {
      setIsMobileLayout(window.innerWidth <= 640);
    };

    syncLayout();
    window.addEventListener('resize', syncLayout);

    return () => {
      window.removeEventListener('resize', syncLayout);
    };
  }, []);

  useEffect(() => {
    void reloadRoom();
  }, [reloadRoom]);

  useEffect(() => {
    const timerEndsAt = roomState?.timer?.endsAt;

    if (!timerEndsAt) {
      return;
    }

    setNowMs(Date.now());

    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [roomState?.timer?.endsAt]);

  useEffect(() => {
    if (revealCountdown === null) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (revealCountdown <= 1) {
        finalizePendingReveal();
        return;
      }

      setRevealCountdown(revealCountdown - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [finalizePendingReveal, revealCountdown]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      void syncRoundState().catch(() => {
        // Visibility sync is best-effort and should not disrupt the room.
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncRoundState]);

  useEffect(() => {
    setRoomTitle(game?.name || 'Кімната гри');
  }, [game?.name, setRoomTitle]);

  useEffect(
    () => () => {
      setRoomTitle('Кімната гри');
    },
    [setRoomTitle],
  );

  useEffect(() => {
    setLeaveRoom(async () => {
      try {
        await leaveGameRequest(gameId);
        setQrDialogOpen(false);
        closeSidebar();
        closeInviteDialog();
        await navigate(from || appRoutes.home, { replace: true });
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Не вдалося вийти з гри');
      }
    });

    return () => {
      setLeaveRoom(null);
    };
  }, [closeInviteDialog, closeSidebar, from, gameId, navigate, setLeaveRoom]);

  useEffect(
    () => () => {
      if (resetCopiedTimeoutRef.current !== null) {
        window.clearTimeout(resetCopiedTimeoutRef.current);
      }
    },
    [],
  );

  const sortedIssues = useMemo(
    () =>
      [...issues]
        .filter((issue) => !issue.isRemoved)
        .sort((left, right) => left.order - right.order),
    [issues],
  );

  const sortedParticipants = useMemo(
    () => [...participants].sort(sortParticipants),
    [participants],
  );

  const currentParticipant = useMemo(() => {
    const storedParticipantId =
      storedParticipantSession?.gameId === gameId ? storedParticipantSession.participantId : null;

    if (storedParticipantId) {
      const storedParticipant = sortedParticipants.find(
        (participant) => participant.id === storedParticipantId,
      );

      if (storedParticipant) {
        return storedParticipant;
      }
    }

    if (user?.id) {
      return sortedParticipants.find((participant) => participant.userId === user.id) ?? null;
    }

    return null;
  }, [
    gameId,
    sortedParticipants,
    storedParticipantSession?.gameId,
    storedParticipantSession?.participantId,
    user?.id,
  ]);

  const sidebarParticipants = useMemo(
    () => sortSidebarParticipants(sortedParticipants, currentParticipant?.id ?? null),
    [sortedParticipants, currentParticipant?.id],
  );

  const onlineParticipants = useMemo(
    () => sortedParticipants.filter(isParticipantOnline),
    [sortedParticipants],
  );

  const positionedParticipants = useMemo(
    () => getParticipantPositions(onlineParticipants, isMobileLayout),
    [isMobileLayout, onlineParticipants],
  );

  const overflowParticipants = useMemo(
    () => onlineParticipants.slice(getParticipantVisibilityLimit(isMobileLayout)),
    [isMobileLayout, onlineParticipants],
  );

  const isCurrentParticipantMaster = currentParticipant?.role === ParticipantRole.Master;

  const canRevealCards = Boolean(
    currentParticipant &&
    currentParticipant.role !== ParticipantRole.Spectator &&
    (currentParticipant.role === ParticipantRole.Master ||
      game?.revealPolicy === RevealPolicy.Everyone ||
      (game?.revealPolicy === RevealPolicy.SpecificParticipants &&
        currentParticipant.canRevealCards)),
  );

  const canManageIssues = Boolean(
    currentParticipant &&
    currentParticipant.role !== ParticipantRole.Spectator &&
    (currentParticipant.role === ParticipantRole.Master ||
      game?.issuesPolicy === IssuesPolicy.Everyone ||
      (game?.issuesPolicy === IssuesPolicy.SpecificParticipants &&
        currentParticipant.canManageIssues)),
  );

  const inviteCode = invite?.inviteCode || game?.inviteCode || '—';
  const inviteUrl = invite?.inviteUrl || '';
  const qrCodeImage = invite?.qrCodeBase64
    ? `data:image/png;base64,${invite.qrCodeBase64}`
    : '';

  const activeIssueIndex = sortedIssues.findIndex((issue) => issue.isCurrent);
  const activeIssue = activeIssueIndex >= 0 ? sortedIssues[activeIssueIndex] : null;
  const resolvedActiveIssue = roomState?.activeIssue ?? activeIssue;
  const nextIssue = useMemo(() => {
    if (!resolvedActiveIssue) {
      return null;
    }

    const currentIssueIndex = sortedIssues.findIndex((issue) => issue.id === resolvedActiveIssue.id);

    if (currentIssueIndex < 0) {
      return null;
    }

    return sortedIssues[currentIssueIndex + 1] ?? null;
  }, [resolvedActiveIssue, sortedIssues]);
  const roundLabel = getRoundLabel(sortedIssues, activeIssueIndex);

  const votingSystemLabel = getGameRoomVotingLabel(game?.votingSystem);
  const defaultTimerSeconds = Math.max(30, (game?.defaultTimerMinutes ?? 1) * 60);
  const timerOptions = useMemo(() => {
    return [
      ...new Set([
        ...timerDurationPresets,
        defaultTimerSeconds,
        ...(selectedTimerSeconds !== null ? [selectedTimerSeconds] : []),
      ]),
    ].sort((left, right) => left - right);
  }, [defaultTimerSeconds, selectedTimerSeconds]);
  const preferredTimerSeconds = selectedTimerSeconds ?? defaultTimerSeconds;

  const deckValues = getGameRoomDeck(
    game?.votingSystem,
    game?.customValues
      ?.split(',')
      .map((card) => card.trim())
      .filter(Boolean) ?? null,
    roomState?.availableCards ?? null,
  );
  const timerEndsAtMs = roomState?.timer?.endsAt
    ? new Date(roomState.timer.endsAt).getTime()
    : null;
  const timerRemainingSeconds = timerEndsAtMs !== null
    ? Math.max(0, Math.ceil((timerEndsAtMs - nowMs) / 1000))
    : null;
  const isTimerExpiredLocally = Boolean(
    roomState?.timer &&
    (roomState.timer.isExpired || timerRemainingSeconds === 0),
  );
  const isTimerActive = Boolean(roomState?.timer && !isTimerExpiredLocally);
  const timerLabel = roomState?.timer
    ? formatTimerLabel(timerRemainingSeconds ?? 0)
    : resolvedActiveIssue && preferredTimerSeconds > 0
      ? formatTimerLabel(preferredTimerSeconds)
      : 'Таймер';
  const autoRevealEnabled = roomState?.autoRevealEnabled ?? game?.autoRevealCards ?? false;
  const isRevealPending = revealCountdown !== null;
  const everyoneVoted = Boolean(
    roomState &&
    roomState.totalPlayers > 0 &&
    roomState.votedCount > 0 &&
    roomState.votedCount >= roomState.totalPlayers,
  );
  const canManageIssuesInRound = roomState?.canManage ?? canManageIssues;
  const roundResult = roomState?.result ?? null;
  const isRoundRevealed = roomState?.isRevealed ?? false;
  const canRevealCurrentRound = Boolean(
    resolvedActiveIssue &&
    canRevealCards &&
    !isRoundRevealed &&
    !isRevealPending,
  );
  const timerExpiredWithoutAutoReveal = Boolean(
    resolvedActiveIssue &&
    roomState?.timer &&
    isTimerExpiredLocally &&
    !isRoundRevealed &&
    !autoRevealEnabled,
  );
  const canVoteInRound = Boolean(
    currentParticipant &&
    currentParticipant.role !== ParticipantRole.Spectator &&
    resolvedActiveIssue &&
    !isRoundRevealed &&
    !isRevealPending &&
    !revealSubmitting &&
    !isTimerExpiredLocally,
  );
  const currentVoteValue = voteOverride !== undefined ? voteOverride : roomState?.myVote ?? null;
  const votesCastCount = roomState?.votedCount ?? participants.filter((participant) => participant.hasVoted).length;
  const canResetCurrentRound = isRoundRevealed && Boolean(isCurrentParticipantMaster && resolvedActiveIssue);
  const canGoToNextIssue = isRoundRevealed && canManageIssuesInRound && Boolean(nextIssue);
  const currentRoundResultData = useMemo(
    () => (
      resolvedActiveIssue && roomState
        ? buildCurrentRoundResultData(resolvedActiveIssue, roomState)
        : null
    ),
    [resolvedActiveIssue, roomState],
  );
  const viewableIssueResultIds = useMemo(() => {
    const ids = new Set(Object.keys(cachedIssueResults));

    if (currentRoundResultData) {
      ids.add(currentRoundResultData.issueId);
    }

    if (isCurrentParticipantMaster) {
      sortedIssues
        .filter((issue) => Boolean(issue.finalEstimate))
        .forEach((issue) => ids.add(issue.id));
    }

    return [...ids];
  }, [cachedIssueResults, currentRoundResultData, isCurrentParticipantMaster, sortedIssues]);

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  useEffect(() => {
    issuesRef.current = issues;
  }, [issues]);

  useEffect(() => {
    if (selectedTimerSeconds !== null) {
      return;
    }

    setSelectedTimerSeconds(defaultTimerSeconds);
  }, [defaultTimerSeconds, selectedTimerSeconds]);

  useEffect(() => {
    if (voteOverride === undefined) {
      return;
    }

    if ((roomState?.myVote ?? null) === (voteOverride ?? null)) {
      setVoteOverride(undefined);
    }
  }, [roomState?.myVote, voteOverride]);

  useEffect(() => {
    setVoteOverride(undefined);
  }, [roomState?.activeIssue?.id, roomState?.isRevealed]);

  useEffect(() => {
    if (isRoundRevealed || !resolvedActiveIssue) {
      autoRevealTriggerRef.current = null;
    }
  }, [isRoundRevealed, resolvedActiveIssue?.id]);

  useEffect(() => {
    const timerEndsAt = roomState?.timer?.endsAt;

    if (!timerExpiredWithoutAutoReveal || !resolvedActiveIssue || !timerEndsAt) {
      timerExpiredAnnouncementRef.current = null;
      return;
    }

    const announcementKey = `${resolvedActiveIssue.id}:${timerEndsAt}`;

    if (timerExpiredAnnouncementRef.current === announcementKey) {
      return;
    }

    timerExpiredAnnouncementRef.current = announcementKey;
    setNotification({
      message: 'Час вийшов. Можна відкрити карти або запустити таймер знову.',
      tone: 'warning',
    });

    if (!('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      'Час вийшов. Можна відкривати карти або запустити таймер знову.',
    );

    utterance.lang = 'uk-UA';
    window.speechSynthesis.speak(utterance);
  }, [resolvedActiveIssue?.id, roomState?.timer?.endsAt, timerExpiredWithoutAutoReveal]);

  useEffect(() => {
    if (!currentRoundResultData) {
      previousRevealedIssueIdRef.current = null;
      return;
    }

    setCachedIssueResults((current) => ({
      ...current,
      [currentRoundResultData.issueId]: currentRoundResultData,
    }));

    if (previousRevealedIssueIdRef.current !== currentRoundResultData.issueId) {
      previousRevealedIssueIdRef.current = currentRoundResultData.issueId;

      if (!suppressResultDialogRef.current) {
        setResultDialog({
          open: true,
          loading: false,
          error: null,
          data: currentRoundResultData,
        });
      }
    }
  }, [currentRoundResultData]);

  useEffect(() => {
    if (
      selectedParticipantId &&
      !participants.some((participant) => participant.id === selectedParticipantId)
    ) {
      setSelectedParticipantId(null);
    }
  }, [participants, selectedParticipantId]);

  useEffect(() => {
    const storedParticipantId =
      storedParticipantSession?.gameId === gameId ? storedParticipantSession.participantId : null;

    currentParticipantIdRef.current = currentParticipant?.id ?? storedParticipantId ?? null;
  }, [
    currentParticipant?.id,
    gameId,
    storedParticipantSession?.gameId,
    storedParticipantSession?.participantId,
  ]);

  useEffect(() => {
    if (!currentParticipant) {
      setRoomParticipant(null);
      return;
    }

    setCurrentRoomParticipantSession(gameId, currentParticipant.id);

    setRoomParticipant({
      displayName: currentParticipant.displayName,
      isMaster: currentParticipant.role === ParticipantRole.Master,
      isSpectator: currentParticipant.role === ParticipantRole.Spectator,
    });
  }, [currentParticipant, gameId, setRoomParticipant]);

  useEffect(
    () => () => {
      setRoomParticipant(null);
    },
    [setRoomParticipant],
  );

  useEffect(() => {
    setRenameRoomParticipant(async (displayName) => {
      const updatedParticipant = await updateDisplayNameRequest(gameId, displayName.trim());

      setParticipants((current) =>
        current.map((participant) =>
          participant.id === updatedParticipant.id ? updatedParticipant : participant,
        ),
      );

      setCurrentRoomParticipantSession(gameId, updatedParticipant.id);
    });

    return () => {
      setRenameRoomParticipant(null);
    };
  }, [gameId, setRenameRoomParticipant]);

  useEffect(() => {
    setToggleRoomParticipantSpectatorMode(async (isSpectator) => {
      await setSpectatorModeRequest(gameId, isSpectator);
      const [nextParticipants, nextRoomState] = await Promise.all([
        getParticipantsRequest(gameId),
        getRoomStateRequest(gameId),
      ]);

      applyRoundState(nextRoomState, nextParticipants);
    });

    return () => {
      setToggleRoomParticipantSpectatorMode(null);
    };
  }, [applyRoundState, gameId, setToggleRoomParticipantSpectatorMode]);

  const setCopiedState = (nextValue: CopiedItem) => {
    setCopiedItem(nextValue);

    if (resetCopiedTimeoutRef.current !== null) {
      window.clearTimeout(resetCopiedTimeoutRef.current);
    }

    if (nextValue) {
      resetCopiedTimeoutRef.current = window.setTimeout(() => {
        setCopiedItem(null);
      }, 1800);
    }
  };

  const copyText = async (value: string, target: Exclude<CopiedItem, null>) => {
    if (!value || value === '—') {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopiedState(target);
    } catch {
      setCopiedItem(null);
    }
  };

  const handleParticipantJoined = useCallback((participant: GameParticipant) => {
    setParticipants((current) => upsertGameRoomParticipant(current, participant));

    setNotification({
      message: `${participant.displayName} приєднався(-лася) до кімнати`,
      tone: 'success',
    });
  }, []);

  const handleUserUpdated = useCallback((participant: GameParticipant) => {
    const previousParticipant = participantsRef.current.find(
      (entry) => entry.id === participant.id,
    );

    setParticipants((current) => applyGameRoomParticipantUpdate(current, participant));

    if (!previousParticipant) {
      return;
    }

    if (
      participant.role === ParticipantRole.Master &&
      previousParticipant.role !== ParticipantRole.Master
    ) {
      setNotification({
        message: `${participant.displayName} тепер керує кімнатою`,
        tone: 'info',
      });

      return;
    }

    if (previousParticipant.displayName !== participant.displayName) {
      setNotification({
        message: `${participant.displayName} змінив(ла) своє імʼя`,
        tone: 'info',
      });
    }
  }, []);

  const handleParticipantRemoved = useCallback(
    (participantId: string, reason: 'left' | 'kicked') => {
      const participant = participantsRef.current.find((entry) => entry.id === participantId);

      setParticipants((current) => {
        const remainingParticipants = removeGameRoomParticipant(current, participantId);

        const expectedCurrentParticipantId =
          currentParticipantIdRef.current ??
          (storedParticipantSession?.gameId === gameId
            ? storedParticipantSession.participantId
            : null);

        const hasCurrentParticipant =
          (expectedCurrentParticipantId
            ? remainingParticipants.some((entry) => entry.id === expectedCurrentParticipantId)
            : false) ||
          (user?.id
            ? remainingParticipants.some((entry) => entry.userId === user.id)
            : false);

        if (!hasCurrentParticipant) {
          clearCurrentRoomParticipantSession();
          clearGuestAccessToken();
          setQrDialogOpen(false);
          closeSidebar();
          closeInviteDialog();
          void navigate(appRoutes.home, { replace: true });
        }

        return remainingParticipants;
      });

      setSelectedParticipantId((current) => (current === participantId ? null : current));

      if (participant) {
        setNotification({
          message:
            reason === 'kicked'
              ? `${participant.displayName} був(ла) видалений(а) з кімнати`
              : `${participant.displayName} покинув(-ла) кімнату`,
          tone: reason === 'kicked' ? 'warning' : 'info',
        });
      }
    },
    [
      closeInviteDialog,
      closeSidebar,
      gameId,
      navigate,
      storedParticipantSession?.gameId,
      storedParticipantSession?.participantId,
      user?.id,
    ],
  );

  const handleRealtimeParticipantLeft = useCallback(
    (participantId: string) => {
      handleParticipantRemoved(participantId, 'left');
    },
    [handleParticipantRemoved],
  );

  const handleRealtimeParticipantKicked = useCallback(
    (participantId: string) => {
      handleParticipantRemoved(participantId, 'kicked');
    },
    [handleParticipantRemoved],
  );

  const handleGameUpdated = useCallback(
    async (updatedGame: Game | string) => {
      const nextGame = typeof updatedGame === 'string'
        ? await getGameRequest(gameId).catch(() => null)
        : updatedGame;

      if (nextGame) {
        gameRef.current = nextGame;
        setGame(nextGame);
      }

      if (nextGame && !nextGame.isActive) {
        clearCurrentRoomParticipantSession();
        clearGuestAccessToken();

        setQrDialogOpen(false);
        closeSidebar();
        closeInviteDialog();

        setNotification({
          message: 'Гру завершено. Кімната більше неактивна.',
          tone: 'warning',
        });

        void navigate(appRoutes.home, { replace: true });
        return;
      }

      await syncRoundState().catch(() => {
        // Game settings changed but room sync can safely fail without blocking the UI.
      });

      setNotification({
        message: 'Налаштування гри оновлено',
        tone: 'success',
      });
    },
    [closeInviteDialog, closeSidebar, gameId, navigate, syncRoundState],
  );

  const handleIssueCreated = useCallback((issue: Issue) => {
    setIssues((current) => {
      const exists = current.some((entry) => entry.id === issue.id);
      const nextIssues = exists
        ? current.map((entry) => (entry.id === issue.id ? issue : entry))
        : [...current, issue];

      return applyRoomStateToIssues(nextIssues, roomState);
    });
  }, [roomState]);

  const handleIssueUpdated = useCallback((issue: Issue) => {
    const previousIssue = issuesRef.current.find((entry) => entry.id === issue.id);
    const shouldReloadRoundState = Boolean(
      issue.isCurrent ||
      previousIssue?.isCurrent ||
      roomStateRef.current?.activeIssue?.id === issue.id,
    );

    setIssues((current) => {
      if (issue.isRemoved) {
        return current.filter((entry) => entry.id !== issue.id);
      }

      const exists = current.some((entry) => entry.id === issue.id);

      if (!exists) {
        return applyRoomStateToIssues([...current, issue], roomStateRef.current);
      }

      return applyRoomStateToIssues(
        current.map((entry) => (entry.id === issue.id ? { ...entry, ...issue } : entry)),
        roomStateRef.current,
      );
    });

    if (shouldReloadRoundState) {
      void syncRoundState().catch(() => {
        // Issue updates may change the active round and should resync when possible.
      });
    }
  }, [applyRoundState, syncRoundState]);

  const handleIssuesImported = useCallback((importedIssues: Issue[]) => {
    setIssues(
      applyRoomStateToIssues(
        [...importedIssues]
          .filter((issue) => !issue.isRemoved)
          .sort((left, right) => left.order - right.order),
        roomState,
      ),
    );

    setNotification({
      message: 'Issues з Plane імпортовано',
      tone: 'success',
    });
  }, [roomState]);

  const handleRealtimeRoundStateUpdated = useCallback(async () => {
    await syncRoundState();
  }, [syncRoundState]);

  const realtime = useGameRoomRealtime({
    gameId,
    onParticipantJoined: handleParticipantJoined,
    onParticipantLeft: handleRealtimeParticipantLeft,
    onParticipantKicked: handleRealtimeParticipantKicked,
    onUserUpdated: handleUserUpdated,
    onGameUpdated: handleGameUpdated,
    onIssueCreated: handleIssueCreated,
    onIssueUpdated: handleIssueUpdated,
    onIssuesImported: handleIssuesImported,
    onRoundStateUpdated: handleRealtimeRoundStateUpdated,
    onReconnected: reloadRoom,
  });

  const selectParticipant = useCallback((participantId: string) => {
    setSelectedParticipantId((current) => (current === participantId ? null : participantId));
  }, []);

  const removeParticipant = useCallback(
    async (participantId: string) => {
      setPendingParticipantActionId(participantId);

      try {
        await deleteGameParticipantRequest(gameId, participantId);
        setSelectedParticipantId(null);
      } catch (requestError) {
        setError(
          requestError instanceof Error ? requestError.message : 'Не вдалося видалити учасника',
        );
      } finally {
        setPendingParticipantActionId(null);
      }
    },
    [gameId],
  );

  const transferMaster = useCallback(
    async (participantId: string) => {
      setPendingParticipantActionId(participantId);

      try {
        await transferMasterRequest(gameId, participantId);
        setSelectedParticipantId(null);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Не вдалося передати права master',
        );
      } finally {
        setPendingParticipantActionId(null);
      }
    },
    [gameId],
  );

  const submitVote = useCallback(
    async (nextVoteValue: string | null) => {
      const currentIssueId = roomState?.activeIssue?.id ?? resolvedActiveIssue?.id;

      if (!currentIssueId) {
        return;
      }

      setVoteSubmitting(true);
      setVoteOverride(nextVoteValue);

      try {
        if (nextVoteValue) {
          await createVoteRequest(gameId, currentIssueId, {
            estimate: nextVoteValue,
          });
        } else {
          await deleteVoteRequest(gameId, currentIssueId);
        }
      } catch (requestError) {
        setVoteOverride(undefined);
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Не вдалося оновити голос',
        );

        throw requestError;
      } finally {
        setVoteSubmitting(false);
      }
    },
    [gameId, resolvedActiveIssue?.id, roomState?.activeIssue?.id],
  );

  const revealVotes = useCallback(async () => {
    setRevealSubmitting(true);

    try {
      const nextRoomState = await revealCardsRequest(gameId);

      applyRoundState(nextRoomState);

      setNotification({
        message: 'Карти відкрито',
        tone: 'success',
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Не вдалося відкрити карти',
      );

      throw requestError;
    } finally {
      setRevealSubmitting(false);
    }
  }, [applyRoundState, gameId]);

  const updateTimerDurationSelection = useCallback((durationSeconds: number) => {
    setSelectedTimerSeconds(clampTimerSeconds(durationSeconds));
  }, []);

  const startRoundTimer = useCallback(async (durationSeconds: number) => {
    if (!isCurrentParticipantMaster || !resolvedActiveIssue || isRoundRevealed) {
      return;
    }

    setTimerSubmitting(true);

    try {
      const nextDurationSeconds = clampTimerSeconds(durationSeconds);
      const nextTimer = await startTimerRequest(gameId, {
        durationSeconds: nextDurationSeconds,
      });
      const currentRoomState = roomStateRef.current;

      setSelectedTimerSeconds(nextDurationSeconds);
      setNowMs(Date.now());

      if (currentRoomState) {
        const nextRoomState = {
          ...currentRoomState,
          timer: nextTimer,
        };

        roomStateRef.current = nextRoomState;
        setRoomState(nextRoomState);
      } else {
        await syncRoundState().catch(() => {
          // Timer state can be refetched later if the local room snapshot is missing.
        });
      }

      setNotification({
        message: 'Таймер запущено',
        tone: 'success',
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Не вдалося запустити таймер',
      );

      throw requestError;
    } finally {
      setTimerSubmitting(false);
    }
  }, [gameId, isCurrentParticipantMaster, isRoundRevealed, resolvedActiveIssue, syncRoundState]);

  const restartRoundTimer = useCallback(async () => {
    await startRoundTimer(preferredTimerSeconds);
  }, [preferredTimerSeconds, startRoundTimer]);

  const stopRoundTimer = useCallback(async () => {
    if (!isCurrentParticipantMaster || !roomStateRef.current?.timer) {
      return;
    }

    setTimerSubmitting(true);

    try {
      await stopTimerRequest(gameId);

      const currentRoomState = roomStateRef.current;

      if (currentRoomState) {
        const nextRoomState = {
          ...currentRoomState,
          timer: null,
        };

        roomStateRef.current = nextRoomState;
        setRoomState(nextRoomState);
      }

      setNotification({
        message: 'Таймер зупинено',
        tone: 'info',
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Не вдалося зупинити таймер',
      );

      throw requestError;
    } finally {
      setTimerSubmitting(false);
    }
  }, [gameId, isCurrentParticipantMaster]);

  useEffect(() => {
    const hasVotes = votesCastCount > 0;
    const timerExpiredWithVotes = Boolean(roomState?.timer && isTimerExpiredLocally && hasVotes);
    const shouldAutoReveal = autoRevealEnabled && (everyoneVoted || timerExpiredWithVotes);

    if (!resolvedActiveIssue || isRoundRevealed || isRevealPending || revealSubmitting || !shouldAutoReveal) {
      if (!shouldAutoReveal || isRoundRevealed || !resolvedActiveIssue) {
        autoRevealTriggerRef.current = null;
      }

      return;
    }

    if (!canRevealCards) {
      return;
    }

    const triggerReason = everyoneVoted ? 'all-voted' : 'timer-expired';
    const triggerKey = `${resolvedActiveIssue.id}:${triggerReason}`;

    if (autoRevealTriggerRef.current === triggerKey) {
      return;
    }

    autoRevealTriggerRef.current = triggerKey;

    void (async () => {
      try {
        await revealVotes();
      } catch {
        autoRevealTriggerRef.current = null;
      }
    })();
  }, [
    autoRevealEnabled,
    canRevealCards,
    everyoneVoted,
    isRevealPending,
    isRoundRevealed,
    isTimerExpiredLocally,
    revealSubmitting,
    revealVotes,
    resolvedActiveIssue,
    roomState?.timer,
    votesCastCount,
  ]);

  const ensureHistoryResultsLoaded = useCallback(async () => {
    if (historyResults) {
      return historyResults;
    }

    const history = await getVotingHistoryRequest(gameId, {
      page: 1,
      pageSize: 500,
      sortBy: 'time',
      sortDirection: 'desc',
    });

    setHistoryResults(history.items);

    return history.items;
  }, [gameId, historyResults]);

  const openCurrentRoundResult = useCallback(() => {
    if (!currentRoundResultData) {
      return;
    }

    setResultDialog({
      open: true,
      loading: false,
      error: null,
      data: currentRoundResultData,
    });
  }, [currentRoundResultData]);

  const openIssueResult = useCallback(
    async (issueId: string) => {
      const issue = issuesRef.current.find((entry) => entry.id === issueId);

      if (!issue) {
        return;
      }

      if (cachedIssueResults[issueId]) {
        setResultDialog({
          open: true,
          loading: false,
          error: null,
          data: {
            ...cachedIssueResults[issueId],
            issueName: issue.title,
            issueCode: issue.code,
          },
        });
        return;
      }

      if (!isCurrentParticipantMaster) {
        setError('Детальний результат для цієї issue недоступний.');
        return;
      }

      setResultDialog({
        open: true,
        loading: true,
        error: null,
        data: null,
      });

      try {
        const historyItems = await ensureHistoryResultsLoaded();
        const historyItem = historyItems.find((item) => item.issueId === issueId);

        if (!historyItem) {
          throw new Error('Результат для цієї issue ще недоступний.');
        }

        const nextResultData = buildHistoryResultData(issue, historyItem);

        setCachedIssueResults((current) => ({
          ...current,
          [issueId]: nextResultData,
        }));
        setResultDialog({
          open: true,
          loading: false,
          error: null,
          data: nextResultData,
        });
      } catch (requestError) {
        setResultDialog({
          open: true,
          loading: false,
          error:
            requestError instanceof Error
              ? requestError.message
              : 'Не вдалося завантажити результат issue',
          data: null,
        });
      }
    },
    [cachedIssueResults, ensureHistoryResultsLoaded, isCurrentParticipantMaster],
  );

 const resetIssueRoundFromSidebar = useCallback(
 async (issueId: string) => {
    if (!isCurrentParticipantMaster) {
      return;
    }

    clearPendingReveal();
    suppressResultDialogRef.current = true;
    setResetRoundSubmitting(true);

    try {
      const nextRoomState = await resetRoundRequest(gameId, issueId);
      const nextIssues = await getIssuesRequest(gameId);

      applyRoundState(nextRoomState);
      setIssues(applyRoomStateToIssues(nextIssues, nextRoomState));

      setCachedIssueResults((current) => {
        const next = { ...current };
        delete next[issueId];
        return next;
      });

      setResultDialog((current) =>
        current.data?.issueId === issueId
          ? {
              open: false,
              loading: false,
              error: null,
              data: null,
            }
          : current,
      );

      previousRevealedIssueIdRef.current = null;

      setNotification({
        message: 'Оцінювання розпочато заново',
        tone: 'success',
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Не вдалося почати оцінювання заново',
      );

      throw requestError;
    } finally {
      setResetRoundSubmitting(false);
      suppressResultDialogRef.current = false;
    }
  },
  [applyRoundState, gameId, isCurrentParticipantMaster],
);

  const addIssue = useCallback(
    async (payload: { title: string }) => {
      try {
        await createIssueRequest(gameId, payload);

        setNotification({
          message: 'Issue успішно додано',
          tone: 'success',
        });
      } catch (requestError) {
        setError(
          requestError instanceof Error ? requestError.message : 'Не вдалося додати issue',
        );
        throw requestError;
      }
    },
    [gameId],
  );

  const updateIssue = useCallback(
    async (
      issueId: string,
      payload: { title: string; code?: string; description?: string },
    ) => {
      try {
        await updateIssueRequest(gameId, issueId, payload);

        setNotification({
          message: 'Issue успішно оновлено',
          tone: 'success',
        });
      } catch (requestError) {
        setError(
          requestError instanceof Error ? requestError.message : 'Не вдалося оновити issue',
        );
        throw requestError;
      }
    },
    [gameId],
  );

  const deleteIssue = useCallback(
    async (issueId: string) => {
      const previousIssues = issuesRef.current;

      setIssues((current) => current.filter((issue) => issue.id !== issueId));

      try {
        await deleteIssueRequest(gameId, issueId);

        setNotification({
          message: 'Issue видалено',
          tone: 'success',
        });
      } catch (requestError) {
        setIssues(previousIssues);

        setError(
          requestError instanceof Error ? requestError.message : 'Не вдалося видалити issue',
        );
        throw requestError;
      }
    },
    [gameId],
  );

  const deleteAllIssues = useCallback(async () => {
    const previousIssues = issuesRef.current;
    const visibleIssues = previousIssues.filter((issue) => !issue.isRemoved);

    if (!visibleIssues.length) {
      return;
    }

    setIssues((current) => current.filter((issue) => issue.isRemoved));

    try {
      await Promise.all(visibleIssues.map((issue) => deleteIssueRequest(gameId, issue.id)));

      setNotification({
        message: 'Усі issues видалено',
        tone: 'success',
      });
    } catch (requestError) {
      setIssues(previousIssues);

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Не вдалося видалити всі issues',
      );

      throw requestError;
    }
  }, [gameId]);

  const importIssuesFromPlane = useCallback(
    async (payload: ImportPlaneIssuesPayload) => {
      try {
        const importedIssues = await importPlaneIssuesRequest(gameId, payload);

        setIssues(
          applyRoomStateToIssues(
            [...importedIssues]
              .filter((issue) => !issue.isRemoved)
              .sort((left, right) => left.order - right.order),
            roomState,
          ),
        );

        setNotification({
          message: 'Issues з Plane імпортовано',
          tone: 'success',
        });
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Не вдалося імпортувати issues з Plane',
        );

        throw requestError;
      }
    },
    [gameId, roomState],
  );

  const htmlToPlainText = (value: string) => {
    if (!value) {
      return '';
    }

    const normalizedValue = value
      .replace(/&nbsp;/g, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n');

    if (typeof window === 'undefined') {
      return normalizedValue
        .replace(/<[^>]*>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }

    const parser = new DOMParser();
    const document = parser.parseFromString(normalizedValue, 'text/html');

    return (document.body.textContent ?? '')
      .replace(/\u00A0/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const escapeCsvValue = (value: string) => {
    const escapedValue = value.replace(/"/g, '""');

    return /["\r\n,]/.test(escapedValue) ? `"${escapedValue}"` : escapedValue;
  };

  const parseCsvText = (csvText: string) => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentValue = '';
    let inQuotes = false;

    for (let index = 0; index < csvText.length; index += 1) {
      const char = csvText[index];
      const nextChar = csvText[index + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentValue += '"';
          index += 1;
          continue;
        }

        inQuotes = !inQuotes;
        continue;
      }

      if (char === ',' && !inQuotes) {
        currentRow.push(currentValue);
        currentValue = '';
        continue;
      }

      if (char === '\r') {
        continue;
      }

      if (char === '\n' && !inQuotes) {
        currentRow.push(currentValue);
        rows.push(currentRow);
        currentRow = [];
        currentValue = '';
        continue;
      }

      currentValue += char;
    }

    if (currentValue || currentRow.length > 0) {
      currentRow.push(currentValue);
      rows.push(currentRow);
    }

    return rows;
  };

  const normalizeCsvDescription = async (
    csvBlob: Blob,
    descriptionColumnName: string,
  ) => {
    const csvText = await csvBlob.text();
    const rows = parseCsvText(csvText);

    if (!rows.length) {
      return csvBlob;
    }

    const headerRow = rows[0];

    const descriptionColumnIndex = headerRow.findIndex(
      (column) =>
        column.trim().toLowerCase() === descriptionColumnName.trim().toLowerCase(),
    );

    if (descriptionColumnIndex === -1) {
      return csvBlob;
    }

    const normalizedRows = rows.map((row, rowIndex) => {
      if (rowIndex === 0) {
        return row;
      }

      if (row.length <= descriptionColumnIndex) {
        return row;
      }

      const normalizedRow = [...row];

      normalizedRow[descriptionColumnIndex] = htmlToPlainText(
        normalizedRow[descriptionColumnIndex],
      );

      return normalizedRow;
    });

    const normalizedCsv = normalizedRows
      .map((row) => row.map((cell) => escapeCsvValue(cell ?? '')).join(','))
      .join('\r\n');

    return new Blob([`\uFEFF${normalizedCsv}`], {
      type: 'text/csv;charset=utf-8;',
    });
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  };

  const exportIssuesAsCsv = useCallback(async () => {
    const exportPayload = {
      summaryColumnName: 'Summary',
      keyColumnName: 'Key',
      descriptionColumnName: 'Description',
      linkColumnName: 'Link',
      estimateColumnName: 'Estimate',
    };

    try {
      const csvBlob = await exportIssuesToCsvRequest(gameId, exportPayload);

      const normalizedCsvBlob = await normalizeCsvDescription(
        csvBlob,
        exportPayload.descriptionColumnName,
      );

      const date = new Date().toISOString().split('T')[0];

      downloadBlob(normalizedCsvBlob, `issues-${gameId}-${date}.csv`);

      setNotification({
        message: 'Issues експортовано',
        tone: 'success',
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Не вдалося експортувати issues',
      );

      throw requestError;
    }
  }, [gameId]);

 const setIssueActive = useCallback(
  async (issueId: string) => {
    const previousIssues = issuesRef.current;
    const previousRoomState = roomStateRef.current;
    const clickedIssue = previousIssues.find((issue) => issue.id === issueId);

    if (!clickedIssue) {
      return;
    }

    const isTurningOff = clickedIssue.isCurrent;
    const shouldActivate = !isTurningOff;

    clearPendingReveal();
    setIssues((current) =>
      applyOptimisticIssueActivation(current, issueId, shouldActivate),
    );

    setRoomState((current) => {
      if (!current) {
        return current;
      }

      if (isTurningOff) {
        const nextRoomState = {
          ...current,
          activeIssue: null,
          isRevealed: false,
          result: null,
          myVote: null,
          votedCount: 0,
          timer: game?.autoResetTimer ? null : current.timer,
          canVote: false,
          participants: current.participants.map((participant) => ({
            ...participant,
            hasVoted: false,
            voteValue: null,
          })),
        };

        roomStateRef.current = nextRoomState;
        return nextRoomState;
      }

      const nextRoomState = {
        ...current,
        activeIssue: {
          ...clickedIssue,
          isCurrent: true,
          finalEstimate: null,
          status: IssueStatus.Voting,
        },
        isRevealed: false,
        result: null,
        myVote: null,
        votedCount: 0,
        timer: game?.autoResetTimer ? null : current.timer,
        canVote: true,
        participants: current.participants.map((participant) => ({
          ...participant,
          hasVoted: false,
          voteValue: null,
        })),
      };

      roomStateRef.current = nextRoomState;
      return nextRoomState;
    });

    try {
      await setIssueActiveRequest(gameId, issueId);

      if (game?.autoResetTimer && isCurrentParticipantMaster) {
        await stopTimerRequest(gameId).catch(() => undefined);
      }

      const [nextRoomState, nextIssues] = await Promise.all([
        getRoomStateRequest(gameId),
        getIssuesRequest(gameId),
      ]);

      applyRoundState(nextRoomState);
      setIssues(applyRoomStateToIssues(nextIssues, nextRoomState));

      setNotification({
        message: isTurningOff ? 'Оцінювання зупинено' : 'Оцінювання розпочато',
        tone: 'success',
      });
    } catch (requestError) {
      setIssues(previousIssues);
      roomStateRef.current = previousRoomState;
      setRoomState(previousRoomState);

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Не вдалося оновити статус оцінювання',
      );

      throw requestError;
    }
  },
  [applyRoundState, clearPendingReveal, game?.autoResetTimer, gameId, isCurrentParticipantMaster],
);

const resetCurrentRound = useCallback(async () => {
  if (!resolvedActiveIssue || !isCurrentParticipantMaster) {
    return;
  }

  const resettingIssueId = resolvedActiveIssue.id;

  clearPendingReveal();
  suppressResultDialogRef.current = true;
  setResetRoundSubmitting(true);

  try {
    const nextRoomState = await resetRoundRequest(gameId, resettingIssueId);
    const nextIssues = await getIssuesRequest(gameId);

    applyRoundState(nextRoomState);
    setIssues(applyRoomStateToIssues(nextIssues, nextRoomState));

    setCachedIssueResults((current) => {
      const next = { ...current };
      delete next[resettingIssueId];
      return next;
    });

    setResultDialog((current) =>
      current.data?.issueId === resettingIssueId
        ? {
            open: false,
            loading: false,
            error: null,
            data: null,
          }
        : current,
    );

    previousRevealedIssueIdRef.current = null;

    setNotification({
      message: 'Оцінювання скинуто',
      tone: 'success',
    });
  } catch (requestError) {
    setError(
      requestError instanceof Error
        ? requestError.message
        : 'Не вдалося почати оцінювання заново',
    );

    throw requestError;
  } finally {
    setResetRoundSubmitting(false);
    suppressResultDialogRef.current = false;
  }
}, [applyRoundState, gameId, isCurrentParticipantMaster, resolvedActiveIssue]);

  const goToNextIssue = useCallback(async () => {
    if (!nextIssue) {
      return;
    }

    setNextIssueSubmitting(true);

    try {
      await setIssueActive(nextIssue.id);
    } finally {
      setNextIssueSubmitting(false);
    }
  }, [nextIssue, setIssueActive]);

  const reorderIssue = useCallback(
    async (issueId: string, direction: 'up' | 'down') => {
      const previousIssues = issuesRef.current;
      const ordered = [...previousIssues]
        .filter((issue) => !issue.isRemoved)
        .sort((a, b) => a.order - b.order);

      const currentIndex = ordered.findIndex((issue) => issue.id === issueId);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= ordered.length) {
        return;
      }

      const next = [...ordered];
      const [movedIssue] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, movedIssue);

      const reorderedIssues = next.map((issue, index) => ({
        ...issue,
        order: index + 1,
      }));

      const reorderedIds = reorderedIssues.map((issue) => issue.id);

      setIssues((current) =>
        current.map((issue) => {
          const nextIssue = reorderedIssues.find((entry) => entry.id === issue.id);
          return nextIssue ?? issue;
        }),
      );

      try {
        await reorderIssuesRequest(gameId, { issuesIds: reorderedIds });
      } catch (requestError) {
        setIssues(previousIssues);

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Не вдалося змінити порядок issue',
        );

        throw requestError;
      }
    },
    [gameId],
  );

  const reorderIssues = useCallback(
    async (issueIds: string[]) => {
      const previousIssues = issuesRef.current;

      setIssues((current) =>
        current.map((issue) => {
          const nextIndex = issueIds.indexOf(issue.id);

          if (nextIndex < 0) {
            return issue;
          }

          return {
            ...issue,
            order: nextIndex + 1,
          };
        }),
      );

      try {
        await reorderIssuesRequest(gameId, { issuesIds: issueIds });
      } catch (requestError) {
        setIssues(previousIssues);

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Не вдалося змінити порядок issue',
        );
        throw requestError;
      }
    },
    [gameId],
  );

  return {
    gameId,
    reloadRoom,
    loading,
    error,
    sidebarView,
    setSidebarView,
    isSidebarOpen,
    closeSidebar,
    isInviteDialogOpen,
    closeInviteDialog,
    isQrDialogOpen,
    openQrDialog: () => setQrDialogOpen(true),
    closeQrDialog: () => setQrDialogOpen(false),
    copiedItem,
    copyText,
    inviteCode,
    inviteUrl,
    qrCodeImage,
    onlineParticipantsCount: onlineParticipants.length,
    currentParticipantId: currentParticipant?.id ?? null,
    isCurrentParticipantMaster,
    canRevealCards,
    canManageIssues: canManageIssuesInRound,
    selectedParticipantId,
    pendingParticipantActionId,
    selectParticipant,
    removeParticipant,
    transferMaster,
    addIssue,
    updateIssue,
    deleteIssue,
    deleteAllIssues,
    setIssueActive,
    reorderIssue,
    reorderIssues,
    importIssuesFromPlane,
    exportIssuesAsCsv,
    sidebarParticipants,
    sortedParticipants,
    sortedIssues,
    positionedParticipants,
    overflowParticipants,
    activeIssue: resolvedActiveIssue,
    roundLabel,
    votingSystemLabel,
    deckValues,
    timerOptions,
    selectedTimerSeconds: preferredTimerSeconds,
    viewableIssueResultIds,
    timerLabel,
    isTimerActive,
    hasTimerState: Boolean(roomState?.timer),
    timerExpiredWithoutAutoReveal,
    timerSubmitting,
    revealCountdown,
    canRevealCurrentRound,
    canVoteInRound,
    currentVoteValue,
    votesCastCount,
    roundResult,
    isRoundRevealed,
    canOpenCurrentResult: Boolean(currentRoundResultData),
    canResetCurrentRound,
    canGoToNextIssue,
    showAverage: game?.showAverage ?? true,
    voteSubmitting,
    revealSubmitting,
    resetRoundSubmitting,
    nextIssueSubmitting,
    updateTimerDurationSelection,
    startRoundTimer,
    restartRoundTimer,
    stopRoundTimer,
    submitVote,
    revealVotes,
    resultDialog,
    closeResultDialog: () =>
      setResultDialog((current) => ({
        ...current,
        open: false,
      })),
    openCurrentRoundResult,
    openIssueResult,
    resetCurrentRound,
    resetIssueRoundFromSidebar,
    goToNextIssue,
    notification,
    closeNotification: () => setNotification(null),
    connectionStatus: realtime.connectionStatus,
    retryConnection: realtime.retryConnection,
  };
};
