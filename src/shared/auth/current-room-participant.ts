const CURRENT_ROOM_PARTICIPANT_KEY = 'planning-poker.current-room-participant';

export type CurrentRoomParticipantSession = {
  gameId: string;
  participantId: string;
};

const canUseStorage = () => typeof window !== 'undefined';

export const getCurrentRoomParticipantSession = (): CurrentRoomParticipantSession | null => {
  if (!canUseStorage()) {
    return null;
  }

  const rawValue = localStorage.getItem(CURRENT_ROOM_PARTICIPANT_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<CurrentRoomParticipantSession>;

    if (
      typeof parsedValue.gameId !== 'string' ||
      typeof parsedValue.participantId !== 'string'
    ) {
      localStorage.removeItem(CURRENT_ROOM_PARTICIPANT_KEY);
      return null;
    }

    return {
      gameId: parsedValue.gameId,
      participantId: parsedValue.participantId,
    };
  } catch {
    localStorage.removeItem(CURRENT_ROOM_PARTICIPANT_KEY);
    return null;
  }
};

export const setCurrentRoomParticipantSession = (gameId: string, participantId: string) => {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(
    CURRENT_ROOM_PARTICIPANT_KEY,
    JSON.stringify({
      gameId,
      participantId,
    }),
  );
};

export const clearCurrentRoomParticipantSession = () => {
  if (!canUseStorage()) {
    return;
  }

  localStorage.removeItem(CURRENT_ROOM_PARTICIPANT_KEY);
};
