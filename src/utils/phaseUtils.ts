import { Player } from '../types/game';

export const determineNextPhase = (
  currentPhase: string,
  player: Player
): string => {
  if (player.hand.length > 0) {
    return 'hand';
  }

  if (currentPhase === 'hand' && player.faceUpCards.length > 0) {
    return 'faceUp';
  }

  if (currentPhase === 'faceUp' && player.faceDownCards.length > 0) {
    return 'faceDown';
  }

  return currentPhase;
};

export const canPlayInPhase = (
  player: Player,
  phase: string
): boolean => {
  switch (phase) {
    case 'hand':
      return true;
    case 'faceUp':
      return player.hand.length === 0;
    case 'faceDown':
      return player.hand.length === 0 && player.faceUpCards.length === 0;
    default:
      return false;
  }
};
