import { Button } from '@/components/ui/button';
import { instance } from '@/lib/axios';
import { Check, Loader2 } from 'lucide-react';

interface ReadyButtonProps {
  isReady: boolean;

  loading?: boolean;
  lobbyId: string | undefined
}

export function ReadyButton({
  isReady,
  loading = false,
  lobbyId
}: ReadyButtonProps) {
  async function handleToggleReady() {
    await instance.post(`/lobbies/${lobbyId}/ready`, { is_ready: !isReady });
  }

  return (
    <Button
      variant={isReady ? "default" : "outline"}
      className="w-full"
      onClick={handleToggleReady}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Check className={`mr-2 h-4 w-4 ${isReady ? 'opacity-100' : 'opacity-50'}`} />
      )}
      {isReady ? "Not Ready" : "Ready"}
    </Button>
  );
}
