import { Box, Typography } from '@mui/material';

import type { VoteDeckCard } from '@entities/game';
import styles from './game-room-surface.module.css';

type VoteDeckProps = {
  deckValues: readonly VoteDeckCard[];
  selectedValue: string | null;
  canVote: boolean;
  hasActiveIssue: boolean;
  isSubmitting: boolean;
  onSelectVote: (voteValue: string | null) => Promise<void>;
};

export const VoteDeck = ({
  deckValues,
  selectedValue,
  canVote,
  hasActiveIssue,
  isSubmitting,
  onSelectVote,
}: VoteDeckProps) => {
  const handleSelectVote = async (value: string) => {
    if (!canVote || isSubmitting) {
      return;
    }

    const nextVoteValue = selectedValue === value ? null : value;

    await onSelectVote(nextVoteValue);
  };

  const selectedCard = deckValues.find((card) => card.value === selectedValue);

  return (
    <Box className={styles.voteDeck}>
      <Box className={styles.voteDeckScroller}>
        <Box className={styles.voteDeckGrid}>
          {deckValues.map((card) => {
            const isSelected = selectedValue === card.value;

            return (
              <button
                key={card.value}
                type="button"
                className={[
                  styles.voteValueCard,
                  isSelected ? styles.voteValueCardSelected : '',
                ]
                  .join(' ')
                  .trim()}
                onClick={() => {
                  void handleSelectVote(card.value);
                }}
                aria-label={card.ariaLabel ?? `Обрати оцінку ${card.label}`}
                aria-pressed={isSelected}
                aria-disabled={!canVote || isSubmitting}
                disabled={!canVote}
              >
                <span className={styles.voteValueInner}>{card.label}</span>
              </button>
            );
          })}
        </Box>
      </Box>

      <Typography className={styles.voteHint}>
        {isSubmitting
          ? 'Зберігаємо оцінку...'
          : selectedCard
            ? `Ваша оцінка: ${selectedCard.label}. Натисніть ще раз, щоб скасувати або обрати іншу.`
            : !hasActiveIssue
              ? 'Оберіть активну задачу, щоб почати голосування'
              : !canVote
                ? 'Голосування зараз недоступне'
                : 'Натисніть на картку, щоб проголосувати'}
      </Typography>
    </Box>
  );
};
