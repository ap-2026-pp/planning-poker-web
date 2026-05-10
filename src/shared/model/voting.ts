import { VotingSystem } from '@entities/game';

export type VoteDeckCard = {
  value: string;
  label: string;
  ariaLabel?: string;
};

export const votingSystemOptions = [
  {
    value: VotingSystem.Fibonacci,
    label: 'Fibonacci',
    hint: '1, 2, 3, 5, 8, 13...',
    cards: [
      { value: '0', label: '0' },
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '5', label: '5' },
      { value: '8', label: '8' },
      { value: '13', label: '13' },
      { value: '21', label: '21' },
      { value: '34', label: '34' },
      { value: '55', label: '55' },
      { value: '89', label: '89' },
      { value: 'coffee', label: '☕', ariaLabel: 'Пауза' },
      { value: 'unknown', label: '?', ariaLabel: 'Не знаю' },
    ],
  },
  {
    value: VotingSystem.TShirtSizes,
    label: 'T-shirt sizes',
    hint: 'XS, S, M, L, XL',
    cards: [
      { value: 'XS', label: 'XS' },
      { value: 'S', label: 'S' },
      { value: 'M', label: 'M' },
      { value: 'L', label: 'L' },
      { value: 'XL', label: 'XL' },
      { value: 'XXL', label: 'XXL' },
      { value: 'coffee', label: '☕', ariaLabel: 'Пауза' },
      { value: 'unknown', label: '?', ariaLabel: 'Не знаю' },
    ],
  },
  {
    value: VotingSystem.PowersOfTwo,
    label: 'Powers of two',
    hint: '1, 2, 4, 8, 16...',
    cards: [
      { value: '0', label: '0' },
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '4', label: '4' },
      { value: '8', label: '8' },
      { value: '16', label: '16' },
      { value: '32', label: '32' },
      { value: '64', label: '64' },
      { value: '128', label: '128' },
      { value: 'coffee', label: '☕', ariaLabel: 'Пауза' },
      { value: 'unknown', label: '?', ariaLabel: 'Не знаю' },
    ],
  },
  {
    value: VotingSystem.Custom,
    label: 'Custom',
    hint: 'Власні значення карт',
    cards: [
      { value: 'unknown', label: '?', ariaLabel: 'Не знаю' },
    ],
  },
] as const;

export const getVotingSystemLabel = (value: VotingSystem) =>
  votingSystemOptions.find((option) => option.value === value)?.label || 'Unknown';

export const getVotingSystemDeck = (
  value: VotingSystem,
  customCards?: readonly string[] | null,
): readonly VoteDeckCard[] => {
  if (value === VotingSystem.Custom) {
    const normalizedCards = [...new Set(
      (customCards ?? [])
        .map((card) => card.trim())
        .filter(Boolean),
    )];

    if (normalizedCards.length) {
      return normalizedCards.map((card) => ({
        value: card,
        label: card,
      }));
    }
  }

  return votingSystemOptions.find((option) => option.value === value)?.cards || votingSystemOptions[0].cards;
};