import { Card, Player } from '@/types/game';

export const removeCardFromPlayer = (
  player: Player,
  cardToRemove: Card,
  currentPhase: 'hand' | 'faceUp' | 'faceDown'
) => {
  let updatedPlayer = { ...player };
  let newPhase = currentPhase;

  switch (currentPhase) {
    case 'hand':
      updatedPlayer.hand = updatedPlayer.hand.filter(card => card.code !== cardToRemove.code);

      if (updatedPlayer.hand.length === 0) {
        newPhase = 'faceUp';
      }
      break;

    case 'faceUp':
      updatedPlayer.faceUpCards = updatedPlayer.faceUpCards.filter(card => card.code !== cardToRemove.code);

      if (updatedPlayer.faceUpCards.length === 0) {
        newPhase = 'faceDown';
      }
      break;

    case 'faceDown':
      updatedPlayer.faceDownCards = updatedPlayer.faceDownCards.filter(card => card.code !== cardToRemove.code);
      break;
  }

  return {
    updatedPlayer,
    newPhase
  };
};

export const isWinner = (player: Player) =>
  player.hand.length === 0 &&
  player.faceUpCards.length === 0 &&
  player.faceDownCards.length === 0;
