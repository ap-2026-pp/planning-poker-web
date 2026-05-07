import { VotingSystem } from '@entities/game';

export const votingSystemOptions = [
  {
    value: VotingSystem.Fibonacci,
    label: 'Fibonacci',
    hint: '1, 2, 3, 5, 8, 13...',
    cards: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?'],
  },
  {
    value: VotingSystem.TShirtSizes,
    label: 'T-shirt sizes',
    hint: 'XS, S, M, L, XL',
    cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?'],
  },
  {
    value: VotingSystem.PowersOfTwo,
    label: 'Powers of two',
    hint: '1, 2, 4, 8, 16...',
    cards: ['0', '1', '2', '4', '8', '16', '32', '64', '128', '?'],
  },
  {
    value: VotingSystem.Custom,
    label: 'Custom',
    hint: 'Пізніше можна прив’язати до ваших власних карт',
    cards: ['?', '?', '?'],
  },
] as const;

export const getVotingSystemLabel = (value: VotingSystem) =>
  votingSystemOptions.find((option) => option.value === value)?.label || 'Unknown';

export const getVotingSystemDeck = (value: VotingSystem) =>
  votingSystemOptions.find((option) => option.value === value)?.cards || votingSystemOptions[0].cards;
