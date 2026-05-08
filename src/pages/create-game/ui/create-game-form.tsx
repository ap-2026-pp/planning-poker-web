import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Collapse,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import type { CreateGamePayload } from '@entities/game';
import { VotingSystem } from '@entities/game';
import { createGameRequest } from '@shared/api';
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
  const [values, setValues] = useState<CreateGameFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<CreateGameFormValues>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

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
    <Box className={styles.card}>
      <Stack component="form" className={styles.form} onSubmit={handleSubmit}>
        <Stack className={styles.intro}>
          <Box className={[styles.iconShell, styles.iconPurple].join(' ')}>
            <AddRoundedIcon fontSize="inherit" />
          </Box>

          <Typography className={styles.title}>Створити гру</Typography>
        </Stack>

        {submitError ? (
          <Alert severity="error" className={styles.alert}>
            {submitError}
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <TextField
              className={styles.field}
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
              className={styles.field}
              label="Імʼя хоста (опціонально)"
              value={values.hostDisplayName}
              onChange={handleTextChange('hostDisplayName')}
              error={Boolean(errors.hostDisplayName)}
              helperText={errors.hostDisplayName}
              fullWidth
              placeholder="Як вас бачитиме команда"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              className={styles.field}
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

        <Box className={styles.advancedSection}>
          <ButtonBase
            className={styles.advancedToggle}
            onClick={() => setAdvancedOpen((current) => !current)}
          >
            <Stack className={styles.advancedCopy}>
              <Typography className={styles.advancedTitle}>Додаткові налаштування</Typography>
              <Typography className={styles.advancedHint}>
                Автовідкриття оцінок, середнє значення та countdown перед reveal.
              </Typography>
            </Stack>

            <ExpandMoreRoundedIcon
              className={[
                styles.advancedIcon,
                advancedOpen ? styles.advancedIconExpanded : '',
              ]
                .join(' ')
                .trim()}
            />
          </ButtonBase>

          <Collapse in={advancedOpen} timeout={220}>
            <Stack className={styles.optionsPanel}>
              <Box className={styles.optionRow}>
                <Stack className={styles.optionCopy}>
                  <Typography className={styles.optionTitle}>
                    Автоматично відкривати оцінки
                  </Typography>
                  <Typography className={styles.optionHint}>
                    Після завершення раунду оцінки покажуться всім одразу.
                  </Typography>
                </Stack>

                <Switch
                  checked={values.autoRevealCards}
                  onChange={handleSwitchChange('autoRevealCards')}
                  className={styles.optionSwitch}
                />
              </Box>

              <Box className={styles.optionRow}>
                <Stack className={styles.optionCopy}>
                  <Typography className={styles.optionTitle}>Показувати середнє значення</Typography>
                  <Typography className={styles.optionHint}>
                    Команда бачитиме average після відкриття карток.
                  </Typography>
                </Stack>

                <Switch
                  checked={values.showAverage}
                  onChange={handleSwitchChange('showAverage')}
                  className={styles.optionSwitch}
                />
              </Box>

              <Box className={styles.optionRow}>
                <Stack className={styles.optionCopy}>
                  <Typography className={styles.optionTitle}>
                    Короткий countdown перед reveal
                  </Typography>
                  <Typography className={styles.optionHint}>
                    Додає невеликий відлік перед одночасним відкриттям оцінок.
                  </Typography>
                </Stack>

                <Switch
                  checked={values.showCountdownAnimation}
                  onChange={handleSwitchChange('showCountdownAnimation')}
                  className={styles.optionSwitch}
                />
              </Box>
            </Stack>
          </Collapse>
        </Box>

        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          className={[styles.primaryButton, styles.primaryPurple].join(' ')}
        >
          {submitting ? 'Створюємо...' : 'Створити сесію'}
        </Button>
      </Stack>
    </Box>
  );
};
