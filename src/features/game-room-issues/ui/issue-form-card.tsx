import { Box, TextField } from '@mui/material';

import { type IssueDraft } from '../model/types';
import styles from '@widgets/game-room-sidebar/ui/game-room-sidebar.module.css';

type IssueFormCardProps = {
  mode: 'create' | 'edit';
  draft: IssueDraft;
  isSubmitting: boolean;
  onChange: (nextValue: IssueDraft) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

export const IssueFormCard = ({
  mode,
  draft,
  isSubmitting,
  onChange,
  onCancel,
  onSubmit,
}: IssueFormCardProps) => {
  return (
    <Box className={styles.issueFormCard}>
      <TextField
        fullWidth
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
            placeholder="Issue code / link"
            value={draft.code}
            onChange={(event) => onChange({ ...draft, code: event.target.value })}
            variant="outlined"
            className={styles.issueField}
          />

          <TextField
            fullWidth
            multiline
            minRows={4}
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
          Save
        </button>
      </Box>
    </Box>
  );
};