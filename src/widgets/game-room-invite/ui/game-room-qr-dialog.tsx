import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';

import styles from './game-room-dialogs.module.css';

type GameRoomQrDialogProps = {
  open: boolean;
  qrCodeImage: string;
  copiedItem: 'code' | 'invite-link' | null;
  onClose: () => void;
  onCopyInviteLink: () => Promise<void>;
};

export const GameRoomQrDialog = ({
  open,
  qrCodeImage,
  copiedItem,
  onClose,
  onCopyInviteLink,
}: GameRoomQrDialogProps) => (
  <Dialog open={open} onClose={onClose} PaperProps={{ className: styles.qrDialogPaper }}>
    <DialogTitle className={styles.dialogHeader}>
      <Typography className={styles.dialogTitle}>QR для приєднання</Typography>

      <IconButton className={styles.dialogCloseButton} onClick={onClose} aria-label="Close QR dialog">
        <CloseRoundedIcon />
      </IconButton>
    </DialogTitle>

    <DialogContent className={styles.qrDialogContent}>
      {qrCodeImage ? (
        <Box component="img" src={qrCodeImage} alt="QR code to join the room" className={styles.qrImage} />
      ) : (
        <Typography className={styles.dialogMutedText}>QR-код ще не готовий.</Typography>
      )}

      <Typography className={styles.dialogMutedText}>
        Скануйте код або надішліть команді посилання на кімнату.
      </Typography>

      <Button
        variant="contained"
        startIcon={<ContentCopyRoundedIcon />}
        onClick={() => void onCopyInviteLink()}
        className={styles.dialogPrimaryButton}
      >
        {copiedItem === 'invite-link' ? 'Посилання скопійовано' : 'Копіювати посилання'}
      </Button>
    </DialogContent>
  </Dialog>
);
