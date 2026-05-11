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
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import type { CreateGamePayload, UpdateGamePayload } from '@entities/game';
import { IssuesPolicy, RevealPolicy, VotingSystem } from '@entities/game';
import type { GameParticipant } from '@entities/participant';
import {
  createGameRequest,
  getGameRequest,
  getParticipantsRequest,
  updateGameRequest,
} from '@shared/api';
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
  revealParticipantIds: string[];
  manageIssuesParticipantIds: string[];
};

type GameFormProps = {
  mode: GameFormMode;
  gameId?: string;
  onClose?: () => void;
  onSaved?: () => void;
};

type LocationState = {
  from?: string;
};

const MASTER_ONLY_VALUE = '__master_only__';
const EVERYONE_VALUE = '__everyone__';

const initialValues: GameFormValues = {
  name: '',
  hostDisplayName: '',
  votingSystem: VotingSystem.Fibonacci,
  revealPolicy: RevealPolicy.MasterOnly,
  issuesPolicy: IssuesPolicy.MasterOnly,
  autoRevealCards: true,
  showAverage: true,
  showCountdownAnimation: true,
  isActive: true,
  enableFunFeatures: true,
  revealParticipantIds: [],
  manageIssuesParticipantIds: [],
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

const getMultiSelectValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === 'string') {
    return value.split(',').filter(Boolean);
  }

  return [];
};

const getAccessSelectValue = (
  policy: RevealPolicy | IssuesPolicy,
  selectedParticipantIds: string[],
) => {
  if (policy === RevealPolicy.Everyone || policy === IssuesPolicy.Everyone) {
    return [EVERYONE_VALUE];
  }

  if (
    policy === RevealPolicy.SpecificParticipants ||
    policy === IssuesPolicy.SpecificParticipants
  ) {
    return selectedParticipantIds.length ? selectedParticipantIds : [MASTER_ONLY_VALUE];
  }

  return [MASTER_ONLY_VALUE];
};

const getParticipantNameById = (
  participants: GameParticipant[],
  participantId: string,
) => {
  return participants.find((participant) => participant.id === participantId)?.displayName;
};

const renderAccessValue = (
  selected: unknown,
  participants: GameParticipant[],
) => {
  const selectedValues = getMultiSelectValue(selected);

  if (selectedValues.includes(EVERYONE_VALUE)) {
    return 'Усі учасники';
  }

  if (
    selectedValues.includes(MASTER_ONLY_VALUE) ||
    selectedValues.length === 0
  ) {
    return 'Тільки master';
  }

  const names = selectedValues
    .map((id) => getParticipantNameById(participants, id))
    .filter(Boolean);

  return names.length ? names.join(', ') : 'Тільки master';
};

const getNextAccessState = <
  TPolicy extends RevealPolicy | IssuesPolicy,
>(
  rawValue: unknown,
  currentParticipantIds: string[],
  specificPolicy: TPolicy,
  everyonePolicy: TPolicy,
  masterOnlyPolicy: TPolicy,
) => {
  const selectedValues = getMultiSelectValue(rawValue);

  const selectedEveryone = selectedValues.includes(EVERYONE_VALUE);
  const selectedMasterOnly = selectedValues.includes(MASTER_ONLY_VALUE);

  if (selectedEveryone) {
    return {
      policy: everyonePolicy,
      participantIds: [],
    };
  }

  if (selectedMasterOnly) {
    return {
      policy: masterOnlyPolicy,
      participantIds: [],
    };
  }

  const participantIds = selectedValues.filter(
    (value) => value !== EVERYONE_VALUE && value !== MASTER_ONLY_VALUE,
  );

  if (!participantIds.length) {
    return {
      policy: masterOnlyPolicy,
      participantIds: [],
    };
  }

  return {
    policy: specificPolicy,
    participantIds,
  };
};

