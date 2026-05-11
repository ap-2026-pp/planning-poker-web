import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { Box, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import { type IssueDraft } from '../model/types';
import styles from '@widgets/game-room-sidebar/ui/game-room-sidebar.module.css';

type IssueFormCardProps = {
    mode: 'create' | 'edit';
    variant?: 'sidebar' | 'dialog';
    draft: IssueDraft;
    isImported?: boolean;
    isSubmitting: boolean;
    onChange: (nextValue: IssueDraft) => void;
    onCancel: () => void;
    onSubmit: () => void;
};

const htmlToPlainText = (value: string) => {
    if (!value) {
        return '';
    }

    if (typeof window === 'undefined') {
        return value.replace(/<[^>]*>/g, '').trim();
    }

    const parser = new DOMParser();
    const document = parser.parseFromString(value, 'text/html');

    return document.body.textContent?.trim() ?? '';
};

export const IssueFormCard = ({
    mode,
    variant = 'sidebar',
    draft,
    isImported = false,
    isSubmitting,
    onChange,
    onCancel,
    onSubmit,
}: IssueFormCardProps) => {
    const isDialog = variant === 'dialog';
    const descriptionValue = isImported ? htmlToPlainText(draft.description) : draft.description;

    const [isUrlCopied, setUrlCopied] = useState(false);

    const handleCopyIssueUrl = async () => {
        const url = draft.url.trim();

        if (!url) {
            return;
        }

        try {
            await navigator.clipboard.writeText(url);
            setUrlCopied(true);

            window.setTimeout(() => {
                setUrlCopied(false);
            }, 1400);
        } catch {
            setUrlCopied(false);
        }
    };

    return (
        <Box
            className={[
                styles.issueFormCard,
                isDialog ? styles.issueFormCardDialog : '',
            ]
                .join(' ')
                .trim()}
        >
            {isDialog ? (
                <Stack className={styles.issueFormIntro}>
                    <Box className={styles.issueFormIconShellBlue}>
                        {mode === 'edit' ? (
                            <EditRoundedIcon fontSize="inherit" />
                        ) : (
                            <AddRoundedIcon fontSize="inherit" />
                        )}
                    </Box>

                    <Typography className={styles.issueFormTitle}>
                        {mode === 'edit' ? 'Редагувати issue' : 'Створити issue'}
                    </Typography>

                    <Typography className={styles.issueFormSubtitle}>
                        {isImported
                            ? 'Цю задачу імпортовано з Plane. Назва, посилання та опис доступні лише для перегляду.'
                            : mode === 'edit'
                                ? 'Оновіть назву, код, посилання або опис задачі для поточного planning poker раунду.'
                                : 'Додайте нову задачу до списку оцінювання.'}
                    </Typography>

                    {isImported ? (
                        <Box className={styles.readonlyBadge}>
                            <LockRoundedIcon fontSize="small" />
                            <span>Readonly · imported from Plane</span>
                        </Box>
                    ) : null}
                </Stack>
            ) : null}

            <TextField
                fullWidth
                label={isDialog ? 'Назва issue' : undefined}
                placeholder={mode === 'create' ? 'Enter a title for the issue' : 'Issue title'}
                value={draft.title}
                onChange={(event) => onChange({ ...draft, title: event.target.value })}
                variant="outlined"
                disabled={isImported}
                className={[
                    styles.issueField,
                    styles.issueFieldBlue,
                    isImported ? styles.issueReadonlyField : '',
                ]
                    .join(' ')
                    .trim()}
            />

            {mode === 'edit' ? (
                <>
                    <TextField
                        fullWidth
                        label={isDialog ? 'Код' : undefined}
                        placeholder="Issue code"
                        value={draft.code}
                        onChange={(event) => onChange({ ...draft, code: event.target.value })}
                        variant="outlined"
                        className={[styles.issueField, styles.issueFieldBlue].join(' ')}
                    />

                    <TextField
                        fullWidth
                        label={isDialog ? 'Посилання' : undefined}
                        placeholder="Issue url"
                        value={draft.url}
                        onChange={(event) => onChange({ ...draft, url: event.target.value })}
                        variant="outlined"
                        className={[
                            styles.issueField,
                            styles.issueFieldBlue,
                            isImported ? styles.issueReadonlyField : '',
                        ]
                            .join(' ')
                            .trim()}
                        InputProps={{
                            readOnly: isImported,
                            endAdornment: draft.url ? (
                                <InputAdornment position="end">
                                    <IconButton
                                        type="button"
                                        className={styles.issueCopyButton}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            void handleCopyIssueUrl();
                                        }}
                                        edge="end"
                                        aria-label="Скопіювати посилання issue"
                                    >
                                        {isUrlCopied ? (
                                            <CheckRoundedIcon fontSize="small" />
                                        ) : (
                                            <ContentCopyRoundedIcon fontSize="small" />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        }}
                    />

                    <TextField
                        fullWidth
                        multiline
                        minRows={isDialog ? 5 : 4}
                        label={isDialog ? 'Опис' : undefined}
                        placeholder="Description"
                        value={descriptionValue}
                        onChange={(event) => onChange({ ...draft, description: event.target.value })}
                        variant="outlined"
                        disabled={isImported}
                        className={[
                            styles.issueField,
                            styles.issueFieldBlue,
                            isImported ? styles.issueReadonlyField : '',
                        ]
                            .join(' ')
                            .trim()}
                    />
                </>
            ) : null}

            <Box className={styles.issueFormActions}>
                <button
                    type="button"
                    className={styles.issueSecondaryButton}
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    className={styles.issuePrimaryButton}
                    onClick={onSubmit}
                    disabled={!draft.title.trim() || isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Save'}
                </button>
            </Box>
        </Box>
    );
};