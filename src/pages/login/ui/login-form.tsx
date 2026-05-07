import { useState, type ChangeEvent, type FormEvent } from 'react';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { useSession } from '@shared/auth';
import { appRoutes } from '@shared/config/routes';
import { validateSchema, type FormErrors } from '@shared/utils/yup';
import { loginSchema } from '../model/login-schema';
import styles from './login-form.module.css';

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
  const { login } = useSession();
  const [values, setValues] = useState<LoginFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<LoginFormValues>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      await navigate(appRoutes.createGame);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не вдалося увійти');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className={styles.card}>
      <Stack component="form" className={styles.form} onSubmit={handleSubmit}>
        <Box className={styles.badge}>Welcome back</Box>

        <Stack className={styles.intro}>
          <Box className={[styles.iconShell, styles.iconBlue].join(' ')}>
            <LoginRoundedIcon fontSize="inherit" />
          </Box>

          <Typography className={styles.title}>Увійти</Typography>

          <Typography className={styles.subtitle}>
            Поверніться до своїх сесій і продовжуйте оцінювання разом із командою.
          </Typography>
        </Stack>

        {submitError ? (
          <Alert severity="error" className={styles.alert}>
            {submitError}
          </Alert>
        ) : null}

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

        <Stack className={styles.actions}>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            className={[styles.primaryButton, styles.primaryBlue].join(' ')}
          >
            {submitting ? 'Входимо...' : 'Увійти'}
          </Button>
          <Button component={RouterLink} to={appRoutes.register} variant="text" className={styles.secondaryButton}>
            Ще немає акаунта? Створити
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
