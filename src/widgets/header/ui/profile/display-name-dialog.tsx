import { Alert, Button, Dialog, DialogContent, Stack, TextField, Typography } from '@mui/material';
import { type FormEvent } from 'react';

import styles from './profile-menu.module.css';

type DisplayNameDialogProps = {
  title: string;
  description: string;
  label: string;
  errorMessage: string | null;
  isOpen: boolean;
  isSubmitting: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export const DisplayNameDialog = ({
  title,
  description,
  label,
  errorMessage,
  isOpen,
  isSubmitting,
  value,
  onChange,
  onClose,
  onSubmit,
}: DisplayNameDialogProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} PaperProps={{ className: styles.dialogPaper }}>
      <DialogContent className={styles.dialogContent}>
        <Stack component="form" className={styles.dialogForm} onSubmit={handleSubmit}>
          <Stack className={styles.dialogHeader}>
            <Typography className={styles.dialogTitle}>{title}</Typography>
            <Typography className={styles.dialogDescription}>{description}</Typography>
          </Stack>

          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <TextField
            autoFocus
            label={label}
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