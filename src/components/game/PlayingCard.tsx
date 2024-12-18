import { Card } from '@/types/game';
import { cn } from '@/lib/utils';
import { CardHighlight } from '@/components/game/card/CardHighlight';
import { useSettings } from '@/hooks/use-settings';

interface PlayingCardProps {
  card: Card;
  showFront?: boolean;
  isPlayable?: boolean;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  showFront = true,
  isPlayable = false
}) => {
  const { showPlayableHints } = useSettings();

  return (
    <div className="relative">
      <div
        className={cn(
          "w-16 h-24 transition-transform",
          !showFront && "bg-black border-2 border-white",
          isPlayable && "cursor-pointer"
        )}
      >
        {showFront ? (
          <img
            src={card.image}
            alt={`${card.value} of ${card.suit}`}
            className="w-full h-full"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-2xl font-bold">♠️</div>
          </div>
        )}
      </div>
      <CardHighlight isPlayable={isPlayable} showHints={showPlayableHints} />
    </div>
  );
};
