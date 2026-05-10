import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import { Button, TextField } from '@mui/material';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

import { buildAuthRedirectPath, getAuthReturnTo, useSession } from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import { FormCard } from '@shared/ui/form-layout';
import { validateSchema, type FormErrors } from '@shared/utils/yup';
import { loginSchema } from '../model/login-schema';
import styles from '@shared/ui/form-layout/form-layout.module.css';

type LoginFormValues = {
  email: string;
  password: string;
};

const initialValues: LoginFormValues = {
  email: '',
  password: '',
};

export const LoginForm = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { login } = useSession();

  const [values, setValues] = useState<LoginFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<LoginFormValues>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const returnTo = getAuthReturnTo(search);
  const registerTo = buildAuthRedirectPath(appRoutes.register, returnTo);

  const handleFieldChange =
    (field: keyof LoginFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setSubmitError(null);
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const nextErrors = await validateSchema(loginSchema, values);

      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        return;
      }

      await login(values);
      await navigate(returnTo || appRoutes.home, { replace: true });
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