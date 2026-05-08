import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';

import { updateCurrentUserDisplayNameRequest } from '@shared/api';
import { useSession } from '@shared/auth';
import { validateSchema, type FormErrors } from '@shared/utils/yup';
import { accountDisplayNameSchema } from '../model/account-schemas';
import styles from './account-form.module.css';

type AccountDisplayNameValues = {
  displayName: string;
};

export const AccountDisplayNameForm = () => {
  const { user, refreshCurrentUser } = useSession();
  const [values, setValues] = useState<AccountDisplayNameValues>({
    displayName: user?.displayName ?? '',
  });
  const [errors, setErrors] = useState<FormErrors<AccountDisplayNameValues>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValues({
      displayName: user?.displayName ?? '',
    });
  }, [user?.displayName]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ displayName: event.target.value });
    setErrors({});
    setSubmitError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const normalizedValues = {
        displayName: values.displayName.trim(),
      };
      const nextErrors = await validateSchema(accountDisplayNameSchema, normalizedValues);

      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors);
        return;
      }

      await updateCurrentUserDisplayNameRequest(normalizedValues.displayName);
      await refreshCurrentUser();
      setSuccessMessage('Глобальне імʼя оновлено.');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не вдалося оновити глобальне імʼя');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className={styles.content}>
        <Stack component="form" className={styles.form} onSubmit={handleSubmit}>
          <Stack className={styles.intro}>
            <Typography variant="h5">Глобальне імʼя</Typography>
            <Typography variant="body2" color="text.secondary">
              Це імʼя буде відображатися в акаунті та в авторизованому хедері.
            </Typography>
          </Stack>

          {submitError ? <Alert severity="error">{submitError}</Alert> : null}
          {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

          <TextField
            label="Глобальне імʼя"
            value={values.displayName}
            onChange={handleChange}
            error={Boolean(errors.displayName)}
            helperText={errors.displayName}
            fullWidth
            placeholder="Як вас бачить сервіс"
          />

          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Оновлюємо...' : 'Зберегти імʼя'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
