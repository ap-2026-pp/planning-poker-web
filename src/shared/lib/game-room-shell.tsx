import { createContext, useContext } from 'react';

export type LeaveRoomHandler = (() => Promise<void>) | null;
export type RenameRoomParticipantHandler = ((displayName: string) => Promise<void>) | null;
export type ToggleRoomParticipantSpectatorModeHandler = ((isSpectator: boolean) => Promise<void>) | null;

export type GameRoomParticipantSummary = {
  displayName: string;
  isMaster: boolean;
  isSpectator: boolean;
};

export type GameRoomShellContextValue = {
  roomTitle: string;
  setRoomTitle: (title: string) => void;
  roomParticipant: GameRoomParticipantSummary | null;
  setRoomParticipant: (participant: GameRoomParticipantSummary | null) => void;
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  isInviteDialogOpen: boolean;
  openInviteDialog: () => void;
  closeInviteDialog: () => void;
  leaveRoom: LeaveRoomHandler;
  setLeaveRoom: (handler: LeaveRoomHandler) => void;
  renameRoomParticipant: RenameRoomParticipantHandler;
  setRenameRoomParticipant: (handler: RenameRoomParticipantHandler) => void;
  toggleRoomParticipantSpectatorMode: ToggleRoomParticipantSpectatorModeHandler;
  setToggleRoomParticipantSpectatorMode: (
    handler: ToggleRoomParticipantSpectatorModeHandler,
  ) => void;
};

export const GameRoomShellContext = createContext<GameRoomShellContextValue | null>(null);

export const useGameRoomShell = () => {
  const context = useContext(GameRoomShellContext);

  if (!context) {
    throw new Error('useGameRoomShell must be used inside GameRoomShellContext');
  }

  return context;
};