export const GameForm = ({ mode, gameId, onClose, onSaved }: GameFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as LocationState | null)?.from;

  const [values, setValues] = useState<GameFormValues>(initialValues);
  const [participants, setParticipants] = useState<GameParticipant[]>([]);
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
        const [game, gameParticipants] = await Promise.all([
          getGameRequest(gameId),
          getParticipantsRequest(gameId),
        ]);

        if (!isMounted) {
          return;
        }

        setParticipants(gameParticipants);

        setValues({
          name: game.name || '',
          hostDisplayName: '',
          revealPolicy: game.revealPolicy,
          issuesPolicy: game.issuesPolicy,
          votingSystem: game.votingSystem,
          autoRevealCards: game.autoRevealCards,
          showAverage: game.showAverage,
          showCountdownAnimation: game.showCountdownAnimation,
          isActive: game.isActive,
          enableFunFeatures: game.enableFunFeatures,
          revealParticipantIds: gameParticipants
            .filter((participant) => participant.canRevealCards)
            .map((participant) => participant.id),
          manageIssuesParticipantIds: gameParticipants
            .filter((participant) => participant.canManageIssues)
            .map((participant) => participant.id),
        });
      } catch (error) {
        if (isMounted) {
          setSubmitError(
            error instanceof Error
              ? error.message
              : 'Не вдалося завантажити гру',
          );
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
    (field: 'name' | 'hostDisplayName') =>
      (event: ChangeEvent<HTMLInputElement>) => {
        setValues((current) => ({ ...current, [field]: event.target.value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
        setSubmitError(null);
      };

  const handleBooleanSwitchChange =
    (
      field:
        | 'autoRevealCards'
        | 'showAverage'
        | 'showCountdownAnimation'
        | 'enableFunFeatures',
    ) =>
      (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setValues((current) => ({ ...current, [field]: checked }));
        setSubmitError(null);
      };

  const handleRevealAccessChange = (rawValue: unknown) => {
    setValues((current) => {
      const nextAccess = getNextAccessState(
        rawValue,
        current.revealParticipantIds,
        RevealPolicy.SpecificParticipants,
        RevealPolicy.Everyone,
        RevealPolicy.MasterOnly,
      );

      return {
        ...current,
        revealPolicy: nextAccess.policy,
        revealParticipantIds: nextAccess.participantIds,
      };
    });

    setSubmitError(null);
  };

  const handleIssuesAccessChange = (rawValue: unknown) => {
    setValues((current) => {
      const nextAccess = getNextAccessState(
        rawValue,
        current.manageIssuesParticipantIds,
        IssuesPolicy.SpecificParticipants,
        IssuesPolicy.Everyone,
        IssuesPolicy.MasterOnly,
      );

      return {
        ...current,
        issuesPolicy: nextAccess.policy,
        manageIssuesParticipantIds: nextAccess.participantIds,
      };
    });

    setSubmitError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

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
          revealPolicy: values.revealPolicy,
          issuesPolicy: values.issuesPolicy,
          votingSystem: values.votingSystem,
          autoRevealCards: values.autoRevealCards,
          showAverage: values.showAverage,
          showCountdownAnimation: values.showCountdownAnimation,
          enableFunFeatures: values.enableFunFeatures,
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
        revealPolicy: values.revealPolicy,
        issuesPolicy: values.issuesPolicy,
        autoRevealCards: values.autoRevealCards,
        showAverage: values.showAverage,
        showCountdownAnimation: values.showCountdownAnimation,
        isActive: values.isActive,
        enableFunFeatures: values.enableFunFeatures,
        revealParticipantIds:
          values.revealPolicy === RevealPolicy.SpecificParticipants
            ? values.revealParticipantIds
            : [],
        manageIssuesParticipantIds:
          values.issuesPolicy === IssuesPolicy.SpecificParticipants
            ? values.manageIssuesParticipantIds
            : [],
      });

      if (onSaved) {
        onSaved();
        return;
      }

      await navigate(from || appRoutes.myGames);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : modeCopy[mode].errorLabel,
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <Box className={styles.formShell}>
        <Box className={[formStyles.card, formStyles.cardAccentPurple].join(' ')}>
          <Stack
            className={styles.loadingState}
            alignItems="center"
            justifyContent="center"
          >
            <CircularProgress color="secondary" />
            <Typography className={styles.advancedHint}>
              Завантажуємо параметри гри…
            </Typography>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box className={styles.formShell}>
      <FormCard
        title={modeCopy[mode].title}
        icon={modeCopy[mode].icon}
        accent="purple"
        submitError={submitError}
        onSubmit={handleSubmit}
        onClose={onClose ?? handleClose}
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
        <Box className={styles.formContent}>
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
                <Typography className={styles.advancedTitle}>
                  Додаткові налаштування
                </Typography>
                <Typography className={styles.advancedHint}>
                  Права доступу, автовідкриття оцінок, середнє значення та countdown перед reveal.
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

            <Collapse
              in={advancedOpen}
              timeout={220}
              className={styles.advancedCollapse}
            >
              <Stack className={styles.optionsPanel}>
                <Box className={styles.optionRow}>
                  <Stack className={styles.optionCopy}>
                    <Typography className={styles.optionTitle}>
                      Хто може відкривати карти
                    </Typography>
                    <Typography className={styles.optionHint}>
                      Оберіть master, усіх учасників або конкретних учасників.
                    </Typography>
                  </Stack>

                  <TextField
                    select
                    size="small"
                    value={getAccessSelectValue(
                      values.revealPolicy,
                      values.revealParticipantIds,
                    )}
                    onChange={(event) => handleRevealAccessChange(event.target.value)}
                    SelectProps={{
                      multiple: true,
                      renderValue: (selected) =>
                        renderAccessValue(selected, participants),
                    }}
                    className={[formStyles.field, styles.optionControl].join(' ')}
                  >
                    <MenuItem value={MASTER_ONLY_VALUE}>Тільки master</MenuItem>
                    <MenuItem value={EVERYONE_VALUE}>Усі учасники</MenuItem>

                    {mode === 'edit' ? (
                      participants.map((participant) => (
                        <MenuItem key={participant.id} value={participant.id}>
                          {participant.displayName}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        Конкретних учасників можна вибрати після створення гри
                      </MenuItem>
                    )}
                  </TextField>
                </Box>

                <Box className={styles.optionRow}>
                  <Stack className={styles.optionCopy}>
                    <Typography className={styles.optionTitle}>
                      Хто може керувати issues
                    </Typography>
                    <Typography className={styles.optionHint}>
                      Оберіть master, усіх учасників або конкретних учасників.
                    </Typography>
                  </Stack>

                  <TextField
                    select
                    size="small"
                    value={getAccessSelectValue(
                      values.issuesPolicy,
                      values.manageIssuesParticipantIds,
                    )}
                    onChange={(event) => handleIssuesAccessChange(event.target.value)}
                    SelectProps={{
                      multiple: true,
                      renderValue: (selected) =>
                        renderAccessValue(selected, participants),
                    }}
                    className={[formStyles.field, styles.optionControl].join(' ')}
                  >
                    <MenuItem value={MASTER_ONLY_VALUE}>Тільки master</MenuItem>
                    <MenuItem value={EVERYONE_VALUE}>Усі учасники</MenuItem>

                    {mode === 'edit' ? (
                      participants.map((participant) => (
                        <MenuItem key={participant.id} value={participant.id}>
                          {participant.displayName}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        Конкретних учасників можна вибрати після створення гри
                      </MenuItem>
                    )}
                  </TextField>
                </Box>

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
                    onChange={handleBooleanSwitchChange('autoRevealCards')}
                    className={styles.optionSwitch}
                  />
                </Box>

                <Box className={styles.optionRow}>
                  <Stack className={styles.optionCopy}>
                    <Typography className={styles.optionTitle}>
                      Показувати середнє значення
                    </Typography>
                    <Typography className={styles.optionHint}>
                      Команда бачитиме average після відкриття карток.
                    </Typography>
                  </Stack>

                  <Switch
                    checked={values.showAverage}
                    onChange={handleBooleanSwitchChange('showAverage')}
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
                    onChange={handleBooleanSwitchChange('showCountdownAnimation')}
                    className={styles.optionSwitch}
                  />
                </Box>

                <Box className={styles.optionRow}>
                  <Stack className={styles.optionCopy}>
                    <Typography className={styles.optionTitle}>
                      Фан-фічі
                    </Typography>
                    <Typography className={styles.optionHint}>
                      Увімкнути додаткові фан-фічі для гри.
                    </Typography>
                  </Stack>

                  <Switch
                    checked={values.enableFunFeatures}
                    onChange={handleBooleanSwitchChange('enableFunFeatures')}
                    className={styles.optionSwitch}
                  />
                </Box>
              </Stack>
            </Collapse>
          </Box>
        </Box>
      </FormCard>
    </Box>
  );
};