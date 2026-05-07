import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { joinGameRequest } from '@shared/api';
import { useSession } from '@shared/auth';
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
  const { isAuthenticated } = useSession();
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
      const nextErrors = await validateSchema(joinGameSchema, values);

      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        return;
      }

      const game = await joinGameRequest(values.inviteCode, {
        displayName: values.displayName || undefined,
      });

      await navigate(appRoutes.gameRoom(game.id));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не вдалося приєднатися до гри');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className={styles.content}>
        <Stack component="form" className={styles.form} onSubmit={handleSubmit}>
          <Stack className={styles.intro}>
            <Typography variant="h5">Приєднатися до гри</Typography>
            <Typography variant="body2" color="text.secondary">
              Уведіть код кімнати й заходьте в сесію разом з командою.
            </Typography>
          </Stack>

          {!isAuthenticated ? (
            <Alert severity="info">
              Для входу в кімнату потрібно спочатку увійти в акаунт.
            </Alert>
          ) : null}

          {submitError ? <Alert severity="error">{submitError}</Alert> : null}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Код кімнати"
                value={values.inviteCode}
                onChange={handleFieldChange('inviteCode')}
                error={Boolean(errors.inviteCode)}
                helperText={errors.inviteCode}
                fullWidth
                placeholder="Наприклад, TEAM-248"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Імʼя в кімнаті"
                value={values.displayName}
                onChange={handleFieldChange('displayName')}
                error={Boolean(errors.displayName)}
                helperText={errors.displayName}
                fullWidth
                placeholder="Як вас бачитиме команда"
              />
            </Grid>
          </Grid>

          <Button type="submit" variant="contained" color="secondary" disabled={submitting || !isAuthenticated}>
            {submitting ? 'Заходимо...' : 'Увійти в кімнату'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
