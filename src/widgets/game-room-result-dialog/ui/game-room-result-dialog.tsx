import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
} from '@mui/material';

import type { RoomRoundResult, VoteDeckCard } from '@entities/game';
import type { VoteResult } from '@entities/history';
import {
  RoundResultsPanel,
  type VoteDistributionItem,
} from '@widgets/game-room-surface/ui/round-results-panel';
import styles from './game-room-result-dialog.module.css';

export type GameRoomResultDialogData = {
  issueId: string;
  issueName: string;
  issueCode?: string | null;
  roundResult: RoomRoundResult;
  playerResults?: VoteResult[];
};

type GameRoomResultDialogProps = {
  open: boolean;
  loading: boolean;
  error: string | null;
  data: GameRoomResultDialogData | null;
  deckValues: readonly VoteDeckCard[];
  showAverage: boolean;
  onClose: () => void;
};

export const GameRoomResultDialog = ({
  open,
  loading,
  error,
  data,
  deckValues,
  showAverage,
  onClose,
}: GameRoomResultDialogProps) => {
  const playerResults = data?.playerResults ?? [];
  const safeDeckValues = deckValues ?? [];

  const distributionByValue = new Map<string, number>();

  playerResults.forEach((playerResult) => {
    if (!playerResult.voteValue) {
      return;
    }

    distributionByValue.set(
      playerResult.voteValue,
      (distributionByValue.get(playerResult.voteValue) ?? 0) + 1,
    );
  });

  const deckValueSet = new Set(safeDeckValues.map((card) => card.value));

  const distributionValues = [
    ...safeDeckValues
      .map((card) => card.value)
      .filter((value) => distributionByValue.has(value)),

    ...Array.from(distributionByValue.keys()).filter(
      (value) => !deckValueSet.has(value),
    ),
  ];

  const distribution: VoteDistributionItem[] = distributionValues.map((value) => ({
    value,
    label:
      safeDeckValues.find((card) => card.value === value)?.label ??
      (value === 'coffee' ? '☕' : value),
    count: distributionByValue.get(value) ?? 0,
  }));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        className: styles.paper,
      }}
      BackdropProps={{
        className: styles.backdrop,
      }}
    >
      <Box className={styles.header}>
        <Box className={styles.titleBlock}>
          <Typography className={styles.eyebrow}>
            Результат раунду
          </Typography>

          <Typography className={styles.title}>
            {data
              ? `${data.issueCode ? `${data.issueCode} · ` : ''}${data.issueName}`
              : 'Завантажуємо результат'}
          </Typography>

          {data ? (
            <Typography className={styles.subtitle}>
              Фінальна оцінка: {data.roundResult.finalEstimate}
            </Typography>
          ) : null}
        </Box>

        <IconButton
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Закрити результат"
        >
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      <DialogContent className={styles.content}>
        {loading ? (
          <Box className={styles.loaderWrap}>
            <CircularProgress color="secondary" />
          </Box>
        ) : null}

        {!loading && error ? (
          <Alert severity="warning" className={styles.errorAlert}>
            {error}
          </Alert>
        ) : null}

        {!loading && !error && data ? (
          <RoundResultsPanel
            distribution={distribution}
            roundResult={data.roundResult}
            showAverage={showAverage}
            playerResults={playerResults}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};