import { Box, Typography } from '@mui/material';
import { useState } from 'react';

import type { VoteDeckCard } from '@shared/model/voting';
import styles from './game-room-surface.module.css';

type VoteDeckProps = {
  deckValues: readonly VoteDeckCard[];
};

export const VoteDeck = ({ deckValues }: VoteDeckProps) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const handleSelectVote = (value: string) => {
    setSelectedValue((currentValue) => (currentValue === value ? null : value));

    // TODO: await voteRequest(value); when API will be ready
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
                onClick={() => handleSelectVote(card.value)}
                aria-label={card.ariaLabel ?? `Обрати оцінку ${card.label}`}
                aria-pressed={isSelected}
              >
                <span className={styles.voteValueInner}>{card.label}</span>
              </button>
            );
          })}
        </Box>
      </Box>

      <Typography className={styles.voteHint}>
        {selectedCard
          ? `Обрана оцінка: ${selectedCard.label}`
          : 'Натисніть на картку, щоб зробити оцінку'}
      </Typography>
    </Box>
  );
};