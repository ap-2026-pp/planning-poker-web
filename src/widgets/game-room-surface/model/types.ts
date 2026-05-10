import type { GameParticipant } from '@entities/participant';

export type PositionedParticipant = {
  participant: GameParticipant;
  left: string;
  top: string;
};

