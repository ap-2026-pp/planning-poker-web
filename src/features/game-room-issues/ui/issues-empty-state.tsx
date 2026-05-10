import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded';
import { Box, Typography } from '@mui/material';

import styles from '@widgets/game-room-sidebar/ui/game-room-sidebar.module.css';

type IssuesEmptyStateProps = {
  isCurrentParticipantMaster: boolean;
  onAddIssue: () => void;
};

export const IssuesEmptyState = ({
  isCurrentParticipantMaster,
  onAddIssue,
}: IssuesEmptyStateProps) => {
  return (
    <Box className={styles.issuesEmptyLayout}>
      <Box className={styles.issuesEmptyTop}>
        {isCurrentParticipantMaster ? (
          <Box
            component="button"
            type="button"
            className={styles.addIssueButton}
            onClick={onAddIssue}
          >
            <AddRoundedIcon />
            <span>Add issue</span>
          </Box>
        ) : null}
      </Box>

      <Box className={styles.issuesEmptyCenter}>
        <Box className={styles.issueEmptyState}>
          <Box className={styles.footerIconWrap}>
            <PlaylistAddCheckRoundedIcon className={styles.footerIcon} />
          </Box>

          <Typography className={styles.footerTitle}>Ще немає issues</Typography>

          <Typography className={styles.footerDescription}>
            {isCurrentParticipantMaster
              ? 'Додайте першу задачу, щоб відкрити раунд оцінювання.'
              : 'Master ще не додав задачі для оцінювання.'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};