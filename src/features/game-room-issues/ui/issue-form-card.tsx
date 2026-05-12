// issue-form-card.tsx

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { Box, Button, IconButton, InputAdornment, TextField } from '@mui/material';
import { useState, type FormEvent } from 'react';

import { type IssueDraft } from '../model/types';
import { FormCard } from '@shared/ui/form-layout';
import formStyles from '@shared/ui/form-layout/form-layout.module.css';
import styles from '@shared/ui/game-room-sidebar/game-room-issues.module.css';

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

    const normalizedValue = value
        .replace(/&nbsp;/g, ' ')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n');

    if (typeof window === 'undefined') {
        return normalizedValue.replace(/<[^>]*>/g, '').trim();
    }

    const parser = new DOMParser();
    const document = parser.parseFromString(normalizedValue, 'text/html');

    return (document.body.textContent ?? '')
        .replace(/\u00A0/g, ' ')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
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

    const formTitle = mode === 'edit' ? 'Редагувати issue' : 'Створити issue';

    const formSubtitle = isImported
        ? 'Цю задачу імпортовано з Plane. Назва, посилання та опис доступні лише для перегляду.'
        : mode === 'edit'
            ? 'Оновіть назву, код, посилання або опис задачі для поточного planning poker раунду.'
            : 'Додайте нову задачу до списку оцінювання.';

    const getFieldClassName = (extraClassName = '') =>
        [
            isDialog ? formStyles.field : styles.issueField,
            isDialog ? '' : styles.issueFieldBlue,
            extraClassName,
        ]
            .join(' ')
            .trim();

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

    const handleDialogSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!draft.title.trim() || isSubmitting) {
            return;
        }

        onSubmit();
    };

    const formFields = (
        <>
            <TextField
                fullWidth
                label={isDialog ? 'Назва issue' : undefined}
                placeholder={mode === 'create' ? 'Enter a title for the issue' : 'Issue title'}
                value={draft.title}
                onChange={(event) => onChange({ ...draft, title: event.target.value })}
                variant="outlined"
                disabled={isImported}
                className={getFieldClassName(isImported ? styles.issueReadonlyField : '')}
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
                        className={getFieldClassName()}
                    />

                    <TextField
                        fullWidth
                        label={isDialog ? 'Посилання' : undefined}
                        placeholder="Issue url"
                        value={draft.url}
                        onChange={(event) => onChange({ ...draft, url: event.target.value })}
                        variant="outlined"
                        className={getFieldClassName(isImported ? styles.issueReadonlyField : '')}
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
                        className={getFieldClassName(isImported ? styles.issueReadonlyField : '')}
                    />
                </>
            ) : null}
        </>
    );

    if (isDialog) {
        return (
            <FormCard
                title={formTitle}
                subtitle={formSubtitle}
                badge={isImported ? 'Readonly · imported from Plane' : undefined}
                icon={
                    mode === 'edit' ? (
                        <EditRoundedIcon fontSize="inherit" />
                    ) : (
                        <AddRoundedIcon fontSize="inherit" />
                    )
                }
                accent="purple"
                onSubmit={handleDialogSubmit}
                onClose={onCancel}
                actions={
                    <>
                        <Button
                            type="submit"
                            variant="contained"
                            className={[formStyles.primaryButton, formStyles.primaryPurple].join(' ')}
                            disabled={!draft.title.trim() || isSubmitting}
                        >
                            {isSubmitting ? 'Зберігаємо...' : 'Зберегти зміни'}
                        </Button>
                    </>
                }
            >
                {formFields}
            </FormCard>
        );
    }

    return (
        <Box className={styles.issueFormCard}>
            {formFields}

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