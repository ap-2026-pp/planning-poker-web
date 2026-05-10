import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import {
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Collapse,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import type { CreateGamePayload, UpdateGamePayload } from '@entities/game';
import { VotingSystem } from '@entities/game';
import { createGameRequest, getGameRequest, updateGameRequest } from '@shared/api';
import { appRoutes } from '@shared/config/routes';
import { votingSystemOptions } from '@shared/model/voting';
import { FormCard } from '@shared/ui/form-layout';
import formStyles from '@shared/ui/form-layout/form-layout.module.css';
import { validateSchema, type FormErrors } from '@shared/utils/yup';
import { createGameSchema } from '../model/create-game-schema';
import styles from './create-game-form.module.css';

type GameFormMode = 'create' | 'edit';

type GameFormValues = UpdateGamePayload & {
  hostDisplayName: string;
};

type GameFormProps = {
  mode: GameFormMode;
  gameId?: string;
};

type LocationState = {
  from?: string;
};

const initialValues: GameFormValues = {
  name: '',
  hostDisplayName: '',
  votingSystem: VotingSystem.Fibonacci,
  autoRevealCards: true,
  showAverage: true,
  showCountdownAnimation: true,
  isActive: true,
};

const modeCopy = {
  create: {
    title: 'Створити гру',
    submitLabel: 'Створити сесію',
    submittingLabel: 'Створюємо...',
    errorLabel: 'Не вдалося створити гру',
    icon: <AddRoundedIcon fontSize="inherit" />,
  },
  edit: {
    title: 'Редагувати гру',
    submitLabel: 'Зберегти зміни',
    submittingLabel: 'Зберігаємо...',
    errorLabel: 'Не вдалося оновити гру',
    icon: <EditRoundedIcon fontSize="inherit" />,
  },
} satisfies Record<
  GameFormMode,
  {
    title: string;
    submitLabel: string;
    submittingLabel: string;
    errorLabel: string;
    icon: ReactNode;
  }
>;

export const GameForm = ({ mode, gameId }: GameFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as LocationState | null)?.from;

  const [values, setValues] = useState<GameFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<CreateGamePayload>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(mode === 'edit');
  const [advancedOpen, setAdvancedOpen] = useState(mode === 'edit');

  const handleClose = () => {
    navigate(from || appRoutes.myGames, { replace: true });
  };

  useEffect(() => {
    if (mode !== 'edit' || !gameId) {
      setLoadingInitial(false);
      return;
    }

    let isMounted = true;

    const loadGame = async () => {
      setLoadingInitial(true);
      setSubmitError(null);

      try {
        const game = await getGameRequest(gameId);

        if (!isMounted) {
          return;
        }

        setValues({
          name: game.name || '',
          hostDisplayName: '',
          votingSystem: game.votingSystem,
          autoRevealCards: game.autoRevealCards,
          showAverage: game.showAverage,
          showCountdownAnimation: game.showCountdownAnimation,
          isActive: game.isActive,
        });
      } catch (error) {
        if (isMounted) {
          setSubmitError(error instanceof Error ? error.message : 'Не вдалося завантажити гру');
        }
      } finally {
        if (isMounted) {
          setLoadingInitial(false);
        }
      }
    };

    void loadGame();

    return () => {
      isMounted = false;
    };
  }, [gameId, mode]);

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

      if (mode === 'create') {
        const createdGame = await createGameRequest({
          name: values.name.trim(),
          hostDisplayName: values.hostDisplayName.trim() || undefined,
          votingSystem: values.votingSystem,
          autoRevealCards: values.autoRevealCards,
          showAverage: values.showAverage,
          showCountdownAnimation: values.showCountdownAnimation,
        });

        await navigate(appRoutes.gameRoom(createdGame.id), {
          state: { from: from || appRoutes.myGames },
        });
        return;
      }

      if (!gameId) {
        throw new Error('Game id is required');
      }

      await updateGameRequest(gameId, {
        name: values.name.trim(),
        votingSystem: values.votingSystem,
        autoRevealCards: values.autoRevealCards,
        showAverage: values.showAverage,
        showCountdownAnimation: values.showCountdownAnimation,
        isActive: values.isActive,
      });

      await navigate(from || appRoutes.myGames);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : modeCopy[mode].errorLabel);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <Box className={[formStyles.card, formStyles.cardAccentPurple].join(' ')}>
        <Stack className={styles.loadingState} alignItems="center" justifyContent="center">
          <CircularProgress color="secondary" />
          <Typography className={styles.advancedHint}>Завантажуємо параметри гри…</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <FormCard
      title={modeCopy[mode].title}
      icon={modeCopy[mode].icon}
      accent="purple"
      submitError={submitError}
      onSubmit={handleSubmit}
      onClose={handleClose}
      actions={
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          className={[formStyles.primaryButton, formStyles.primaryPurple].join(' ')}
        >
          {submitting ? modeCopy[mode].submittingLabel : modeCopy[mode].submitLabel}
        </Button>
      }
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: mode === 'create' ? 7 : 12 }}>
          <TextField
            className={formStyles.field}
            label="Назва гри"
            value={values.name}
            onChange={handleTextChange('name')}
            error={Boolean(errors.name)}
            helperText={errors.name}
            fullWidth
            placeholder="Наприклад, Sprint 12 Planning"
          />
        </Grid>

        {mode === 'create' ? (
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              className={formStyles.field}
              label="Імʼя хоста (опціонально)"
              value={values.hostDisplayName}
              onChange={handleTextChange('hostDisplayName')}
              error={Boolean(errors.hostDisplayName)}
              helperText={errors.hostDisplayName}
              fullWidth
              placeholder="Як вас бачитиме команда"
            />
          </Grid>
        ) : null}

        <Grid size={{ xs: 12 }}>
          <TextField
            className={formStyles.field}
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
    </FormCard>
  );
};