import { createContext, useContext } from 'react';

export type LeaveRoomHandler = (() => Promise<void>) | null;

export type GameRoomShellContextValue = {
  roomTitle: string;
  setRoomTitle: (title: string) => void;
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  isInviteDialogOpen: boolean;
  openInviteDialog: () => void;
  closeInviteDialog: () => void;
  leaveRoom: LeaveRoomHandler;
  setLeaveRoom: (handler: LeaveRoomHandler) => void;
};

export const GameRoomShellContext = createContext<GameRoomShellContextValue | null>(null);

export const useGameRoomShell = () => {
  const context = useContext(GameRoomShellContext);

  if (!context) {
    throw new Error('useGameRoomShell must be used inside GameRoomShellContext');
  }

  return context;
};
