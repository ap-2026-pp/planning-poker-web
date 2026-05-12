import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import { Button, TextField } from '@mui/material';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom';

import {
  buildAuthRedirectPath,
  getAuthExpectedEmail,
  getAuthReturnTo,
  isSessionExpiredRedirect,
  useSession,
} from '@shared/auth';
import { appRoutes, isGameRoomRoute } from '@shared/config/routes';
import { FormCard } from '@shared/ui/form-layout';
import { validateSchema, type FormErrors } from '@shared/utils/yup';
import { loginSchema } from '../model/login-schema';
import styles from '@shared/ui/form-layout/form-layout.module.css';

type LoginFormValues = {
  email: string;
  password: string;
};

type LocationState = {
  from?: string;
};

const initialValues: LoginFormValues = {
  email: '',
  password: '',
};

const isAuthRoute = (path?: string) =>
  path === appRoutes.login || path === appRoutes.register;

export const LoginForm = () => {
  const navigate = useNavigate();
  const { search, state } = useLocation();
  const { login, isAuthenticated, status, user } = useSession();

  const returnTo = getAuthReturnTo(search);
  const expectedEmail = getAuthExpectedEmail(search);
  const isSessionExpired = isSessionExpiredRedirect(search);
  const from = (state as LocationState | null)?.from;
  const safeFrom = isAuthRoute(from) ? undefined : from;
  const fallbackPath = returnTo || safeFrom || appRoutes.home;

  const registerTo = buildAuthRedirectPath(appRoutes.register, fallbackPath);

  const [values, setValues] = useState<LoginFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<LoginFormValues>>({});
  const [submitError, setSubmitError] = useState<string | null>(
    isSessionExpired ? 'Сесія в кімнаті закінчилась. Увійдіть знову, щоб продовжити.' : null,
  );
  const [submitting, setSubmitting] = useState(false);

  const resolvePostLoginPath = (email: string | null | undefined) => {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedExpectedEmail = expectedEmail?.trim().toLowerCase();

    if (
      isSessionExpired &&
      returnTo &&
      isGameRoomRoute(returnTo) &&
      (!normalizedExpectedEmail || normalizedEmail !== normalizedExpectedEmail)
    ) {
      return appRoutes.myGames;
    }

    return fallbackPath;
  };

  if (status !== 'loading' && isAuthenticated) {
    return <Navigate to={resolvePostLoginPath(user?.email ?? values.email)} replace />;
  }

  const handleClose = () => {
    navigate(appRoutes.home, { replace: true });
  };

  const handleFieldChange =
    (field: keyof LoginFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setSubmitError(null);
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const nextErrors = await validateSchema(loginSchema, values);

      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        return;
      }

      await login(values);

      await navigate(resolvePostLoginPath(values.email), {
        replace: true,
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не вдалося увійти');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormCard
      badge="Welcome back"
      title="Увійти"
      subtitle="Поверніться до своїх сесій і продовжуйте оцінювання разом із командою."
      icon={<LoginRoundedIcon fontSize="inherit" />}
      accent="blue"
      submitError={submitError}
      onSubmit={handleSubmit}
      onClose={handleClose}
      actions={
        <>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            className={[styles.primaryButton, styles.primaryBlue].join(' ')}
          >
            {submitting ? 'Входимо...' : 'Увійти'}
          </Button>

          <Button
            component={RouterLink}
            to={registerTo}
            state={{ from: fallbackPath }}
            variant="text"
            className={styles.secondaryButton}
          >
            Ще немає акаунта? Створити
          </Button>
        </>
      }
    >
      <TextField
        className={styles.field}
        label="Email"
        type="email"
        value={values.email}
        onChange={handleFieldChange('email')}
        error={Boolean(errors.email)}
        helperText={errors.email}
        autoComplete="email"
        placeholder="name@company.com"
      />

      <TextField
        className={styles.field}
        label="Пароль"
        type="password"
        value={values.password}
        onChange={handleFieldChange('password')}
        error={Boolean(errors.password)}
        helperText={errors.password}
        autoComplete="current-password"
        placeholder="Ваш пароль"
      />
    </FormCard>
  );
};
