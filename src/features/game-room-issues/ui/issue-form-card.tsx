import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { Box, Stack, TextField, Typography } from '@mui/material';

import { type IssueDraft } from '../model/types';
import styles from '@widgets/game-room-sidebar/ui/game-room-sidebar.module.css';

type IssueFormCardProps = {
    mode: 'create' | 'edit';
    variant?: 'sidebar' | 'dialog';
    draft: IssueDraft;
    isSubmitting: boolean;
    onChange: (nextValue: IssueDraft) => void;
    onCancel: () => void;
    onSubmit: () => void;
};

export const IssueFormCard = ({
    mode,
    variant = 'sidebar',
    draft,
    isSubmitting,
    onChange,
    onCancel,
    onSubmit,
}: IssueFormCardProps) => {
    const isDialog = variant === 'dialog';

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
                    <Box className={styles.issueFormIconShell}>
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
                        {mode === 'edit'
                            ? 'Оновіть назву, код або опис задачі для поточного planning poker раунду.'
                            : 'Додайте нову задачу до списку оцінювання.'}
                    </Typography>
                </Stack>
            ) : null}

            <TextField
                fullWidth
                label={isDialog ? 'Назва issue' : undefined}
                placeholder={mode === 'create' ? 'Enter a title for the issue' : 'Issue title'}
                value={draft.title}
                onChange={(event) => onChange({ ...draft, title: event.target.value })}
                variant="outlined"
                className={styles.issueField}
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
                        className={styles.issueField}
                    />

                    <TextField
                        fullWidth
                        label={isDialog ? 'Посилання' : undefined}
                        placeholder="Issue link"
                        value={draft.link}
                        onChange={(event) => onChange({ ...draft, link: event.target.value })}
                        variant="outlined"
                        className={styles.issueField}
                    />

                    <TextField
                        fullWidth
                        multiline
                        minRows={isDialog ? 5 : 4}
                        label={isDialog ? 'Опис' : undefined}
                        placeholder="Description"
                        value={draft.description}
                        onChange={(event) => onChange({ ...draft, description: event.target.value })}
                        variant="outlined"
                        className={styles.issueField}
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