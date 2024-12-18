import { Player } from '@/types/game';
import { Button } from '@/components/ui/button';

interface GameOverProps {
  winner?: Player;
}

export const GameOver: React.FC<GameOverProps> = ({ winner }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-card p-8 rounded-lg text-center space-y-4">
        <h2 className="text-2xl font-bold">{winner?.name} wins!</h2>
        <Button
          onClick={() => window.location.reload()}
          className="w-full"
          size="lg"
        >
          Play Again
        </Button>
      </div>
    </div>
  );
};
