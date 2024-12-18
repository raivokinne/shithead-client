import { GameBoardProps } from '@/types/game';
import { GameStatus } from './GameStatus';
import { CenterArea } from './CenterArea';
import { PlayerArea } from './PlayerArea';
import { SettingsDialog } from './settings/SettingsDialog';

export const GameBoard: React.FC<GameBoardProps> = ({
  players,
  currentPlayerIndex,
  playPile,
  remainingDeck,
  lastAction,
  onPlayCard,
  onDrawCard,
  isValidPlay,
  onPickUpPlayPile
}) => {
  const topCard = playPile[playPile.length - 1];

  const positions = {
    2: ['bottom', 'top'],
    3: ['bottom', 'right', 'left'],
    4: ['bottom', 'right', 'top', 'left'],
  };

  const currentPositions = positions[players.length as keyof typeof positions] || [];

  const getPlayerPosition = (index: number) => {
    const position = currentPositions[index];
    switch (position) {
      case 'top':
        return "absolute top-10 left-1/2 -translate-x-1/2 rotate-180";
      case 'right':
        return "absolute right-80 top-1/2 -translate-y-1/2 rotate-90";
      case 'bottom':
        return "absolute bottom-10 left-1/2 -translate-x-1/2";
      case 'left':
        return "absolute left-80 top-1/2 -translate-y-1/2 -rotate-90";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <GameStatus lastAction={lastAction} />
      <SettingsDialog />

      {players.map((player, index) => (
        <div key={player.id} className={getPlayerPosition(index)}>
          <PlayerArea
            player={player}
            isCurrentPlayer={currentPlayerIndex === index}
            onPlayCard={(card) => onPlayCard(index, card)}
            isValidPlay={isValidPlay}
            topCard={topCard}
            showFront={index === 0}
          />
        </div>
      ))}

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <CenterArea
          topCard={topCard}
          remainingDeck={remainingDeck}
          onDrawCard={onDrawCard}
          onPickUpPlayPile={onPickUpPlayPile}
        />
      </div>
    </div>
  );
};
