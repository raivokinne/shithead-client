import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Copy, Share2 } from 'lucide-react';
import { instance } from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

interface LobbyControlsProps {
  lobbyId: string | undefined;
  isReady: boolean;
}

const LobbyControls = ({ lobbyId, isReady = false }: LobbyControlsProps) => {
  const [readyLoading, setReadyLoading] = useState(false);
  const [copying, setCopying] = useState(false);
  const { toast } = useToast();

  const handleReadyUp = async () => {
    setReadyLoading(true);
    try {
      await instance.post(`/lobbies/${lobbyId}/ready`);
      toast({
        title: isReady ? 'No Longer Ready' : 'Ready',
        description: isReady ? 'You are no longer ready to play' : 'You are now ready to play',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update ready status',
        variant: 'destructive',
      });
    } finally {
      setReadyLoading(false);
    }
  };

  const copyLobbyId = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(lobbyId!);
      toast({
        title: 'Copied',
        description: 'Lobby ID copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy lobby ID',
        variant: 'destructive',
      });
    } finally {
      setTimeout(() => setCopying(false), 1000);
    }
  };

  const shareLobbyLink = async () => {
    const lobbyUrl = `${window.location.origin}/lobbies/${lobbyId}/show`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join My Game Lobby',
          text: 'Click to join my game lobby!',
          url: lobbyUrl,
        });
        toast({
          title: 'Shared',
          description: 'Lobby link shared successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to share lobby link',
          variant: 'destructive',
        })
      }
    } else {
      await copyLobbyLink(lobbyUrl);
    }
  };

  const copyLobbyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Copied',
        description: 'Lobby link copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy lobby link',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <Button
        variant={isReady ? "default" : "outline"}
        className="w-full"
        onClick={handleReadyUp}
        disabled={isReady ? true : false}
      >
        {readyLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Check className={`mr-2 h-4 w-4 ${isReady ? 'opacity-100' : 'opacity-50'}`} />
        )}
        {isReady && "Ready"}
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={copyLobbyId}
          className="w-full"
        >
          {copying ? (
            <Check className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          Copy ID
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={shareLobbyLink}
          className="w-full"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  );
};

export default LobbyControls;
