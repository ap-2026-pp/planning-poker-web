import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGameRoomRealtime } from './use-game-room-realtime';

import type { Game, GameInvite } from '@entities/game';
import type { Issue } from '@entities/issue';
import { ParticipantRole, type GameParticipant } from '@entities/participant';
import {
  getGameInviteRequest,
  getGameRequest,
  getIssuesRequest,
  getParticipantsRequest,
  leaveGameRequest,
  setSpectatorModeRequest,
  updateDisplayNameRequest,
} from '@shared/api';
import {
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
  type CopiedItem,
  type SidebarView,
} from './game-room';
import {
  getParticipantPositions,
  getParticipantVisibilityLimit,
} from './participant-layout';
import {
  removeGameRoomParticipant,
  upsertGameRoomParticipant,
} from './game-room-realtime';

export const useGameRoomPage = () => {
  const { gameId = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useSession();
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarView, setSidebarView] = useState<SidebarView>('issues');
  const [isQrDialogOpen, setQrDialogOpen] = useState(false);
  const [copiedItem, setCopiedItem] = useState<CopiedItem>(null);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const resetCopiedTimeoutRef = useRef<number | null>(null);
  const currentParticipantIdRef = useRef<string | null>(null);
  const storedParticipantSession = getCurrentRoomParticipantSession();

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
    let isMounted = true;

    const loadRoom = async () => {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        getGameRequest(gameId),
        getParticipantsRequest(gameId),
        getIssuesRequest(gameId),
        getGameInviteRequest(gameId),
      ]);

      if (!isMounted) {
        return;
      }

      const [gameResult, participantsResult, issuesResult, inviteResult] = results;

      if (gameResult.status === 'fulfilled') {
        setGame(gameResult.value);
      }

      if (participantsResult.status === 'fulfilled') {
        setParticipants(participantsResult.value);
      }

      if (issuesResult.status === 'fulfilled') {
        setIssues(issuesResult.value);
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
    };

    void loadRoom();

    return () => {
      isMounted = false;
    };
  }, [gameId]);

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
        await navigate(appRoutes.home);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Не вдалося вийти з гри');
      }
    });

    return () => {
      setLeaveRoom(null);
    };
  }, [closeInviteDialog, closeSidebar, gameId, navigate, setLeaveRoom]);

  useEffect(
    () => () => {
      if (resetCopiedTimeoutRef.current !== null) {
        window.clearTimeout(resetCopiedTimeoutRef.current);
      }
    },
    [],
  );

  const sortedIssues = useMemo(
    () => [...issues].sort((left, right) => left.order - right.order),
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
      return (
        sortedParticipants.find((participant) => participant.userId === user.id) ?? null
      );
    }

    return null;
  }, [gameId, sortedParticipants, storedParticipantSession?.gameId, storedParticipantSession?.participantId, user?.id]);
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

  const inviteCode = invite?.inviteCode || game?.inviteCode || '—';
  const inviteUrl = invite?.inviteUrl || '';
  const qrCodeImage = invite?.qrCodeBase64
    ? `data:image/png;base64,${invite.qrCodeBase64}`
    : '';
  const activeIssueIndex = sortedIssues.findIndex((issue) => issue.isCurrent);
  const activeIssue = activeIssueIndex >= 0 ? sortedIssues[activeIssueIndex] : null;
  const roundLabel = getRoundLabel(sortedIssues, activeIssueIndex);
  const votingSystemLabel = getGameRoomVotingLabel(game?.votingSystem);
  const deckValues = getGameRoomDeck(game?.votingSystem);

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
      setParticipants(await getParticipantsRequest(gameId));
    });

    return () => {
      setToggleRoomParticipantSpectatorMode(null);
    };
  }, [gameId, setToggleRoomParticipantSpectatorMode]);

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
  }, []);

  const handleMasterChanged = useCallback((participant: GameParticipant) => {
    setParticipants((current) => upsertGameRoomParticipant(current, participant));
  }, []);

  const handleParticipantRemoved = useCallback(
    (participantId: string) => {
      setParticipants((current) => removeGameRoomParticipant(current, participantId));

      if (currentParticipantIdRef.current === participantId) {
        setQrDialogOpen(false);
        closeSidebar();
        closeInviteDialog();
        void navigate(appRoutes.home, { replace: true });
      }
    },
    [closeInviteDialog, closeSidebar, navigate],
  );

  useGameRoomRealtime({
    gameId,
    onParticipantJoined: handleParticipantJoined,
    onParticipantLeft: handleParticipantRemoved,
    onParticipantKicked: handleParticipantRemoved,
    onMasterChanged: handleMasterChanged,
  });

  return {
    gameId,
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
    sortedParticipants,
    sortedIssues,
    positionedParticipants,
    overflowParticipants,
    activeIssue,
    roundLabel,
    votingSystemLabel,
    deckValues,
  };
};
