export type EmojiReaction = {
  gameId: string;
  fromParticipantId: string;
  fromDisplayName?: string | null;
  toParticipantId: string;
  emoji: string;
  createdAt: string;
};

export type SendEmojiReactionPayload = {
  toParticipantId: string;
  emoji: string;
};
