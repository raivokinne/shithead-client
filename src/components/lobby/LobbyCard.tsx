import { Lobby } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, AlertCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface LobbyCardProps {
  lobby: Lobby;
  onJoin: (lobbyId: number, password: string) => Promise<void>;
}

export function LobbyCard({ lobby, onJoin }: LobbyCardProps) {
  const isJoinable = lobby.status === 'waiting' && lobby.current_players < lobby.max_players;
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const joinParams: Parameters<typeof onJoin> = [lobby.id, ''];

      switch (lobby.privacy_level) {
        case 'password_protected':
          if (!password.trim()) {
            setError('Password is required');
            return;
          }
          joinParams.push(password);
          break;

        case 'invite_only':
          break;

        default:
          break;
      }

      await onJoin(...joinParams);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Failed to join lobby. Please try again.';

      toast({
        title: 'Join Lobby Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            {lobby.name}
            <span>#{lobby.id}</span>
          </span>
          <Badge variant={lobby.status === 'waiting' ? 'secondary' : 'outline'}>
            {lobby.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{lobby.current_players}/{lobby.max_players}</span>
            </div>
            <div>
              {formatDistanceToNow(lobby.created_at)} ago
              by {lobby.owner.name}
            </div>
          </div>

          {error && (
            <div className="flex items-center text-red-500 text-sm space-x-2 mb-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {lobby.privacy_level === 'open' && isJoinable && (
            <Button
              className="w-full"
              onClick={handleJoin}
            >
              {isLoading ? 'Joining...' : (isJoinable ? 'Join Game' : 'Full')}
            </Button>
          )}

          {lobby.privacy_level === 'invite_only' && (
            <div className="space-y-2">
              <Button
                onClick={handleJoin}
                disabled={!isJoinable || isLoading}
                className="w-full"
              >
                {isLoading ? 'Joining...' : (isJoinable ? 'Join Game' : 'Full')}
              </Button>
            </div>
          )}

          {lobby.privacy_level === 'password_protected' && (
            <div className="space-y-2">
              <Input
                type="password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                value={password}
                placeholder="Password"
                disabled={!isJoinable || isLoading}
              />
              <Button
                onClick={handleJoin}
                disabled={!isJoinable || isLoading}
                className="w-full"
              >
                {isLoading ? 'Joining...' : (isJoinable ? 'Join Game' : 'Full')}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
