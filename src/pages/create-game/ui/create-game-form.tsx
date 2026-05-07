import {
  Alert,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import type { CreateGamePayload } from '@entities/game';
import { VotingSystem } from '@entities/game';
import { createGameRequest } from '@shared/api';
import { useSession } from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import { votingSystemOptions } from '@shared/model/voting';
import { validateSchema, type FormErrors } from '@shared/utils/yup';
import { createGameSchema } from '../model/create-game-schema';
import styles from './create-game-form.module.css';

type CreateGameFormValues = CreateGamePayload;

const initialValues: CreateGameFormValues = {
  name: '',
  hostDisplayName: '',
  votingSystem: VotingSystem.Fibonacci,
  autoRevealCards: true,
  showAverage: true,
  showCountdownAnimation: true,
};

export const CreateGameForm = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSession();
  const [values, setValues] = useState<CreateGameFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<CreateGameFormValues>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleTextChange =
    (field: 'name' | 'hostDisplayName') => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setSubmitError(null);
    };

  const handleSwitchChange =
    (field: 'autoRevealCards' | 'showAverage' | 'showCountdownAnimation') =>
    (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setValues((current) => ({ ...current, [field]: checked }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const nextErrors = await validateSchema(createGameSchema, values);

      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        return;
      }

      const createdGame = await createGameRequest(values);
      await navigate(appRoutes.gameRoom(createdGame.id));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не вдалося створити гру');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className={styles.content}>
        <Stack component="form" className={styles.form} onSubmit={handleSubmit}>
          <Stack className={styles.intro}>
            <Typography variant="h5">Параметри сесії</Typography>
            <Typography variant="body2" color="text.secondary">
              Налаштуйте кімнату так, як вам зручно для наступного обговорення задач.
            </Typography>
          </Stack>

          {!isAuthenticated ? (
            <Alert severity="info">
              Щоб створити сесію, спочатку увійдіть або створіть акаунт.
            </Alert>
          ) : null}

          {submitError ? <Alert severity="error">{submitError}</Alert> : null}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 7 }}>
              <TextField
                label="Назва гри"
                value={values.name}
                onChange={handleTextChange('name')}
                error={Boolean(errors.name)}
                helperText={errors.name}
                fullWidth
                placeholder="Наприклад, Sprint 12 Planning"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                label="Імʼя хоста"
                value={values.hostDisplayName}
                onChange={handleTextChange('hostDisplayName')}
                error={Boolean(errors.hostDisplayName)}
                helperText={errors.hostDisplayName}
                fullWidth
                placeholder="Ваше ім’я в кімнаті"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                label="Формат карт"
                value={values.votingSystem}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    votingSystem: Number(event.target.value) as VotingSystem,
                  }))
                }
                fullWidth
              >
                {votingSystemOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label} · {option.hint}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Stack className={styles.toggles}>
            <FormControlLabel
              control={
                <Switch
                  checked={values.autoRevealCards}
                  onChange={handleSwitchChange('autoRevealCards')}
                />
              }
              label="Автоматично відкривати оцінки після завершення раунду"
            />
            <FormControlLabel
              control={
                <Switch checked={values.showAverage} onChange={handleSwitchChange('showAverage')} />
              }
              label="Показувати середнє значення команді"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={values.showCountdownAnimation}
                  onChange={handleSwitchChange('showCountdownAnimation')}
                />
              }
              label="Показувати короткий відлік перед відкриттям оцінок"
            />
          </Stack>

          <Button type="submit" variant="contained" disabled={submitting || !isAuthenticated}>
            {submitting ? 'Створюємо...' : 'Створити сесію'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
