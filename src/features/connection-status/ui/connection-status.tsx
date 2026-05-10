import { Alert, Button, Snackbar } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

type ConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected';

type ConnectionStatusProps = {
    status: ConnectionStatus;
    onRetry?: () => void;
};

type SnackbarState =
    | {
        open: false;
        severity: 'info';
        message: '';
        action: null;
        autoHideDuration?: number;
    }
    | {
        open: true;
        severity: 'success' | 'warning' | 'error';
        message: string;
        action: React.ReactNode;
        autoHideDuration?: number;
    };

export const ConnectionStatus = ({ status, onRetry }: ConnectionStatusProps) => {
    const [snackbarState, setSnackbarState] = useState<SnackbarState>({
        open: false,
        severity: 'info',
        message: '',
        action: null,
    });

    const previousStatusRef = useRef<ConnectionStatus>('connecting');
    const hadSuccessfulConnectionRef = useRef(false);
    const retryTimerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (retryTimerRef.current !== null) {
                window.clearTimeout(retryTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const previousStatus = previousStatusRef.current;

        if (retryTimerRef.current !== null) {
            window.clearTimeout(retryTimerRef.current);
            retryTimerRef.current = null;
        }

        if (status === 'connected') {
            const shouldShowRestored =
                hadSuccessfulConnectionRef.current &&
                (previousStatus === 'reconnecting' || previousStatus === 'disconnected');

            hadSuccessfulConnectionRef.current = true;

            if (shouldShowRestored) {
                setSnackbarState({
                    open: true,
                    severity: 'success',
                    message: "З'єднання відновлено",
                    action: null,
                    autoHideDuration: 3000,
                });
            } else {
                setSnackbarState({
                    open: false,
                    severity: 'info',
                    message: '',
                    action: null,
                });
            }
        }

        if (status === 'reconnecting') {
            if (hadSuccessfulConnectionRef.current) {
                setSnackbarState({
                    open: true,
                    severity: 'warning',
                    message: "Відновлюємо з'єднання…",
                    action: null,
                });
            }
        }

        if (status === 'disconnected') {
            if (hadSuccessfulConnectionRef.current) {
                setSnackbarState({
                    open: true,
                    severity: 'error',
                    message: "Не вдалося відновити з'єднання",
                    action: null,
                });

                retryTimerRef.current = window.setTimeout(() => {
                    setSnackbarState({
                        open: true,
                        severity: 'error',
                        message: "Не вдалося відновити з'єднання",
                        action: onRetry ? (
                            <Button color="inherit" size="small" onClick={onRetry}>
                                Спробувати ще
                            </Button>
                        ) : null,
                    });
                }, 3000);
            }
        }

        previousStatusRef.current = status;
    }, [status, onRetry]);

    const handleClose = (_?: unknown, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackbarState({
            open: false,
            severity: 'info',
            message: '',
            action: null,
        });
    };

    return (
        <Snackbar
            open={snackbarState.open}
            autoHideDuration={snackbarState.autoHideDuration}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            slotProps={{
                transition: {
                    appear: false,
                },
            }}
        >
            <Alert
                severity={snackbarState.severity === 'info' ? 'info' : snackbarState.severity}
                action={snackbarState.action}
                onClose={handleClose}
            >
                {snackbarState.message}
            </Alert>
        </Snackbar>
    );
};