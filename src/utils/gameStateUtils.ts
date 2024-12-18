import { GameState, Card } from '../types/game';

export const updateGameStateAfterDraw = (
  prevState: GameState,
  newCards: Card[],
  cardsToDraw: number
): GameState => {
  const updatedPlayers = prevState.players.map((player, index) =>
    index === prevState.currentPlayerIndex
      ? {
          ...player,
          hand: [...player.hand, ...newCards],
        }
      : player
  );

  return {
    ...prevState,
    players: updatedPlayers,
    remainingDeck: prevState.remainingDeck - cardsToDraw,
    currentPlayerIndex:
      (prevState.currentPlayerIndex + 1) % prevState.players.length,
  };
};
