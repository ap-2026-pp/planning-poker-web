import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useGameRoomRealtime } from './use-game-room-realtime';

import { IssuesPolicy, RevealPolicy, type Game, type GameInvite } from '@entities/game';
import type { ImportPlaneIssuesPayload, Issue } from '@entities/issue';
import { ParticipantRole, type GameParticipant } from '@entities/participant';
import {
  createIssueRequest,
  deleteGameParticipantRequest,
  deleteIssueRequest,
  exportIssuesToCsvRequest,
  getGameInviteRequest,
  getGameRequest,
  getIssuesRequest,
  getParticipantsRequest,
  importPlaneIssuesRequest,
  leaveGameRequest,
  reorderIssuesRequest,
  setIssueActiveRequest,
  setSpectatorModeRequest,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarView, setSidebarView] = useState<SidebarView>('issues');
  const [isQrDialogOpen, setQrDialogOpen] = useState(false);
  const [copiedItem, setCopiedItem] = useState<CopiedItem>(null);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [pendingParticipantActionId, setPendingParticipantActionId] = useState<string | null>(null);
  const [notification, setNotification] = useState<RoomNotification | null>(null);

  const resetCopiedTimeoutRef = useRef<number | null>(null);
  const currentParticipantIdRef = useRef<string | null>(null);
  const participantsRef = useRef<GameParticipant[]>([]);
  const issuesRef = useRef<Issue[]>([]);

  const storedParticipantSession = getCurrentRoomParticipantSession();

  const reloadRoom = useCallback(async () => {
    setLoading(true);
    setError(null);

    const results = await Promise.allSettled([
      getGameRequest(gameId),
      getParticipantsRequest(gameId),
      getIssuesRequest(gameId),
      getGameInviteRequest(gameId),
    ]);

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
  }, [gameId]);

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
  const roundLabel = getRoundLabel(sortedIssues, activeIssueIndex);

  const votingSystemLabel = getGameRoomVotingLabel(game?.votingSystem);

  const deckValues = getGameRoomDeck(
    game?.votingSystem,
    (game as typeof game & { customCards?: string[] | null })?.customCards ?? null,
  );

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  useEffect(() => {
    issuesRef.current = issues;
  }, [issues]);

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
    (updatedGame: Game | string) => {
      if (typeof updatedGame === 'string') {
        setNotification({
          message: 'Налаштування гри оновлено',
          tone: 'success',
        });

        return;
      }

      setGame(updatedGame);

      if (!updatedGame.isActive) {
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

      setNotification({
        message: 'Налаштування гри оновлено',
        tone: 'success',
      });
    },
    [closeInviteDialog, closeSidebar, navigate],
  );

  const handleIssueCreated = useCallback((issue: Issue) => {
    setIssues((current) => {
      const exists = current.some((entry) => entry.id === issue.id);

      if (exists) {
        return current.map((entry) => (entry.id === issue.id ? issue : entry));
      }

      return [...current, issue];
    });
  }, []);

  const handleIssueUpdated = useCallback((issue: Issue) => {
    setIssues((current) => {
      if (issue.isRemoved) {
        return current.filter((entry) => entry.id !== issue.id);
      }

      const exists = current.some((entry) => entry.id === issue.id);

      if (!exists) {
        return [...current, issue];
      }

      return current.map((entry) => (entry.id === issue.id ? { ...entry, ...issue } : entry));
    });
  }, []);

  const handleIssuesImported = useCallback((importedIssues: Issue[]) => {
    setIssues(
      [...importedIssues]
        .filter((issue) => !issue.isRemoved)
        .sort((left, right) => left.order - right.order),
    );

    setNotification({
      message: 'Issues з Plane імпортовано',
      tone: 'success',
    });
  }, []);

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
          [...importedIssues]
            .filter((issue) => !issue.isRemoved)
            .sort((left, right) => left.order - right.order),
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
    [gameId],
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
      const clickedIssue = previousIssues.find((issue) => issue.id === issueId);

      if (!clickedIssue) {
        return;
      }

      const isTurningOff = clickedIssue.isCurrent;

      setIssues((current) =>
        current.map((issue) => {
          if (issue.id === issueId) {
            return {
              ...issue,
              isCurrent: !issue.isCurrent,
            };
          }

          return {
            ...issue,
            isCurrent: false,
          };
        }),
      );

      try {
        await setIssueActiveRequest(gameId, issueId);

        setNotification({
          message: isTurningOff ? 'Оцінювання зупинено' : 'Оцінювання розпочато',
          tone: 'success',
        });
      } catch (requestError) {
        setIssues(previousIssues);

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Не вдалося оновити статус оцінювання',
        );
        throw requestError;
      }
    },
    [gameId],
  );

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
    canManageIssues,
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
    activeIssue,
    roundLabel,
    votingSystemLabel,
    deckValues,
    notification,
    closeNotification: () => setNotification(null),
    connectionStatus: realtime.connectionStatus,
    retryConnection: realtime.retryConnection,
  };
};
