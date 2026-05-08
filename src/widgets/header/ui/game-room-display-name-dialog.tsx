import { Alert, Button, Dialog, DialogContent, Stack, TextField, Typography } from '@mui/material';
import { type FormEvent } from 'react';

import styles from './game-room-profile-menu.module.css';

type GameRoomDisplayNameDialogProps = {
  errorMessage: string | null;
  isOpen: boolean;
  isSubmitting: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export const GameRoomDisplayNameDialog = ({
  errorMessage,
  isOpen,
  isSubmitting,
  value,
  onChange,
  onClose,
  onSubmit,
}: GameRoomDisplayNameDialogProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} PaperProps={{ className: styles.dialogPaper }}>
      <DialogContent className={styles.dialogContent}>
        <Stack component="form" className={styles.dialogForm} onSubmit={handleSubmit}>
          <Stack className={styles.dialogHeader}>
            <Typography className={styles.dialogTitle}>Змінити імʼя в кімнаті</Typography>
            <Typography className={styles.dialogDescription}>
              Оновіть нікнейм, під яким вас бачать у цій грі.
            </Typography>
          </Stack>

          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <TextField
            autoFocus
            label="Імʼя в кімнаті"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            fullWidth
            className={styles.field}
          />

          <Stack direction="row" className={styles.dialogActions}>
            <Button variant="outlined" onClick={onClose} className={styles.cancelButton}>
              Скасувати
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting} className={styles.submitButton}>
              {isSubmitting ? 'Зберігаємо...' : 'Зберегти'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
