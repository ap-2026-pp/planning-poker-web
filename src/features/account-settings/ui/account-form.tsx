import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Collapse,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  changePasswordRequest,
  updateCurrentUserDisplayNameRequest,
} from '@shared/api';
import { useSession } from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import { FormCard } from '@shared/ui/form-layout';
import formStyles from '@shared/ui/form-layout/form-layout.module.css';
import { validateSchema, type FormErrors } from '@shared/utils/yup';
import {
  accountDisplayNameSchema,
  accountPasswordSchema,
} from '../model/account-settings-schemas';
import styles from './account-form.module.css';

type AccountDisplayNameValues = {
  displayName: string;
};

type AccountPasswordValues = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type LocationState = {
  from?: string;
};

type AccountFormProps = {
  onClose?: () => void;
  onSaved?: () => void;
};

const initialPasswordValues: AccountPasswordValues = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export const AccountForm = ({ onClose, onSaved }: AccountFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as LocationState | null)?.from;

  const { user, updateCurrentUser, logout } = useSession();

  const [displayNameValues, setDisplayNameValues] = useState<AccountDisplayNameValues>({
    displayName: user?.displayName ?? '',
  });

  const [displayNameErrors, setDisplayNameErrors] =
    useState<FormErrors<AccountDisplayNameValues>>({});
  const [displayNameSubmitError, setDisplayNameSubmitError] = useState<string | null>(null);
  const [displayNameSuccessMessage, setDisplayNameSuccessMessage] = useState<string | null>(null);
  const [displayNameSubmitting, setDisplayNameSubmitting] = useState(false);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordValues, setPasswordValues] =
    useState<AccountPasswordValues>(initialPasswordValues);
  const [passwordErrors, setPasswordErrors] =
    useState<FormErrors<AccountPasswordValues>>({});
  const [passwordSubmitError, setPasswordSubmitError] = useState<string | null>(null);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  useEffect(() => {
    setDisplayNameValues({
      displayName: user?.displayName ?? '',
    });
  }, [user?.displayName]);

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }

    navigate(from || appRoutes.home, { replace: true });
  };

  const handleDisplayNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDisplayNameValues({ displayName: event.target.value });
    setDisplayNameErrors({});
    setDisplayNameSubmitError(null);
    setDisplayNameSuccessMessage(null);
  };

  const handlePasswordChange =
    (field: keyof AccountPasswordValues) => (event: ChangeEvent<HTMLInputElement>) => {
      setPasswordValues((current) => ({ ...current, [field]: event.target.value }));
      setPasswordErrors((current) => ({ ...current, [field]: undefined }));
      setPasswordSubmitError(null);
    };

  const handleDisplayNameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setDisplayNameSubmitting(true);
    setDisplayNameSubmitError(null);
    setDisplayNameSuccessMessage(null);

    try {
      const normalizedValues = {
        displayName: displayNameValues.displayName.trim(),
      };

      const nextErrors = await validateSchema(
        accountDisplayNameSchema,
        normalizedValues,
      );

      if (Object.keys(nextErrors).length) {
        setDisplayNameErrors(nextErrors);
        return;
      }

      const updatedUser = await updateCurrentUserDisplayNameRequest(
        normalizedValues.displayName,
      );

      updateCurrentUser(updatedUser);

      setDisplayNameValues({
        displayName: updatedUser.displayName ?? '',
      });

      setDisplayNameSuccessMessage('Імʼя збережено.');

      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      setDisplayNameSubmitError(
        error instanceof Error ? error.message : 'Не вдалося зберегти імʼя',
      );
    } finally {
      setDisplayNameSubmitting(false);
    }
  };

  const handlePasswordSubmit = async () => {
    setPasswordSubmitting(true);
    setPasswordSubmitError(null);

    try {
      const nextErrors = await validateSchema(accountPasswordSchema, passwordValues);

      if (Object.keys(nextErrors).length) {
        setPasswordErrors(nextErrors);
        return;
      }

      await changePasswordRequest({
        oldPassword: passwordValues.oldPassword,
        newPassword: passwordValues.newPassword,
      });

      setPasswordValues(initialPasswordValues);

      try {
        await logout();
      } finally {
        await navigate(appRoutes.login, { replace: true });
      }
    } catch (error) {
      setPasswordSubmitError(
        error instanceof Error ? error.message : 'Не вдалося змінити пароль',
      );
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <FormCard
      title="Мій акаунт"
      icon={<ManageAccountsRoundedIcon fontSize="inherit" />}
      accent="purple"
      submitError={displayNameSubmitError}
      onSubmit={handleDisplayNameSubmit}
      onClose={handleClose}
    >
      {displayNameSuccessMessage ? (
        <Alert severity="success" className={formStyles.successAlert}>
          {displayNameSuccessMessage}
        </Alert>
      ) : null}

      <TextField
        className={formStyles.field}
        label="Email"
        value={user?.email ?? ''}
        fullWidth
        disabled
      />

      <TextField
        className={formStyles.field}
        label="Глобальне імʼя"
        value={displayNameValues.displayName}
        onChange={handleDisplayNameChange}
        error={Boolean(displayNameErrors.displayName)}
        helperText={displayNameErrors.displayName}
        fullWidth
        placeholder="Як вас бачитиме команда"
      />

      <Button
        type="submit"
        variant="contained"
        disabled={displayNameSubmitting}
        className={[formStyles.primaryButton, formStyles.primaryPurple].join(' ')}
      >
        {displayNameSubmitting ? 'Зберігаємо...' : 'Зберегти імʼя'}
      </Button>

      <Box className={styles.passwordSection}>
        <ButtonBase
          className={styles.passwordToggle}
          onClick={() => setPasswordOpen((current) => !current)}
        >
          <Stack className={styles.passwordHeaderText}>
            <Typography className={styles.passwordTitle}>Змінити пароль</Typography>
            <Typography className={styles.passwordHint}>
              Після зміни пароля потрібно буде увійти в акаунт знову.
            </Typography>
          </Stack>

          <ExpandMoreRoundedIcon
            className={[
              styles.passwordIcon,
              passwordOpen ? styles.passwordIconExpanded : '',
            ]
              .join(' ')
              .trim()}
          />
        </ButtonBase>

        <Collapse in={passwordOpen} timeout={220}>
          <Stack className={styles.passwordForm}>
            {passwordSubmitError ? (
              <Alert severity="error" className={formStyles.alert}>
                {passwordSubmitError}
              </Alert>
            ) : null}

            <Stack className={styles.passwordFields}>
              <TextField
                className={formStyles.field}
                type="password"
                label="Поточний пароль"
                value={passwordValues.oldPassword}
                onChange={handlePasswordChange('oldPassword')}
                error={Boolean(passwordErrors.oldPassword)}
                helperText={passwordErrors.oldPassword}
                fullWidth
                autoComplete="current-password"
              />

              <TextField
                className={formStyles.field}
                type="password"
                label="Новий пароль"
                value={passwordValues.newPassword}
                onChange={handlePasswordChange('newPassword')}
                error={Boolean(passwordErrors.newPassword)}
                helperText={passwordErrors.newPassword}
                fullWidth
                autoComplete="new-password"
              />

              <TextField
                className={formStyles.field}
                type="password"
                label="Підтвердження нового пароля"
                value={passwordValues.confirmPassword}
                onChange={handlePasswordChange('confirmPassword')}
                error={Boolean(passwordErrors.confirmPassword)}
                helperText={passwordErrors.confirmPassword}
                fullWidth
                autoComplete="new-password"
              />
            </Stack>

            <Button
              type="button"
              variant="outlined"
              disabled={passwordSubmitting}
              onClick={() => void handlePasswordSubmit()}
              className={styles.passwordButton}
            >
              {passwordSubmitting ? 'Змінюємо...' : 'Змінити пароль'}
            </Button>
          </Stack>
        </Collapse>
      </Box>
    </FormCard>
  );
};
