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

    const lastHandledStatusRef = useRef<ConnectionStatus | null>(null);
    const hadSuccessfulConnectionRef = useRef(false);
    const pendingRecoveryRef = useRef(false);
    const onRetryRef = useRef(onRetry);
    const retryTimerRef = useRef<number | null>(null);

    useEffect(() => {
        onRetryRef.current = onRetry;
    }, [onRetry]);

    useEffect(() => {
        return () => {
            if (retryTimerRef.current !== null) {
                window.clearTimeout(retryTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (lastHandledStatusRef.current === status) {
            return;
        }

        lastHandledStatusRef.current = status;

        if (retryTimerRef.current !== null) {
            window.clearTimeout(retryTimerRef.current);
            retryTimerRef.current = null;
        }

        if (status === 'connected') {
            const shouldShowRestored =
                hadSuccessfulConnectionRef.current &&
                pendingRecoveryRef.current;

            hadSuccessfulConnectionRef.current = true;
            pendingRecoveryRef.current = false;

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
                pendingRecoveryRef.current = true;
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
                pendingRecoveryRef.current = true;
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
                        action: onRetryRef.current ? (
                            <Button color="inherit" size="small" onClick={onRetryRef.current}>
                                Спробувати ще
                            </Button>
                        ) : null,
                    });
                }, 3000);
            }
        }
    }, [status]);

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
