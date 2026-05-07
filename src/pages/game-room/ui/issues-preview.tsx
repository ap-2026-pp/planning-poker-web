import {
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

import type { Issue } from '@entities/issue';
import styles from './issues-preview.module.css';

type IssuesPreviewProps = {
  issues: Issue[];
};

export const IssuesPreview = ({ issues }: IssuesPreviewProps) => {
  const sortedIssues = [...issues].sort((left, right) => left.order - right.order);

  return (
    <Card className={styles.card}>
      <CardContent>
        <Stack className={styles.stack}>
          <Stack direction="row" className={styles.header}>
            <Typography variant="h5">Список задач</Typography>
            <Chip label={`${sortedIssues.length} issues`} color="primary" variant="outlined" />
          </Stack>

          {sortedIssues.length ? (
            <List disablePadding>
              {sortedIssues.map((issue) => (
                <ListItem
                  key={issue.id}
                  className={styles.item}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" className={styles.itemPrimary}>
                        <Typography variant="subtitle1">{issue.title}</Typography>
                        {issue.code ? <Chip size="small" label={issue.code} /> : null}
                        {issue.isCurrent ? (
                          <Chip size="small" color="secondary" label="Активна зараз" />
                        ) : null}
                      </Stack>
                    }
                    secondary={
                      <Stack className={styles.itemSecondary}>
                        <Typography variant="body2" color="text.secondary">
                          {issue.description || 'Опис ще не заповнений'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Фінальна оцінка: {issue.finalEstimate || 'ще не визначено'}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Тут з’явиться список задач для оцінювання, щойно ви додасте перший item до сесії.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
