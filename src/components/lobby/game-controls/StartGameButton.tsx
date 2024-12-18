import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StartGameButtonProps {
  disabled: boolean;
  onStart: () => void;
  playersReady: number;
  totalPlayers: number;
}

export function StartGameButton({
  disabled,
  onStart,
  playersReady,
  totalPlayers
}: StartGameButtonProps) {
  const { toast } = useToast();

  const handleStartGame = () => {
    if (playersReady !== totalPlayers) {
      toast({
        title: 'Error',
        description: 'All players must be ready to start the game',
        variant: 'destructive',
      });
      return;
    }
    onStart();
  };

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={disabled}
      onClick={handleStartGame}
    >
      <PlayCircle className="mr-2 h-5 w-5" />
      Start Game
    </Button>
  );
}
