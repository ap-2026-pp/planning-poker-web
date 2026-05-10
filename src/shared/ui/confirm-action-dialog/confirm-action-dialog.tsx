import { Box, Dialog, Typography } from '@mui/material';

import styles from './confirm-action-dialog.module.css';

type ConfirmActionDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onClose: () => void;
  onConfirm: () => void;
};

export const ConfirmActionDialog = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onClose,
  onConfirm,
}: ConfirmActionDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ className: styles.dialogPaper }}
    >
      <Box className={styles.dialogContent}>
        <Typography className={styles.dialogTitle}>{title}</Typography>
        <Typography className={styles.dialogDescription}>{description}</Typography>

        <Box className={styles.dialogActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className={styles.confirmButton}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </Box>
      </Box>
    </Dialog>
  );
};