import { Card } from '@/types/game';
import { PlayingCard } from './PlayingCard';

interface CenterAreaProps {
  topCard?: Card;
  remainingDeck: number;
  onDrawCard: () => void;
  onPickUpPlayPile: () => void;
}

export const CenterArea: React.FC<CenterAreaProps> = ({
  topCard,
}) => {
  return (
    <div className="flex justify-center items-center gap-4">
      <div className="relative w-[68px] h-[100px] border-black border-2 rounded-sm">
        {topCard && <PlayingCard card={topCard} />}
      </div>
    </div>
  );
};
