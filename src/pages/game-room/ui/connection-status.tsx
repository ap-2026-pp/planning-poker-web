import { Alert, Button, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';

type ConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected';

type ConnectionStatusProps = {
  status: ConnectionStatus;
  onRetry?: () => void;
};

export const ConnectionStatus = ({ status, onRetry }: ConnectionStatusProps) => {
  const [showRetry, setShowRetry] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (status === 'reconnecting') {
      setShowRetry(false);
      setShowSuccessMessage(false);
    } else if (status === 'disconnected') {
      const timer = setTimeout(() => setShowRetry(true), 3000);
      return () => clearTimeout(timer);
    } else if (status === 'connected') {
      setShowRetry(false);
      setShowSuccessMessage(true);
      const timer = setTimeout(() => setShowSuccessMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (showSuccessMessage && status === 'connected') {
    return (
      <Snackbar
        open
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success">З'єднання відновлено</Alert>
      </Snackbar>
    );
  }

  if (status === 'disconnected') {
    return (
      <Snackbar
        open
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          action={
            showRetry && onRetry ? (
              <Button color="inherit" size="small" onClick={onRetry}>
                Спробувати ще
              </Button>
            ) : null
          }
        >
          Не вдалося відновити з'єднання
        </Alert>
      </Snackbar>
    );
  }

  if (status === 'reconnecting') {
    return (
      <Snackbar
        open
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning">Відновлюємо з'єднання…</Alert>
      </Snackbar>
    );
  }

  if (status === 'connecting') {
    return (
      <Snackbar
        open
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="info">Підключення…</Alert>
      </Snackbar>
    );
  }

  return null;
};
