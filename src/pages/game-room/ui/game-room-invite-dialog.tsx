import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import styles from './game-room-dialogs.module.css';

type GameRoomInviteDialogProps = {
  open: boolean;
  inviteUrl: string;
  inviteCode: string;
  copiedItem: 'code' | 'invite-link' | null;
  hasQrCode: boolean;
  onClose: () => void;
  onCopyInviteLink: () => Promise<void>;
  onCopyCode: () => Promise<void>;
  onOpenQrDialog: () => void;
};

export const GameRoomInviteDialog = ({
  open,
  inviteUrl,
  inviteCode,
  copiedItem,
  hasQrCode,
  onClose,
  onCopyInviteLink,
  onCopyCode,
  onOpenQrDialog,
}: GameRoomInviteDialogProps) => (
  <Dialog open={open} onClose={onClose} PaperProps={{ className: styles.dialogPaper }}>
    <DialogTitle className={styles.dialogHeader}>
      <Typography className={styles.dialogTitle}>Запросити гравців</Typography>

      <IconButton className={styles.dialogCloseButton} onClick={onClose} aria-label="Close invite dialog">
        <CloseRoundedIcon />
      </IconButton>
    </DialogTitle>

    <DialogContent className={styles.dialogContent}>
      <Box className={styles.dialogBlock}>
        <Typography className={styles.dialogLabel}>Посилання на гру</Typography>

        <Box className={styles.dialogValueCard}>
          <Typography className={styles.dialogValueText}>
            {inviteUrl || 'Посилання ще генерується'}
          </Typography>
        </Box>
      </Box>

      <Box className={styles.dialogBlock}>
        <Typography className={styles.dialogLabel}>Код кімнати</Typography>

        <button type="button" className={styles.dialogCodeButton} onClick={() => void onCopyCode()}>
          {copiedItem === 'code' ? 'Код скопійовано' : inviteCode}
        </button>
      </Box>

      <Stack direction="row" className={styles.dialogActions}>
        <Button
          variant="contained"
          startIcon={<ContentCopyRoundedIcon />}
          onClick={() => void onCopyInviteLink()}
          className={styles.dialogPrimaryButton}
        >
          {copiedItem === 'invite-link' ? 'Посилання скопійовано' : 'Копіювати посилання'}
        </Button>

        <Button
          variant="outlined"
          onClick={onOpenQrDialog}
          disabled={!hasQrCode}
          className={styles.dialogSecondaryButton}
        >
          Приєднатись за QR
        </Button>
      </Stack>
    </DialogContent>
  </Dialog>
);
