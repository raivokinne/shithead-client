import { GameBoard } from '@/components/game/GameBoard';
import { GameSetup } from '@/components/game/GameSetup';
import { GameOver } from '@/components/game/GameOver';
import { useGameLogic } from '@/hooks/use-game-logic';
import { useBotTurn } from '@/hooks/use-bot-turns';

export default function Index() {
  const { gameState, startGame, playCard, drawCardFromDeck, isValidPlay, handlePickUpPlayPile } = useGameLogic();
  useBotTurn({ gameState, playCard, drawCardFromDeck, isValidPlay, handlePickUpPlayPile });

  return (
      <main className="min-h-screen bg-background text-foreground">
        {gameState.status === 'setup' && <GameSetup onStart={startGame} />}
        {gameState.status === 'playing' && (
          <GameBoard
            players={gameState.players}
            currentPlayerIndex={gameState.currentPlayerIndex}
            playPile={gameState.playPile}
            burnPile={gameState.burnPile}
            remainingDeck={gameState.remainingDeck}
            lastAction={gameState.lastAction}
            onPlayCard={(playerIndex, card) => playCard(gameState.players[playerIndex].id, card)}
            onDrawCard={drawCardFromDeck}
            isValidPlay={isValidPlay}
            onPickUpPlayPile={handlePickUpPlayPile}
          />
        )}
        {gameState.status === 'finished' && (
          <GameOver winner={gameState.players.find((p) => p.hand.length === 0)} />
        )}
      </main>
  );
}
