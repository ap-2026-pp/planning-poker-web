import { useCallback, useEffect, useRef, useState } from 'react';
import { HubConnectionState, type HubConnection } from '@microsoft/signalr';

import type { Game, RoomState } from '@entities/game';
import type { Issue } from '@entities/issue';
import type { GameParticipant } from '@entities/participant';
import type { EmojiReaction, SendEmojiReactionPayload } from '@entities/reaction';
import {
    createSignalRConnection,
    startSignalRConnection,
    stopSignalRConnection,
} from '@shared/realtime';
import {
    buildGameRoomHubUrl,
    gameRoomRealtimeHubMethodNames,
    gameRoomRealtimeEventNames,
    getGameRoomRealtimeAccessToken,
} from './game-room-realtime';
import { hasGuestTokenCookie, subscribeToSessionInvalidated } from '@shared/auth';

type ConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected';

type UseGameRoomRealtimeParams = {
    gameId: string;
    onParticipantJoined?: (participant: GameParticipant) => void | Promise<void>;
    onParticipantLeft?: (participantId: GameParticipant['id']) => void | Promise<void>;
    onParticipantKicked?: (participantId: GameParticipant['id']) => void | Promise<void>;
    onUserUpdated?: (participant: GameParticipant) => void | Promise<void>;
    onGameUpdated?: (updatedGame: Game | string) => void | Promise<void>;
    onIssueCreated?: (issue: Issue) => void | Promise<void>;
    onIssueUpdated?: (issue: Issue) => void | Promise<void>;
    onIssuesImported?: (importedIssues: Issue[]) => void | Promise<void>;
    onRoundStateUpdated?: (roomState: RoomState) => void | Promise<void>;
    onEmojiReactionReceived?: (reaction: EmojiReaction) => void | Promise<void>;
    onReconnected?: () => void | Promise<void>;
};

