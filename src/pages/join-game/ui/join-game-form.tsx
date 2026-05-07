import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { joinGameRequest } from '@shared/api';
import { clearGuestAccessToken, setGuestAccessToken } from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import { validateSchema, type FormErrors } from '@shared/utils/yup';
import { joinGameSchema } from '../model/join-game-schema';
import styles from './join-game-form.module.css';

type JoinGameFormValues = {
  inviteCode: string;
  displayName: string;
};

const initialValues: JoinGameFormValues = {
  inviteCode: '',
  displayName: '',
};

export const JoinGameForm = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors<JoinGameFormValues>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFieldChange =
    (field: keyof JoinGameFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setSubmitError(null);
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const normalizedValues = {
        inviteCode: values.inviteCode.trim(),
        displayName: values.displayName.trim(),
      };

      const nextErrors = await validateSchema(joinGameSchema, normalizedValues);

      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        return;
      }

      const response = await joinGameRequest(normalizedValues.inviteCode, {
        displayName: normalizedValues.displayName || undefined,
      });

      if (response.guestAccessToken) {
        setGuestAccessToken(response.guestAccessToken);
      } else {
        clearGuestAccessToken();
      }

      await navigate(appRoutes.gameRoom(response.game.id));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не вдалося приєднатися до гри');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className={styles.card}>
      <Stack component="form" className={styles.form} onSubmit={handleSubmit}>
        <Stack className={styles.intro}>
          <Box className={[styles.iconShell, styles.iconBlue].join(' ')}>
            <ArrowForwardRoundedIcon fontSize="inherit" />
          </Box>

          <Typography className={styles.title}>Приєднатися до гри</Typography>
        </Stack>

        {submitError ? (
          <Alert severity="error" className={styles.alert}>
            {submitError}
          </Alert>
        ) : null}

        <TextField
          className={styles.field}
          label="Код кімнати"
          value={values.inviteCode}
          onChange={handleFieldChange('inviteCode')}
          error={Boolean(errors.inviteCode)}
          helperText={errors.inviteCode}
          placeholder="Наприклад, TEAM-248"
        />

        <TextField
          className={styles.field}
          label="Імʼя в кімнаті (опціонально)"
          value={values.displayName}
          onChange={handleFieldChange('displayName')}
          error={Boolean(errors.displayName)}
          helperText={errors.displayName}
          placeholder="Як вас бачитиме команда"
        />

        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          className={[styles.primaryButton, styles.primaryBlue].join(' ')}
        >
          {submitting ? 'Заходимо...' : 'Увійти в кімнату'}
        </Button>
      </Stack>
    </Box>
  );
};
