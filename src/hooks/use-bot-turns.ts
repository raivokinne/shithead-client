import { useEffect } from 'react';
import { Card, GameState, SPECIAL_CARDS } from '../types/game';

interface UseBotTurnProps {
  gameState: GameState;
  playCard: (playerId: string, card: Card) => void;
  drawCardFromDeck: () => void;
  isValidPlay: (card: Card, topCard?: Card) => boolean;
  handlePickUpPlayPile: () => void;
}

export const useBotTurn = ({
  gameState,
  playCard,
  drawCardFromDeck,
  isValidPlay,
  handlePickUpPlayPile
}: UseBotTurnProps) => {
  useEffect(() => {
    if (gameState.status === 'playing') {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      const topCard = gameState.playPile[gameState.playPile.length - 1];

      if (!currentPlayer.isHuman) {
        const botTurnTimeout = setTimeout(() => {
          const validCards = currentPlayer.hand.filter((card) =>
            isValidPlay(card, topCard)
          );

          if (validCards.length > 0) {
            const tenCard = validCards.find(card => card.value === SPECIAL_CARDS.TEN);
            const sixCard = validCards.find(card => card.value === SPECIAL_CARDS.SIX);

            const playCardCandidate = tenCard || sixCard || validCards[0];
            playCard(currentPlayer.id, playCardCandidate);
          } else if (gameState.remainingDeck > 0) {
            drawCardFromDeck();
          } else if (gameState.playPile.length > 0) {
            handlePickUpPlayPile();
          }
        }, 3000);

        return () => clearTimeout(botTurnTimeout);
      }
    }
  }, [gameState, playCard, drawCardFromDeck, isValidPlay, handlePickUpPlayPile]);
};