export const useGameRoomRealtime = ({
    gameId,
    onParticipantJoined,
    onParticipantLeft,
    onParticipantKicked,
    onUserUpdated,
    onGameUpdated,
    onIssueCreated,
    onIssueUpdated,
    onIssuesImported,
    onRoundStateUpdated,
    onEmojiReactionReceived,
    onReconnected,
}: UseGameRoomRealtimeParams) => {
    const connectionRef = useRef<HubConnection | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
    const handlersRef = useRef({
        onParticipantJoined,
        onParticipantLeft,
        onParticipantKicked,
        onUserUpdated,
        onGameUpdated,
        onIssueCreated,
        onIssueUpdated,
        onIssuesImported,
        onRoundStateUpdated,
        onEmojiReactionReceived,
        onReconnected,
    });

    useEffect(() => {
        handlersRef.current = {
            onParticipantJoined,
            onParticipantLeft,
            onParticipantKicked,
            onUserUpdated,
            onGameUpdated,
            onIssueCreated,
            onIssueUpdated,
            onIssuesImported,
            onRoundStateUpdated,
            onEmojiReactionReceived,
            onReconnected,
        };
    }, [
        onParticipantJoined,
        onParticipantLeft,
        onParticipantKicked,
        onUserUpdated,
        onGameUpdated,
        onIssueCreated,
        onIssueUpdated,
        onIssuesImported,
        onRoundStateUpdated,
        onEmojiReactionReceived,
        onReconnected,
    ]);

    const attachHandlers = useCallback((connection: HubConnection) => {
        connection.on(gameRoomRealtimeEventNames.participantJoined, (participant: GameParticipant) => {
            void handlersRef.current.onParticipantJoined?.(participant);
        });

        connection.on(gameRoomRealtimeEventNames.participantLeft, (participantId: GameParticipant['id']) => {
            void handlersRef.current.onParticipantLeft?.(participantId);
        });

        connection.on(gameRoomRealtimeEventNames.participantKicked, (participantId: GameParticipant['id']) => {
            void handlersRef.current.onParticipantKicked?.(participantId);
        });

        connection.on(gameRoomRealtimeEventNames.userUpdated, (participant: GameParticipant) => {
            void handlersRef.current.onUserUpdated?.(participant);
        });

        connection.on(gameRoomRealtimeEventNames.participantUpdated, (participant: GameParticipant) => {
            void handlersRef.current.onUserUpdated?.(participant);
        });

        connection.on(gameRoomRealtimeEventNames.gameUpdated, (updatedGame: Game | string) => {
            void handlersRef.current.onGameUpdated?.(updatedGame);
        });

        connection.on(gameRoomRealtimeEventNames.issueCreated, (issue: Issue) => {
            void handlersRef.current.onIssueCreated?.(issue);
        });

        connection.on(gameRoomRealtimeEventNames.issueUpdated, (issue: Issue) => {
            void handlersRef.current.onIssueUpdated?.(issue);
        });

        connection.on(gameRoomRealtimeEventNames.issuesImported, (importedIssues: Issue[]) => {
            void handlersRef.current.onIssuesImported?.(importedIssues);
        });

        connection.on(gameRoomRealtimeEventNames.roundStateUpdated, (roomState: RoomState) => {
            void handlersRef.current.onRoundStateUpdated?.(roomState);
        });

        connection.on(gameRoomRealtimeEventNames.emojiReactionReceived, (reaction: EmojiReaction) => {
            void handlersRef.current.onEmojiReactionReceived?.(reaction);
        });

        connection.onreconnecting(() => {
            setConnectionStatus('reconnecting');
        });

        connection.onreconnected(async () => {
            setConnectionStatus('connected');
            await handlersRef.current.onReconnected?.();
        });

        connection.onclose(() => {
            setConnectionStatus('disconnected');
        });
    }, []);

    const detachHandlers = useCallback((connection: HubConnection) => {
        connection.off(gameRoomRealtimeEventNames.participantJoined);
        connection.off(gameRoomRealtimeEventNames.participantLeft);
        connection.off(gameRoomRealtimeEventNames.participantKicked);
        connection.off(gameRoomRealtimeEventNames.userUpdated);
        connection.off(gameRoomRealtimeEventNames.participantUpdated);
        connection.off(gameRoomRealtimeEventNames.gameUpdated);
        connection.off(gameRoomRealtimeEventNames.issueCreated);
        connection.off(gameRoomRealtimeEventNames.issueUpdated);
        connection.off(gameRoomRealtimeEventNames.issuesImported);
        connection.off(gameRoomRealtimeEventNames.roundStateUpdated);
        connection.off(gameRoomRealtimeEventNames.emojiReactionReceived);
    }, []);

    const createAndConnect = useCallback(async () => {
        if (!gameId) {
            return;
        }

        const nextConnection = createSignalRConnection(
            buildGameRoomHubUrl(gameId),
            hasGuestTokenCookie()
                ? {
                    getAccessToken: getGameRoomRealtimeAccessToken,
                }
                : undefined,
        );

        attachHandlers(nextConnection);
        connectionRef.current = nextConnection;

        setConnectionStatus('connecting');
        await startSignalRConnection(nextConnection);
        setConnectionStatus('connected');
    }, [attachHandlers, gameId]);

    useEffect(() => {
        if (!gameId) {
            return;
        }

        let isMounted = true;

        const init = async () => {
            try {
                await createAndConnect();
            } catch (error) {
                console.error('Failed to start SignalR connection', error);
                if (isMounted) {
                    setConnectionStatus('disconnected');
                }
            }
        };

        void init();

        return () => {
            isMounted = false;

            const current = connectionRef.current;
            connectionRef.current = null;

            if (current) {
                detachHandlers(current);
                void stopSignalRConnection(current);
            }
        };
    }, [createAndConnect, detachHandlers, gameId]);

    useEffect(() => {
        return subscribeToSessionInvalidated(() => {
            const current = connectionRef.current;

            if (!current) {
                return;
            }

            connectionRef.current = null;
            detachHandlers(current);
            void stopSignalRConnection(current);
            setConnectionStatus('disconnected');
        });
    }, [detachHandlers]);

    const retryConnection = useCallback(async () => {
        const current = connectionRef.current;

        try {
            setConnectionStatus('connecting');

            if (current) {
                detachHandlers(current);
                await stopSignalRConnection(current);
            }

            connectionRef.current = null;
            await createAndConnect();
        } catch (error) {
            console.error('Failed to retry SignalR connection', error);
            setConnectionStatus('disconnected');
        }
    }, [createAndConnect, detachHandlers]);

    const sendEmojiReaction = useCallback(async (payload: SendEmojiReactionPayload) => {
        const current = connectionRef.current;

        if (!current || current.state !== HubConnectionState.Connected) {
            throw new Error('Зʼєднання з кімнатою ще не готове. Спробуйте ще раз за мить.');
        }

        await current.invoke(gameRoomRealtimeHubMethodNames.sendEmojiReaction, payload);
    }, []);

    return { connectionStatus, retryConnection, sendEmojiReaction };
};
