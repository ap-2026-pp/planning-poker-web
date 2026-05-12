import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded';
import { Box, Typography } from '@mui/material';

import sidebarStyles from '@shared/ui/game-room-sidebar/game-room-sidebar.module.css';
import styles from '@shared/ui/game-room-sidebar/game-room-issues.module.css';

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
        <Box className={sidebarStyles.issueEmptyState}>
          <Box className={sidebarStyles.footerIconWrap}>
            <PlaylistAddCheckRoundedIcon className={sidebarStyles.footerIcon} />
          </Box>

          <Typography className={sidebarStyles.footerTitle}>Ще немає issues</Typography>

          <Typography className={sidebarStyles.footerDescription}>
            {isCurrentParticipantMaster
              ? 'Додайте першу задачу, щоб відкрити раунд оцінювання.'
              : 'Master ще не додав задачі для оцінювання.'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};