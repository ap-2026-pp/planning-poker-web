import { Alert, Box, Dialog, Drawer, Snackbar, Stack } from '@mui/material';
import { useCallback, useEffect, useState, type MouseEvent } from 'react';

import { ConnectionStatus } from '@features/connection-status';
import { GameForm } from '@features/game-settings';
import { GameRoomInviteDialog, GameRoomQrDialog } from '@widgets/game-room-invite';
import { GameRoomSidebar } from '@widgets/game-room-sidebar';
import { GameRoomSurface } from '@widgets/game-room-surface';
import { useGameRoomPage } from '../model/use-game-room-page';
import styles from './game-room-page.module.css';

const SIDEBAR_MIN_WIDTH = 360;
const SIDEBAR_DEFAULT_WIDTH = 420;
const SIDEBAR_MAX_WIDTH = 720;

export const GameRoomPage = () => {
  const room = useGameRoomPage();

  const [showLoading, setShowLoading] = useState(false);
  const [isEditGameOpen, setEditGameOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);

  useEffect(() => {
    if (room.loading) {
      const timer = window.setTimeout(() => setShowLoading(true), 300);

      return () => window.clearTimeout(timer);
    }

    setShowLoading(false);
  }, [room.loading]);

  const handleStartSidebarResize = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.preventDefault();

      const startX = event.clientX;
      const startWidth = sidebarWidth;
      const maxWidth = Math.min(SIDEBAR_MAX_WIDTH, window.innerWidth - 48);

      const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
        const deltaX = startX - moveEvent.clientX;

        const nextWidth = Math.min(
          maxWidth,
          Math.max(SIDEBAR_MIN_WIDTH, startWidth + deltaX),
        );

        setSidebarWidth(nextWidth);
      };

      const handleMouseUp = () => {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [sidebarWidth],
  );

  return (
    <Stack className={styles.root}>
      <ConnectionStatus status={room.connectionStatus} onRetry={room.retryConnection} />

      {showLoading ? <Alert severity="info">Завантажую кімнату...</Alert> : null}

      {room.error ? <Alert severity="warning">{room.error}</Alert> : null}

      <Box className={styles.mainColumn}>
        <GameRoomSurface
          inviteCode={room.inviteCode}
          copiedItem={room.copiedItem}
          onlineParticipantsCount={room.onlineParticipantsCount}
          currentParticipantId={room.currentParticipantId}
          isCurrentParticipantMaster={room.isCurrentParticipantMaster}
          canRevealCards={room.canRevealCards}
          selectedParticipantId={room.selectedParticipantId}
          pendingParticipantActionId={room.pendingParticipantActionId}
          votingSystemLabel={room.votingSystemLabel}
          roundLabel={room.roundLabel}
          activeIssue={room.activeIssue}
          positionedParticipants={room.positionedParticipants}
          overflowParticipants={room.overflowParticipants}
          deckValues={room.deckValues}
          onCopyCode={() => room.copyText(room.inviteCode, 'code')}
          onParticipantSelect={room.selectParticipant}
          onRemoveParticipant={room.removeParticipant}
          onTransferMaster={room.transferMaster}
          onOpenGameSettings={() => setEditGameOpen(true)}
        />
      </Box>

      <Drawer
        anchor="right"
        open={room.isSidebarOpen}
        onClose={room.closeSidebar}
        PaperProps={{
          className: styles.sidebarDrawerPaper,
          style: {
            width: `min(${sidebarWidth}px, 100vw)`,
          },
        }}
      >
        <Box className={styles.sidebarDrawerBody}>
          <Box
            className={styles.sidebarResizeHandle}
            onMouseDown={handleStartSidebarResize}
            aria-hidden="true"
          />

          <GameRoomSidebar
            sidebarView={room.sidebarView}
            issues={room.sortedIssues}
            participants={room.sidebarParticipants}
            currentParticipantId={room.currentParticipantId}
            isCurrentParticipantMaster={room.isCurrentParticipantMaster}
            canManageIssues={room.canManageIssues}
            canRevealCards={room.canRevealCards}
            pendingParticipantActionId={room.pendingParticipantActionId}
            onSidebarViewChange={room.setSidebarView}
            onClose={room.closeSidebar}
            onRemoveParticipant={room.removeParticipant}
            onAddIssue={room.addIssue}
            onUpdateIssue={room.updateIssue}
            onDeleteIssue={room.deleteIssue}
            onDeleteAllIssues={room.deleteAllIssues}
            onExportIssuesAsCsv={room.exportIssuesAsCsv}
            onImportIssuesFromPlane={room.importIssuesFromPlane}
            onSetIssueActive={room.setIssueActive}
            onMoveIssue={room.reorderIssue}
            onReorderIssues={room.reorderIssues}
          />
        </Box>
      </Drawer>

      <GameRoomInviteDialog
        open={room.isInviteDialogOpen}
        inviteUrl={room.inviteUrl}
        inviteCode={room.inviteCode}
        copiedItem={room.copiedItem}
        hasQrCode={Boolean(room.qrCodeImage)}
        onClose={room.closeInviteDialog}
        onCopyInviteLink={() => room.copyText(room.inviteUrl, 'invite-link')}
        onCopyCode={() => room.copyText(room.inviteCode, 'code')}
        onOpenQrDialog={room.openQrDialog}
      />

      <GameRoomQrDialog
        open={room.isQrDialogOpen}
        qrCodeImage={room.qrCodeImage}
        copiedItem={room.copiedItem}
        onClose={room.closeQrDialog}
        onCopyInviteLink={() => room.copyText(room.inviteUrl, 'invite-link')}
      />

      <Dialog
        open={isEditGameOpen}
        onClose={() => setEditGameOpen(false)}
        maxWidth={false}
        PaperProps={{
          className: styles.editGameDialogPaper,
        }}
        BackdropProps={{
          className: styles.editGameDialogBackdrop,
        }}
      >
        <Box className={styles.editGameDialogGlow}>
          <Box className={styles.editGameDialogBody}>
            <GameForm
              mode="edit"
              gameId={room.gameId}
              onClose={() => setEditGameOpen(false)}
              onSaved={() => {
                setEditGameOpen(false);
                void room.reloadRoom?.();
              }}
            />
          </Box>
        </Box>
      </Dialog>

      <Snackbar
        open={Boolean(room.notification)}
        autoHideDuration={3200}
        onClose={room.closeNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          mt: '88px',
          mr: '10px',
        }}
      >
        <Alert
          onClose={room.closeNotification}
          severity={room.notification?.tone ?? 'info'}
          variant="filled"
          sx={{
            minWidth: 320,
            maxWidth: 420,
            width: 'auto',
            borderRadius: '14px',
          }}
        >
          {room.notification?.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};
