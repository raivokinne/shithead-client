import { GameState, Player } from '../types/game';

export const getNextPlayerIndex = (
  currentIndex: number,
  totalPlayers: number,
  extraTurn: boolean
): number => {
  if (extraTurn) {
    return currentIndex;
  }
  return (currentIndex + 1) % totalPlayers;
};

export const validateCurrentPlayer = (
  playerId: string,
  currentPlayer: Player
): boolean => {
  return playerId === currentPlayer.id;
};

export const shouldAdvanceTurn = (
  gameState: GameState,
  newPhase: string
): boolean => {
  return !gameState.extraTurn &&
         newPhase === gameState.phase &&
         gameState.playPile.length === 0;
};
