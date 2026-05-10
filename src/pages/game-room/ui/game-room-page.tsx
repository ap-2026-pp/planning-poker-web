import { Alert, Box, Dialog, Drawer, Snackbar, Stack } from '@mui/material';
import { useEffect, useState } from 'react';

import { ConnectionStatus } from '@features/connection-status';
import { GameRoomInviteDialog, GameRoomQrDialog } from '@widgets/game-room-invite';
import { GameRoomSidebar } from '@widgets/game-room-sidebar';
import { GameRoomSurface } from '@widgets/game-room-surface';
import { GameForm } from '@pages/create-game/ui/game-form';
import { useGameRoomPage } from '../model/use-game-room-page';
import styles from './game-room-page.module.css';

export const GameRoomPage = () => {
  const room = useGameRoomPage();
  const [showLoading, setShowLoading] = useState(false);
  const [isEditGameOpen, setEditGameOpen] = useState(false);

  useEffect(() => {
    if (room.loading) {
      const timer = window.setTimeout(() => setShowLoading(true), 300);

      return () => window.clearTimeout(timer);
    }

    setShowLoading(false);
  }, [room.loading]);

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
        PaperProps={{ className: styles.sidebarDrawerPaper }}
      >
        <Box className={styles.sidebarDrawerBody}>
          <GameRoomSidebar
            sidebarView={room.sidebarView}
            issues={room.sortedIssues}
            participants={room.sortedParticipants}
            currentParticipantId={room.currentParticipantId}
            isCurrentParticipantMaster={room.isCurrentParticipantMaster}
            pendingParticipantActionId={room.pendingParticipantActionId}
            onSidebarViewChange={room.setSidebarView}
            onClose={room.closeSidebar}
            onRemoveParticipant={room.removeParticipant}
            onAddIssue={room.addIssue}
            onUpdateIssue={room.updateIssue}
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
        PaperProps={{ className: styles.editGameDialogPaper }}
      >
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