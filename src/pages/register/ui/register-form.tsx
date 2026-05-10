import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import { Button, TextField } from '@mui/material';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

import { buildAuthRedirectPath, getAuthReturnTo, useSession } from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import { FormCard } from '@shared/ui/form-layout';
import { validateSchema, type FormErrors } from '@shared/utils/yup';
import { registerSchema } from '../model/register-schema';
import styles from '@shared/ui/form-layout/form-layout.module.css';

type RegisterFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

type LocationState = {
  from?: string;
};

const initialValues: RegisterFormValues = {
  email: '',
  password: '',
  confirmPassword: '',
};

const isAuthRoute = (path?: string) =>
  path === appRoutes.login || path === appRoutes.register;

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { search, state } = useLocation();
  const { register } = useSession();

  const returnTo = getAuthReturnTo(search);
  const from = (state as LocationState | null)?.from;
  const safeFrom = isAuthRoute(from) ? undefined : from;
  const fallbackPath = returnTo || safeFrom || appRoutes.home;

  const loginTo = buildAuthRedirectPath(appRoutes.login, fallbackPath);

  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<RegisterFormValues>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    navigate(fallbackPath, { replace: true });
  };

  const handleFieldChange =
    (field: keyof RegisterFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setSubmitError(null);
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const nextErrors = await validateSchema(registerSchema, values);

      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        return;
      }

      await register({
        email: values.email,
        password: values.password,
      });

      await navigate(fallbackPath, { replace: true });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не вдалося зареєструватися');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormCard
      badge="New account"
      title="Створити акаунт"
      subtitle="Усе просто: email, пароль і ви вже готові створювати кімнати для командних оцінок."
      icon={<HowToRegRoundedIcon fontSize="inherit" />}
      accent="purple"
      submitError={submitError}
      onSubmit={handleSubmit}
      onClose={handleClose}
      actions={
        <>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            className={[styles.primaryButton, styles.primaryPurple].join(' ')}
          >
            {submitting ? 'Створюємо акаунт...' : 'Зареєструватися'}
          </Button>

          <Button
            component={RouterLink}
            to={loginTo}
            state={{ from: fallbackPath }}
            variant="text"
            className={styles.secondaryButton}
          >
            Уже є акаунт? Увійти
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
        autoComplete="new-password"
        placeholder="Щонайменше 6 символів"
      />

      <TextField
        className={styles.field}
        label="Підтвердження пароля"
        type="password"
        value={values.confirmPassword}
        onChange={handleFieldChange('confirmPassword')}
        error={Boolean(errors.confirmPassword)}
        helperText={errors.confirmPassword}
        autoComplete="new-password"
        placeholder="Повторіть пароль"
      />
    </FormCard>
  );
};