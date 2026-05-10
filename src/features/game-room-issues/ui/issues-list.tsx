import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Box, Stack, Typography } from '@mui/material';

import type { Issue } from '@entities/issue';
import styles from '@widgets/game-room-sidebar/ui/game-room-sidebar.module.css';

type IssuesListProps = {
  issues: Issue[];
  isCurrentParticipantMaster: boolean;
  onEditIssue: (issue: Issue) => void;
  onAddAnotherIssue: () => void;
};

export const IssuesList = ({
  issues,
  isCurrentParticipantMaster,
  onEditIssue,
  onAddAnotherIssue,
}: IssuesListProps) => {
  return (
    <>
      <Stack className={styles.issueList}>
        {issues.map((issue, index) => (
          <Box
            key={issue.id}
            className={styles.issueCard}
            onClick={() => {
              if (isCurrentParticipantMaster) {
                onEditIssue(issue);
              }
            }}
          >
            <Stack direction="row" className={styles.issueHeader}>
              <span
                className={[
                  styles.issueDot,
                  styles[`issueTone${index % 4}`],
                ].join(' ').trim()}
              />

              <Stack className={styles.issueText}>
                <Typography className={styles.issueTitle}>{issue.title}</Typography>

                <Typography className={styles.issueDescription}>
                  {issue.description || 'Опис ще не додано'}
                </Typography>
              </Stack>
            </Stack>

            <Box className={styles.issueFooter}>
              <Typography className={styles.issueMeta}>
                {issue.isCurrent
                  ? 'Активний зараз'
                  : issue.finalEstimate
                    ? `Фінальна оцінка: ${issue.finalEstimate}`
                    : 'Готово до наступного раунду'}
              </Typography>

              {issue.code ? (
                <Box className={styles.issueCodeBadge}>{issue.code}</Box>
              ) : null}
            </Box>
          </Box>
        ))}
      </Stack>

      {isCurrentParticipantMaster ? (
        <button
          type="button"
          className={styles.addAnotherIssueButton}
          onClick={onAddAnotherIssue}
        >
          <AddRoundedIcon />
          <span>Add another issue</span>
        </button>
      ) : null}
    </>
  );
};