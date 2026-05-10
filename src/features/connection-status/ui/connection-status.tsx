import { Alert, Button, Snackbar } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

type ConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected';

type ConnectionStatusProps = {
    status: ConnectionStatus;
    onRetry?: () => void;
};

export const ConnectionStatus = ({ status, onRetry }: ConnectionStatusProps) => {
    const [showRetry, setShowRetry] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [wasDisconnected, setWasDisconnected] = useState(false);
    const [hasBeenConnected, setHasBeenConnected] = useState(false);

    useEffect(() => {
        setWasDisconnected(false);
        setHasBeenConnected(false);
        setShowRetry(false);
        setShowSuccessMessage(false);
    }, []);

    useEffect(() => {
        if (status === 'reconnecting') {
            if (hasBeenConnected) {
                setWasDisconnected(true);
            }
            setShowRetry(false);
            setShowSuccessMessage(false);
            return;
        }

        if (status === 'disconnected') {
            if (hasBeenConnected) {
                setWasDisconnected(true);
            }

            const timer = setTimeout(() => setShowRetry(true), 3000);
            return () => clearTimeout(timer);
        }

        if (status === 'connected') {
            setHasBeenConnected(true);
            setShowRetry(false);

            if (wasDisconnected) {
                setShowSuccessMessage(true);
                setWasDisconnected(false);

                const timer = setTimeout(() => setShowSuccessMessage(false), 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [status, wasDisconnected, hasBeenConnected]);

    const snackbarConfig = useMemo(() => {
        if (showSuccessMessage && status === 'connected') {
            return {
                open: true,
                severity: 'success' as const,
                message: "З'єднання відновлено",
                action: null,
                autoHideDuration: 3000,
            };
        }

        if (status === 'disconnected' && hasBeenConnected) {
            return {
                open: true,
                severity: 'error' as const,
                message: "Не вдалося відновити з'єднання",
                action:
                    showRetry && onRetry ? (
                        <Button color="inherit" size="small" onClick={onRetry}>
                            Спробувати ще
                        </Button>
                    ) : null,
                autoHideDuration: null,
            };
        }

        if (status === 'reconnecting' && hasBeenConnected) {
            return {
                open: true,
                severity: 'warning' as const,
                message: "Відновлюємо з'єднання…",
                action: null,
                autoHideDuration: null,
            };
        }

        return {
            open: false,
            severity: 'info' as const,
            message: '',
            action: null,
            autoHideDuration: null,
        };
    }, [showSuccessMessage, status, hasBeenConnected, showRetry, onRetry]);

    return (
        <Snackbar
            open={snackbarConfig.open}
            autoHideDuration={snackbarConfig.autoHideDuration ?? undefined}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            slotProps={{
                transition: {
                    appear: false,
                },
            }}
        >
            <Alert severity={snackbarConfig.severity} action={snackbarConfig.action}>
                {snackbarConfig.message}
            </Alert>
        </Snackbar>
    );
};