import { Alert, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import { useState, type ChangeEvent, type FormEvent } from 'react';

import { changePasswordRequest } from '@shared/api';
import { validateSchema, type FormErrors } from '@shared/utils/yup';
import { accountPasswordSchema } from '../model/account-schemas';
import styles from './account-form.module.css';

type AccountPasswordValues = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const initialValues: AccountPasswordValues = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export const AccountPasswordForm = () => {
  const [values, setValues] = useState<AccountPasswordValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors<AccountPasswordValues>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange =
    (field: keyof AccountPasswordValues) => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setSubmitError(null);
      setSuccessMessage(null);
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const nextErrors = await validateSchema(accountPasswordSchema, values);

      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        return;
      }

      await changePasswordRequest({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      setValues(initialValues);
      setSuccessMessage('Пароль успішно змінено.');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не вдалося змінити пароль');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className={styles.content}>
        <Stack component="form" className={styles.form} onSubmit={handleSubmit}>
          <Stack className={styles.intro}>
            <Typography variant="h5">Змінити пароль</Typography>
            <Typography variant="body2" color="text.secondary">
              Оновіть пароль акаунта, щоб зберегти доступ безпечним.
            </Typography>
          </Stack>

          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
          {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                type="password"
                label="Поточний пароль"
                value={values.oldPassword}
                onChange={handleChange('oldPassword')}
                error={Boolean(errors.oldPassword)}
                helperText={errors.oldPassword}
                fullWidth
                autoComplete="current-password"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                type="password"
                label="Новий пароль"
                value={values.newPassword}
                onChange={handleChange('newPassword')}
                error={Boolean(errors.newPassword)}
                helperText={errors.newPassword}
                fullWidth
                autoComplete="new-password"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                type="password"
                label="Підтвердіть новий пароль"
                value={values.confirmPassword}
                onChange={handleChange('confirmPassword')}
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword}
                fullWidth
                autoComplete="new-password"
              />
            </Grid>
          </Grid>

          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Оновлюємо...' : 'Змінити пароль'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
