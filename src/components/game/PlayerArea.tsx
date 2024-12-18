import { Card, Player } from '@/types/game';
import { PlayerHand } from './PlayerHand';
import { cn } from '@/lib/utils';

interface PlayerAreaProps {
  player: Player;
  isCurrentPlayer: boolean;
  onPlayCard: (card: Card) => void;
  isValidPlay: (card: Card, topCard?: Card) => boolean;
  topCard?: Card;
  showFront: boolean;
  className?: string;
  activeClassName?: string;
}

export const PlayerArea: React.FC<PlayerAreaProps> = ({
  player,
  isCurrentPlayer,
  onPlayCard,
  isValidPlay,
  topCard,
  showFront,
  className,
  activeClassName,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center space-y-4",
        className,
        isCurrentPlayer && activeClassName
      )}
    >
      <PlayerHand
        player={player}
        isCurrentPlayer={isCurrentPlayer}
        onPlayCard={onPlayCard}
        showFront={showFront}
        isValidPlay={isValidPlay}
        topCard={topCard}
      />
      <h3 className="font-semibold">{player.name}</h3>
    </div>
  );
};
