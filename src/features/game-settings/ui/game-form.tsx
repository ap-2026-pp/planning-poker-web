import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Collapse,
  Grid,
  ListItemIcon,
  ListItemText,
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
import { IssuesPolicy, RevealPolicy, VotingSystem, votingSystemOptions } from '@entities/game';
import type { GameParticipant } from '@entities/participant';
import {
  createGameRequest,
  getGameRequest,
  getParticipantsRequest,
  updateGameRequest,
} from '@shared/api';
import { appRoutes } from '@shared/config/routes';
import { FormCard } from '@shared/ui/form-layout';
import formStyles from '@shared/ui/form-layout/form-layout.module.css';
import { validateSchema, type FormErrors } from '@shared/utils/yup';
import { createGameSchema } from '../model/game-settings-schema';
import styles from './game-form.module.css';

export type GameFormMode = 'create' | 'edit';

type GameFormValues = UpdateGamePayload & {
  hostDisplayName: string;
  revealAllowedParticipantIds: string[];
  issuesAllowedParticipantIds: string[];
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
  revealAllowedParticipantIds: [],
  issuesAllowedParticipantIds: [],
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
) => participants.find((participant) => participant.id === participantId)?.displayName;

const getParticipantInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const renderAccessValue = (
  selected: unknown,
  participants: GameParticipant[],
) => {
  const selectedValues = getMultiSelectValue(selected);

  if (selectedValues.includes(EVERYONE_VALUE)) {
    return 'All players';
  }

  if (
    selectedValues.includes(MASTER_ONLY_VALUE) ||
    selectedValues.length === 0
  ) {
    return 'Master only';
  }

  const names = selectedValues
    .map((id) => getParticipantNameById(participants, id))
    .filter(Boolean);

  return names.length ? names.join(', ') : 'Master only';
};

