import { Card, Player, GameState, VALUE_ORDER, SPECIAL_CARDS } from '../types/game';
import { getValidCardsForPlay } from './cardUtils';

export const shouldBotPickUpPile = (
  player: Player,
  gameState: GameState,
  topCard?: Card
): boolean => {
  if (gameState.remainingDeck === 0) {
    const availableCards = getCurrentPhaseCards(player, gameState.phase);
    const validCards = getValidCardsForPlay(availableCards, topCard);
    return validCards.length === 0;
  }
  return false;
};

export const getBotPlayStrategy = (
  player: Player,
  gameState: GameState,
  topCard?: Card
): { shouldPlay: boolean; cardToPlay?: Card } => {
  const availableCards = getCurrentPhaseCards(player, gameState.phase);
  const validCards = getValidCardsForPlay(availableCards, topCard);

  if (validCards.length === 0) {
    return { shouldPlay: false };
  }

  const tenCard = validCards.find(card => card.value === SPECIAL_CARDS.TEN);
  if (tenCard) {
    return { shouldPlay: true, cardToPlay: tenCard };
  }

  const sixCard = validCards.find(card => card.value === SPECIAL_CARDS.SIX);
  if (sixCard) {
    return { shouldPlay: true, cardToPlay: sixCard };
  }

  const sortedCards = [...validCards].sort(
    (a, b) => VALUE_ORDER.indexOf(b.value) - VALUE_ORDER.indexOf(a.value)
  );

  return { shouldPlay: true, cardToPlay: sortedCards[0] };
};

const getCurrentPhaseCards = (player: Player, phase: string): Card[] => {
  switch (phase) {
    case 'hand':
      return player.hand;
    case 'faceUp':
      return player.faceUpCards;
    case 'faceDown':
      return player.faceDownCards;
    default:
      return [];
  }
};
