import { Box, Dialog } from '@mui/material';
import type { ReactNode } from 'react';

import styles from './form-layout.module.css';

type FormDialogProps = {
  open: boolean;
  children: ReactNode;
  onClose: () => void;
};

export const FormDialog = ({ open, children, onClose }: FormDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        className: styles.dialogPaper,
      }}
      BackdropProps={{
        className: styles.dialogBackdrop,
      }}
    >
      <Box className={styles.dialogRoot}>
        <Box className={styles.backdrop} />

        <Box className={styles.cardWrap}>
          <Box className={styles.cardColumn}>
            {children}
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};