const getNextAccessState = <TPolicy extends RevealPolicy | IssuesPolicy>(
  rawValue: unknown,
  previousValue: string[],
  specificPolicy: TPolicy,
  everyonePolicy: TPolicy,
  masterOnlyPolicy: TPolicy,
) => {
  const selectedValues = getMultiSelectValue(rawValue);

  const addedValue = selectedValues.find((value) => !previousValue.includes(value));

  if (addedValue === MASTER_ONLY_VALUE) {
    return {
      policy: masterOnlyPolicy,
      participantIds: [],
    };
  }

  if (addedValue === EVERYONE_VALUE) {
    return {
      policy: everyonePolicy,
      participantIds: [],
    };
  }

  const participantIds = selectedValues.filter(
    (value) => value !== MASTER_ONLY_VALUE && value !== EVERYONE_VALUE,
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

type AccessSelectFieldProps = {
  label: string;
  helperText: string;
  value: string[];
  participants: GameParticipant[];
  mode: GameFormMode;
  onChange: (value: unknown) => void;
};

const AccessSelectField = ({
  label,
  helperText,
  value,
  participants,
  mode,
  onChange,
}: AccessSelectFieldProps) => {
  return (
    <Box className={styles.accessFieldWrap}>
      <TextField
        select
        fullWidth
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        SelectProps={{
          multiple: true,
          renderValue: (selected) => renderAccessValue(selected, participants),
          MenuProps: {
            PaperProps: {
              className: styles.accessMenuPaper,
            },
            MenuListProps: {
              className: styles.accessMenuList,
            },
          },
        }}
        className={[formStyles.field, styles.accessSelect].join(' ')}
      >
        <MenuItem value={MASTER_ONLY_VALUE} className={styles.accessMenuItem}>
          <ListItemText
            primary="Master only"
            secondary="Only the room master can perform this action."
            primaryTypographyProps={{ className: styles.accessMenuPrimary }}
            secondaryTypographyProps={{ className: styles.accessMenuSecondary }}
          />
        </MenuItem>

        <MenuItem value={EVERYONE_VALUE} className={styles.accessMenuItem}>
          <ListItemText
            primary="All players"
            secondary="Any active player can perform this action."
            primaryTypographyProps={{ className: styles.accessMenuPrimary }}
            secondaryTypographyProps={{ className: styles.accessMenuSecondary }}
          />
        </MenuItem>

        {mode === 'edit' ? (
          participants.map((participant) => (
            <MenuItem
              key={participant.id}
              value={participant.id}
              className={styles.accessMenuItem}
            >
              <ListItemIcon className={styles.accessParticipantIcon}>
                <Avatar className={styles.accessParticipantAvatar}>
                  {getParticipantInitials(participant.displayName)}
                </Avatar>
              </ListItemIcon>

              <ListItemText
                primary={participant.displayName}
                secondary={participant.isConnected ? 'online' : 'offline'}
                primaryTypographyProps={{ className: styles.accessMenuPrimary }}
                secondaryTypographyProps={{ className: styles.accessMenuSecondary }}
              />
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled className={styles.accessMenuItem}>
            <ListItemText
              primary="Specific players will be available after game creation"
              secondary="Create the room first, then choose players from settings."
              primaryTypographyProps={{ className: styles.accessMenuPrimary }}
              secondaryTypographyProps={{ className: styles.accessMenuSecondary }}
            />
          </MenuItem>
        )}
      </TextField>

      <Typography className={styles.accessHelperText}>
        {helperText}
      </Typography>
    </Box>
  );
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
          revealAllowedParticipantIds: gameParticipants
            .filter((participant) => participant.canRevealCards)
            .map((participant) => participant.id),
          issuesAllowedParticipantIds: gameParticipants
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
      const previousValue = getAccessSelectValue(
        current.revealPolicy,
        current.revealAllowedParticipantIds,
      );

      const nextAccess = getNextAccessState(
        rawValue,
        previousValue,
        RevealPolicy.SpecificParticipants,
        RevealPolicy.Everyone,
        RevealPolicy.MasterOnly,
      );

      return {
        ...current,
        revealPolicy: nextAccess.policy,
        revealAllowedParticipantIds: nextAccess.participantIds,
      };
    });

    setSubmitError(null);
  };

  const handleIssuesAccessChange = (rawValue: unknown) => {
    setValues((current) => {
      const previousValue = getAccessSelectValue(
        current.issuesPolicy,
        current.issuesAllowedParticipantIds,
      );

      const nextAccess = getNextAccessState(
        rawValue,
        previousValue,
        IssuesPolicy.SpecificParticipants,
        IssuesPolicy.Everyone,
        IssuesPolicy.MasterOnly,
      );

      return {
        ...current,
        issuesPolicy: nextAccess.policy,
        issuesAllowedParticipantIds: nextAccess.participantIds,
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

        revealAllowedParticipantIds:
          values.revealPolicy === RevealPolicy.SpecificParticipants
            ? values.revealAllowedParticipantIds
            : [],

        issuesAllowedParticipantIds:
          values.issuesPolicy === IssuesPolicy.SpecificParticipants
            ? values.issuesAllowedParticipantIds
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
                <Box className={styles.accessSettingsBlock}>
                  <AccessSelectField
                    label="Who can reveal cards"
                    helperText="Players who are allowed to flip cards and show results."
                    value={getAccessSelectValue(
                      values.revealPolicy,
                      values.revealAllowedParticipantIds,
                    )}
                    participants={participants}
                    mode={mode}
                    onChange={handleRevealAccessChange}
                  />

                  <AccessSelectField
                    label="Who can manage issues"
                    helperText="Players who are allowed to add, edit, delete and reorder issues."
                    value={getAccessSelectValue(
                      values.issuesPolicy,
                      values.issuesAllowedParticipantIds,
                    )}
                    participants={participants}
                    mode={mode}
                    onChange={handleIssuesAccessChange}
                  />
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
