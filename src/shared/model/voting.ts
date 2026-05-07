import { VotingSystem } from '@entities/game';

export const votingSystemOptions = [
  {
    value: VotingSystem.Fibonacci,
    label: 'Fibonacci',
    hint: '1, 2, 3, 5, 8, 13...',
  },
  {
    value: VotingSystem.TShirtSizes,
    label: 'T-shirt sizes',
    hint: 'XS, S, M, L, XL',
  },
  {
    value: VotingSystem.PowersOfTwo,
    label: 'Powers of two',
    hint: '1, 2, 4, 8, 16...',
  },
  {
    value: VotingSystem.Custom,
    label: 'Custom',
    hint: 'Пізніше можна прив’язати до ваших власних карт',
  },
] as const;

export const getVotingSystemLabel = (value: VotingSystem) =>
  votingSystemOptions.find((option) => option.value === value)?.label || 'Unknown';
