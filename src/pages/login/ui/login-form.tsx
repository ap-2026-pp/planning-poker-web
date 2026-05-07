import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
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
    <Card>
      <CardContent className={styles.content}>
        <Stack component="form" className={styles.form} onSubmit={handleSubmit}>
          <Stack className={styles.intro}>
            <Typography variant="h5">Увійти</Typography>
            <Typography variant="body2" color="text.secondary">
              Поверніться до своїх сесій і продовжуйте оцінювання разом із командою.
            </Typography>
          </Stack>

          {submitError ? <Alert severity="error">{submitError}</Alert> : null}

          <TextField
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
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Входимо...' : 'Увійти'}
            </Button>
            <Button component={RouterLink} to={appRoutes.register} variant="text" color="secondary">
              Ще немає акаунта? Створити
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
