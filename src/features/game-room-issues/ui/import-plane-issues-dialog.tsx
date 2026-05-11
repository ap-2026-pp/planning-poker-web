import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import { Alert, Box, Button, Dialog, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';

import type { ImportPlaneIssuesPayload } from '@entities/issue';
import formStyles from '@shared/ui/form-layout/form-layout.module.css';
import styles from '@widgets/game-room-sidebar/ui/game-room-sidebar.module.css';

type ImportPlaneIssuesDialogProps = {
  open: boolean;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (payload: ImportPlaneIssuesPayload) => Promise<void>;
};

const initialValues: ImportPlaneIssuesPayload = {
  apiKey: '',
  projectUrl: '',
};

export const ImportPlaneIssuesDialog = ({
  open,
  isSubmitting = false,
  errorMessage,
  onClose,
  onSubmit,
}: ImportPlaneIssuesDialogProps) => {
  const [values, setValues] = useState<ImportPlaneIssuesPayload>(initialValues);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setValues(initialValues);
      setLocalError(null);
    }
  }, [open]);

  const handleChange =
    (field: keyof ImportPlaneIssuesPayload) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));

      setLocalError(null);
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const apiKey = values.apiKey.trim();
    const projectUrl = values.projectUrl.trim();

    if (!apiKey || !projectUrl) {
      setLocalError('Вкажіть API key та посилання на проєкт Plane.');
      return;
    }

    try {
      await onSubmit({
        apiKey,
        projectUrl,
      });
    } catch {
      // помилка вже може прийти зверху через errorMessage
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth={false}
      PaperProps={{
        className: styles.issueDialogPaper,
      }}
      BackdropProps={{
        className: styles.issueDialogBackdrop,
      }}
    >
      <Box className={styles.issueDialogRoot}>
        <Box className={styles.issueDialogGlow}>
          <Box className={styles.issueDialogBody}>
            <Box
              component="form"
              onSubmit={handleSubmit}
              className={[styles.issueFormCard, styles.issueFormCardDialog].join(' ')}
            >
              <Stack className={styles.issueFormIntro}>
                <Box className={styles.issueFormIconShellBlue}>
                  <CloudUploadRoundedIcon fontSize="inherit" />
                </Box>

                <Typography className={styles.issueFormTitle}>
                  Імпорт issues з Plane
                </Typography>

                <Typography className={styles.issueFormSubtitle}>
                  Введіть API key вашого акаунта Plane та посилання на проєкт, з якого потрібно імпортувати задачі.
                </Typography>
              </Stack>

              {localError || errorMessage ? (
                <Alert severity="error" className={formStyles.alert}>
                  {localError || errorMessage}
                </Alert>
              ) : null}

              <TextField
                fullWidth
                label="Plane API key"
                placeholder="Наприклад, plane_api_xxxxxxxxx"
                value={values.apiKey}
                onChange={handleChange('apiKey')}
                variant="outlined"
                type="password"
                autoComplete="off"
                className={[formStyles.field, styles.issueFieldBlue].join(' ')}
              />

              <TextField
                fullWidth
                label="Посилання на проєкт Plane"
                placeholder="https://app.plane.so/workspace/projects/project-id"
                value={values.projectUrl}
                onChange={handleChange('projectUrl')}
                variant="outlined"
                className={[formStyles.field, styles.issueFieldBlue].join(' ')}
              />

              <Box className={styles.issueFormActions}>
                <button
                  type="button"
                  className={styles.issueSecondaryButton}
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  className={[formStyles.primaryButton, formStyles.primaryBlue].join(' ')}
                >
                  {isSubmitting ? 'Importing...' : 'Import issues'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};