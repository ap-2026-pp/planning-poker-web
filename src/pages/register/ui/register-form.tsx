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
import { registerSchema } from '../model/register-schema';
import styles from './register-form.module.css';

type RegisterFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

const initialValues: RegisterFormValues = {
  email: '',
  password: '',
  confirmPassword: '',
};

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useSession();
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<RegisterFormValues>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      await navigate(appRoutes.createGame);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не вдалося зареєструватися');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className={styles.content}>
        <Stack component="form" className={styles.form} onSubmit={handleSubmit}>
          <Stack className={styles.intro}>
            <Typography variant="h5">Створити акаунт</Typography>
            <Typography variant="body2" color="text.secondary">
              Усе просто: email, пароль і ви вже готові створювати кімнати для командних оцінок.
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
            autoComplete="new-password"
            placeholder="Щонайменше 6 символів"
          />

          <TextField
            label="Підтвердження пароля"
            type="password"
            value={values.confirmPassword}
            onChange={handleFieldChange('confirmPassword')}
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword}
            autoComplete="new-password"
            placeholder="Повторіть пароль"
          />

          <Stack className={styles.actions}>
            <Button type="submit" variant="contained" color="secondary" disabled={submitting}>
              {submitting ? 'Створюємо акаунт...' : 'Зареєструватися'}
            </Button>
            <Button component={RouterLink} to={appRoutes.login} variant="text">
              Уже є акаунт? Увійти
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
