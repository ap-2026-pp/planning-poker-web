import { Box } from '@mui/material';

import type { ImportPlaneIssuesPayload, Issue } from '@entities/issue';
import type { GameParticipant } from '@entities/participant';
import { IssuesSidebarSection } from '@features/game-room-issues';
import { ParticipantsSidebarSection } from '@features/game-room-participants';
import { GameRoomSidebarHeader } from './game-room-sidebar-header';
import { GameRoomSidebarTabs } from './game-room-sidebar-tabs';
import styles from '@shared/ui/game-room-sidebar/game-room-sidebar.module.css';

export type SidebarView = 'players' | 'issues';

type GameRoomSidebarProps = {
  sidebarView: SidebarView;
  issues: Issue[];
  participants: GameParticipant[];
  currentParticipantId: string | null;
  isCurrentParticipantMaster: boolean;
  canManageIssues: boolean;
  canRevealCards: boolean;
  pendingParticipantActionId: string | null;
  onSidebarViewChange: (value: SidebarView) => void;
  onClose: () => void;
  onRemoveParticipant: (participantId: string) => Promise<void>;
  onAddIssue?: (payload: { title: string }) => Promise<void>;
  onUpdateIssue?: (
    issueId: string,
    payload: { title: string; code?: string; description?: string },
  ) => Promise<void>;
  onDeleteIssue?: (issueId: string) => Promise<void>;
  onDeleteAllIssues?: () => Promise<void>;
  onExportIssuesAsCsv?: () => Promise<void>;
  onSetIssueActive?: (issueId: string) => Promise<void>;
  viewableResultIssueIds?: string[];
  onOpenIssueResult?: (issueId: string) => Promise<void> | void;
  onResetIssueRound?: (issueId: string) => Promise<void>;
  onMoveIssue?: (issueId: string, direction: 'up' | 'down') => Promise<void>;
  onReorderIssues?: (issueIds: string[]) => Promise<void>;
  onImportIssuesFromPlane?: (payload: ImportPlaneIssuesPayload) => Promise<void>;
};

export const GameRoomSidebar = ({
  sidebarView,
  issues,
  participants,
  currentParticipantId,
  isCurrentParticipantMaster,
  canManageIssues,
  canRevealCards,
  pendingParticipantActionId,
  onDeleteAllIssues,
  onExportIssuesAsCsv,
  onSidebarViewChange,
  onClose,
  onRemoveParticipant,
  onAddIssue,
  onUpdateIssue,
  onDeleteIssue,
  onSetIssueActive,
  viewableResultIssueIds,
  onOpenIssueResult,
  onResetIssueRound,
  onMoveIssue,
  onReorderIssues,
  onImportIssuesFromPlane,
}: GameRoomSidebarProps) => {
  return (
    <Box className={styles.sidebarPanel}>
      <GameRoomSidebarHeader onClose={onClose} />

      <GameRoomSidebarTabs
        sidebarView={sidebarView}
        onSidebarViewChange={onSidebarViewChange}
      />

      {sidebarView === 'issues' ? (
        <IssuesSidebarSection
          issues={issues}
          canManageIssues={canManageIssues}
          canRevealCards={canRevealCards}
          onAddIssue={onAddIssue}
          onUpdateIssue={onUpdateIssue}
          onDeleteIssue={onDeleteIssue}
          onDeleteAllIssues={onDeleteAllIssues}
          onExportIssuesAsCsv={onExportIssuesAsCsv}
          onSetIssueActive={onSetIssueActive}
          viewableResultIssueIds={viewableResultIssueIds}
          onOpenIssueResult={onOpenIssueResult}
          onResetIssueRound={onResetIssueRound}
          onMoveIssue={onMoveIssue}
          onReorderIssues={onReorderIssues}
          onImportIssuesFromPlane={onImportIssuesFromPlane}
        />
      ) : (
        <ParticipantsSidebarSection
          participants={participants}
          currentParticipantId={currentParticipantId}
          isCurrentParticipantMaster={isCurrentParticipantMaster}
          pendingParticipantActionId={pendingParticipantActionId}
          onRemoveParticipant={onRemoveParticipant}
        />
      )}
    </Box>
  );
};
