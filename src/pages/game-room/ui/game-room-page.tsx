import { Alert, Box, Drawer, Snackbar, Stack } from '@mui/material';

import { useGameRoomPage } from '../model/use-game-room-page';
import { GameRoomInviteDialog } from './game-room-invite-dialog';
import { GameRoomQrDialog } from './game-room-qr-dialog';
import { GameRoomSurface } from './game-room-surface';
import { GameRoomSidebar } from './game-room-sidebar';
import styles from './game-room-page.module.css';

export const GameRoomPage = () => {
  const room = useGameRoomPage();

  return (
    <Stack className={styles.root}>
      {room.loading ? <Alert severity="info">Завантажую кімнату...</Alert> : null}
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
            onSidebarViewChange={room.setSidebarView}
            onClose={room.closeSidebar}
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

      <Snackbar
        open={Boolean(room.notification)}
        autoHideDuration={3200}
        onClose={room.closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={room.closeNotification}
          severity={room.notification?.tone ?? 'info'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {room.notification?.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};
