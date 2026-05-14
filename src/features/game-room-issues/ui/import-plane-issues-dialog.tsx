import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import { Button, TextField } from '@mui/material';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';

import type { ImportPlaneIssuesPayload } from '@entities/issue';
import { FormCard, FormDialog } from '@shared/ui/form-layout';
import formStyles from '@shared/ui/form-layout/form-layout.module.css';

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

    await onSubmit({
      apiKey,
      projectUrl,
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <FormDialog open={open} onClose={handleClose}>
      <FormCard
        badge="Plane import"
        title="Імпорт issues з Plane"
        subtitle="Введіть API key вашого акаунта Plane та посилання на проєкт, з якого потрібно імпортувати задачі."
        icon={<CloudUploadRoundedIcon fontSize="inherit" />}
        accent="blue"
        submitError={localError || errorMessage}
        onSubmit={handleSubmit}
        onClose={handleClose}
        actions={
          <>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              className={[formStyles.primaryButton, formStyles.primaryBlue].join(' ')}
            >
              {isSubmitting ? 'Імпортуємо...' : 'Імпортувати issues'}
            </Button>

            <Button
              type="button"
              variant="text"
              onClick={handleClose}
              disabled={isSubmitting}
              className={formStyles.secondaryButton}
            >
              Скасувати
            </Button>
          </>
        }
      >
        <TextField
          fullWidth
          label="Plane API key"
          placeholder="Наприклад, plane_api_xxxxxxxxx"
          value={values.apiKey}
          onChange={handleChange('apiKey')}
          variant="outlined"
          type="password"
          autoComplete="off"
          className={formStyles.field}
        />

        <TextField
          fullWidth
          label="Посилання на проєкт Plane"
          placeholder="https://app.plane.so/workspace/projects/project-id"
          value={values.projectUrl}
          onChange={handleChange('projectUrl')}
          variant="outlined"
          className={formStyles.field}
        />
      </FormCard>
    </FormDialog>
  );
};
